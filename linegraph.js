// Define a fixed color mapping and order for crime types
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
    // Add more crime types and their colors as needed
};

// Define a fixed order for the crime types
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
    // Remove any existing chart
    d3.select("#chart-container").remove();

    // Create an overlay to detect clicks outside the container
    const overlay = d3.select("body").append("div")
    .attr("id", "chart-overlay")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "rgba(0, 0, 0, 0.5)") // Semi-transparent background
    .style("z-index", "999") // Place behind the container
    .on("click", () => {
        // Remove the overlay and the chart container when clicking outside
        overlay.remove();
        d3.select("#chart-container").remove();
    });

// Calculate the gradient for the green percentage
const greenGradient = greenPercentage !== null
    ? `linear-gradient(to top, rgb(5, 126, 5) ${greenPercentage}%, white ${greenPercentage}%)`
    : "white"; // Default to white if no green percentage is provided

// Create a modal-like div to hold the chart
const chartContainer = overlay.append("div")
    .attr("id", "chart-container")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "50px")
    .style("width", "1000px") // Adjusted width to fit graph and legend
    .style("height", "800px") // Adjusted height
    .style("background", greenGradient) // Dynamically set the background gradient
    .style("border", "1px solid black")
    .style("padding", "10px")
    .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.3)")
    .style("z-index", "1000")
    .on("click", (event) => {
        // Prevent clicks inside the container from closing it
        event.stopPropagation();
    });

// Add a title with the green percentage
chartContainer.append("h3")
    .text(greenPercentage !== null
        ? `Crime Trends in ${borough.name} (2012-2024) - ${greenPercentage}% Green Space`
        : `Crime Trends in ${borough.name} (2012-2024)`)
    .style("text-align", "center");

    // Set up dimensions
    const margin = { top: 40, right: 50, bottom: 100, left: 50 }; // Increased bottom margin for legend
    const width = 900 - margin.left - margin.right; // Adjusted width for the graph
    const height = 600 - margin.top - margin.bottom; // Height for the graph

    const svg = chartContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50) // Extra space for the legend
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract years
    const years = Array.from({ length: 13 }, (_, i) => 2012 + i);

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([2012, 2024])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(orderedCrimeTypes.flatMap(type => years.map(year => combinedData[type]?.[year] || 0)))])
        .range([height, 0]);

    const highlightStart = xScale(2020); // X position for 2020
    const highlightEnd = xScale(2021); // X position for 2021
    svg.append("rect")
        .attr("x", highlightStart)
        .attr("y", 0)
        .attr("width", highlightEnd - highlightStart)
        .attr("height", height)
        .attr("fill", "rgba(255, 0, 0, 0.2)") // Semi-transparent red
        .attr("stroke", "red") // Optional: Add a red border for emphasis
        .attr("stroke-width", 1)
        .append("title") // Add a tooltip
        .text("COVID-19 Lockdowns (2020-2021)");
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(yScale));

    const lines = {};
    orderedCrimeTypes.forEach((crimeType) => {
        if (!combinedData[crimeType]) return; // Skip if the crime type is not in the data

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
            .attr("stroke", crimeTypeColors[crimeType] || "#000") // Use fixed color mapping
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("class", `line-${crimeType}`);
    });

    // Add legend at the bottom of the graph
    const legend = chartContainer.append("div")
        .attr("id", "legend-container")
        .style("display", "flex")
        .style("flex-wrap", "wrap") // Allow items to wrap to the next line
        .style("justify-content", "center") // Center the legend items
        .style("position", "absolute")
        .style("bottom", "20px") // Position at the bottom
        .style("left", "50px") // Align with the graph
        .style("width", "900px"); // Match the graph width

    let activeCrimeType = null; // Track the currently active crime type

    orderedCrimeTypes.forEach((crimeType) => {
        if (!combinedData[crimeType]) return; // Skip if the crime type is not in the data

        const legendItem = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px 10px") // Adjusted spacing
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
            .style("width", "20px") // Consistent square size
            .style("height", "20px") // Consistent square size
            .style("background-color", crimeTypeColors[crimeType] || "#000") // Use fixed color mapping
            .style("margin-right", "5px");

        legendItem.append("span")
            .text(crimeType)
            .style("font-size", "12px") // Slightly smaller font for better fit
            .style("white-space", "nowrap") // Prevent text wrapping
            .style("overflow", "hidden") // Hide overflowing text
            .style("text-overflow", "ellipsis") // Add ellipsis for long text
            .style("max-width", "150px"); // Limit the width of the text
    });

    // Close button
    chartContainer.append("button")
        .text("Close")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("padding", "8px 12px") // Adjusted button size
        .style("border", "none")
        .style("background", "#d9534f")
        .style("color", "white")
        .style("cursor", "pointer")
        .on("click", () => {
            overlay.remove(); // Remove the overlay
            chartContainer.remove(); // Remove the chart container
        });
}