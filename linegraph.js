 function showLineGraph(borough, crimeType) {
    // Remove any existing chart
    d3.select("#chart-container").remove();

    // Create a modal-like div to hold the chart
    const chartContainer = d3.select("body").append("div")
        .attr("id", "chart-container")
        .style("position", "absolute")
        .style("top", "50px")
        .style("left", "50px")
        .style("width", "700px")
        .style("height", "450px")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "10px")
        .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.3)")
        .style("z-index", "1000");

    chartContainer.append("h3")
        .text(`${crimeType} Trends in ${borough.abbr}`)
        .style("text-align", "center");

    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 650 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Create SVG for the line chart
    const svg = chartContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract the crime data for the selected borough and crime type
    const crimeData = borough.crimes[crimeType].map((value, index) => ({
        date: months[index],
        value: value
    }));

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(crimeData, d => d.date)) // Start and end of time range
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(crimeData, d => d.value)]) // Scale to max crime value
        .range([height, 0]);

    // Add X Axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Add Y Axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Axis Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Time (Months)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Crime Rate");

    // Draw the line graph for the selected crime type
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX); // Smooth curve

    svg.append("path")
        .datum(crimeData)
        .attr("fill", "none")
        .attr("stroke", colorScales) //r intensity for stroke
        .attr("stroke-width", 2.5)
        .attr("d", line);

    // Add circle markers for data points
    svg.selectAll(".dot")
        .data(crimeData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", colorScales )
        .on("mouseover", function (event, d) {
         d3.select(this).attr("r", 6).attr("fill", "black");

    tooltip.style("display", "block")
        .html(`<strong>${d3.timeFormat("%b %Y")(d.date)}</strong>: ${d.value}`)
        .style("position", "absolute")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "6px")
        .style("border-radius", "4px")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
})
.on("mouseout", function () {
    d3.select(this).attr("r", 4).attr("fill", colorScales[selectedCrime]); // Restore original color
    tooltip.style("display", "none");
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