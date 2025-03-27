function showLineGraph(borough, combinedData) {
    // Remove any existing chart
    d3.select("#chart-container").remove();

    // Create a modal-like div to hold the chart
    const chartContainer = d3.select("body").append("div")
        .attr("id", "chart-container")
        .style("position", "absolute")
        .style("top", "50px")
        .style("left", "50px")
        .style("width", "750px") // Increased width to accommodate the legend
        .style("height", "700px")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "10px")
        .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.3)")
        .style("z-index", "1000");

    chartContainer.append("h3")
        .text(`Crime Trends in ${borough.name} (2012-2024)`) // Updated title to reflect the new range
        .style("text-align", "center");

    // Set up dimensions
    const margin = { top: 40, right: 150, bottom: 50, left: 60 }; // Increased right margin for the legend
    const width = 650 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = chartContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract crime types and years
    const crimeTypes = Object.keys(combinedData);
    const years = Array.from({ length: 13 }, (_, i) => 2012 + i); // Generate years from 2012 to 2024

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([2012, 2024]) // Updated to exclude 2025
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(crimeTypes.flatMap(type => years.map(year => combinedData[type]?.[year] || 0)))])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // Format years as integers

    svg.append("g").call(d3.axisLeft(yScale));

    const lines = {};
    crimeTypes.forEach((crimeType, crimeIndex) => {
        const crimeData = years.map(year => ({
            year,
            value: combinedData[crimeType]?.[year] || 0
        }));

        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX); // Smooth the line

        lines[crimeType] = svg.append("path")
            .datum(crimeData)
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[crimeIndex])
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("class", `line-${crimeType}`);
    });

    // Add legend outside the graph
    const legend = chartContainer.append("div")
        .attr("id", "legend-container")
        .style("position", "absolute")
        .style("top", "60px")
        .style("right", "20px")
        .style("width", "120px");

    let activeCrimeType = null; // Track the currently active crime type

    crimeTypes.forEach((crimeType, crimeIndex) => {
        const legendItem = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px")
            .style("cursor", "pointer")
            .on("click", () => {
                if (activeCrimeType === crimeType) {
                    // If the same crime type is clicked again, show all lines
                    Object.values(lines).forEach(line => line.style("display", null));
                    activeCrimeType = null;
                } else {
                    // Hide all lines except the selected one
                    Object.entries(lines).forEach(([type, line]) => {
                        line.style("display", type === crimeType ? null : "none");
                    });
                    activeCrimeType = crimeType;
                }
            });

        legendItem.append("div")
            .style("width", "20px")
            .style("height", "20px")
            .style("background-color", d3.schemeCategory10[crimeIndex])
            .style("margin-right", "10px");

        legendItem.append("span")
            .text(crimeType)
            .style("font-size", "14px");
    });

    // Close button
    chartContainer.append("button")
        .text("Close")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("padding", "5px 10px")
        .style("border", "none")
        .style("background", "#d9534f")
        .style("color", "white")
        .style("cursor", "pointer")
        .on("click", () => chartContainer.remove());
}