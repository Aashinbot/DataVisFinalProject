const crimeTypeColors = {
    "arson and criminal damage": "#1f77b4", // Blue
    "burglary": "#ff7f0e",                  // Orange
    "drug offences": "black",
    "fraud and forgery": "#d62728",        // Red
    "miscellaneous crimes against society": "#9467bd", // Purple
    "possession of weapons": "#8c564b",    // Brown
    "public order offences": "#e377c2",    // Pink
    "sexual offences": "#7f7f7f",          // Gray
    "theft": "#bcbd22",                    // Olive
    "vehicle offences": "#17becf",         // Cyan
    "violence against the person": "#1f77b4" // Blue
};

const orderedCrimeTypes = [
    "arson and criminal damage",
    "burglary",
    "drug offences",
    "fraud and forgery",
    "miscellaneous crimes against society",
    "possession of weapons",
    "public order offences",
    "sexual offences",
    "theft",
    "vehicle offences",
    "violence against the person"
];


function showLineGraph(borough, combinedData, greenPercentage=null, populationaverage=null) {
    d3.select("#chart-container").remove();

    const overlay = d3.select("body").append("div")
    .attr("id", "chart-overlay")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "rgba(0, 0, 0, 0.5)") 
    .style("z-index", "999") 
    .on("click", () => {
        overlay.remove();
        d3.select("#chart-container").remove();
    });

const greenGradient = greenPercentage !== null
    ? `linear-gradient(to top, rgb(146, 168, 4) ${greenPercentage}%, white ${greenPercentage}%)`
    : "white"; 

const chartContainer = overlay.append("div")
    .attr("id", "chart-container")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "50px")
    .style("width", "1000px") 
    .style("height", "800px") 
    .style("background", greenGradient) 
    .style("border", "1px solid black")
    .style("padding", "10px")
    .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.3)")
    .style("z-index", "1000")
    .on("click", (event) => {
        event.stopPropagation();
    });

chartContainer.append("h3")
    .text(greenPercentage !== null
        ? `Crime Trends in ${borough.name} (2012-2024) - ${greenPercentage}% Green Space`
        : `Crime Trends in ${borough.name} (2012-2024)`)
    .style("text-align", "center");

    const margin = { top: 40, right: 50, bottom: 100, left: 50 }; 
    const width = 900 - margin.left - margin.right; 
    const height = 600 - margin.top - margin.bottom;

    const svg = chartContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50) 
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = Array.from({ length: 13 }, (_, i) => 2012 + i);

    const xScale = d3.scaleLinear()
        .domain([2012, 2024])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(orderedCrimeTypes.flatMap(type => years.map(year => combinedData[type]?.[year] || 0)))])
        .range([height, 0]);

    const highlightStart = xScale(2020); 
    const highlightEnd = xScale(2021); 
    svg.append("rect")
        .attr("x", highlightStart)
        .attr("y", 0)
        .attr("width", highlightEnd - highlightStart)
        .attr("height", height)
        .attr("fill", "rgba(255, 0, 0, 0.2)") 
        .attr("stroke", "red") 
        .attr("stroke-width", 1)
        .append("title")
        .text("COVID-19 Lockdowns (2020-2021)");

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(yScale));

    const lines = {};
    orderedCrimeTypes.forEach((crimeType) => {
        if (!combinedData[crimeType]) return; 

        const crimeData = years.map(year => ({
            year,
            value: combinedData[crimeType]?.[year] || 0
        }));

        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        lines[crimeType] = svg.append("path")
            .datum(crimeData)
            .attr("fill", "none")
            .attr("stroke", crimeTypeColors[crimeType] || "#000")
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("class", `line-${crimeType}`);
    });

    const legend = chartContainer.append("div")
        .attr("id", "legend-container")
        .style("display", "flex")
        .style("flex-wrap", "wrap") 
        .style("justify-content", "center") 
        .style("position", "absolute")
        .style("bottom", "20px") 
        .style("left", "50px")
        .style("width", "900px");

    let activeCrimeType = null; 

    orderedCrimeTypes.forEach((crimeType) => {
        if (!combinedData[crimeType]) return;

        const legendItem = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px 10px") 
            .style("cursor", "pointer")
            .on("click", () => {
                if (activeCrimeType === crimeType) {
                    Object.values(lines).forEach(line => line.style("display", null));
                    activeCrimeType = null;
                } else {
                    Object.entries(lines).forEach(([type, line]) => {
                        line.style("display", type === crimeType ? null : "none");
                    });
                    activeCrimeType = crimeType;
                }
            });

        legendItem.append("div")
            .style("width", "20px") 
            .style("height", "20px") 
            .style("background-color", crimeTypeColors[crimeType] || "#000")
            .style("margin-right", "5px");

        legendItem.append("span")
            .text(crimeType)
            .style("font-size", "12px") 
            .style("white-space", "nowrap") 
            .style("overflow", "hidden") 
            .style("text-overflow", "ellipsis") 
            .style("max-width", "150px"); 
    });

    

    chartContainer.append("button")
        .text("Close")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("padding", "8px 12px") 
        .style("border", "none")
        .style("background", "#d9534f")
        .style("color", "white")
        .style("cursor", "pointer")
        .on("click", () => {
            overlay.remove(); 
            chartContainer.remove(); 
        });
}