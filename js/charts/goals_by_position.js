async function goals_by_position(svg_width, svg_height, svg_id = '#goals-by-position-chart', startYear, endYear) {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 250, right: 100, bottom: 80, left: 200 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Retrieve data - assuming you have fetched the goals by playing position dataset as "positionData"
    const filePath = "main/js/data/data_cleaned.csv";
    var messiData = await d3.csv(`https://raw.githubusercontent.com/bdevierno1/Lionel_Messi_Narrative_Visualization/${filePath}`);

    messiData = messiData
        .filter(d => {
            const year = Number(d.Season.split('/')[0]) + 2000;
            if (!startYear && !endYear) {
                return year;
            }
            return year >= startYear && year <= endYear;
        });

    // Parse the data into appropriate types
    const goalsByPlayingPosition = {};

    for (const record of messiData) {
        const playingPosition = String(record.Playing_Position);
        if (!goalsByPlayingPosition[playingPosition]) {
            goalsByPlayingPosition[playingPosition] = 0;
        }
        goalsByPlayingPosition[playingPosition]++;
    }

    // Convert the goalsByPlayingPosition object to an array of objects
    const data = Object.entries(goalsByPlayingPosition).map(([Position, Goals]) => ({
        Position,
        Goals
    }));

    // Create the SVG element
    const svg = d3.select(svg_id)
        .append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Use D3's pie generator to compute angles for the pie chart
    const pie = d3.pie()
        .value(d => d.Goals)
        .sort(null);

    // Set the radius of the pie chart
    const radius = Math.min(chartWidth, chartHeight) / 2;

    // Create an arc generator to draw the pie chart slices
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Append the pie chart slices
    const pieSlice = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => d3.schemeCategory10[i % d3.schemeCategory10.length])
        .on("mouseover", (d) => {
            // Show the tooltip on mouseover
            const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", `translate(${arc.centroid(d)})`);

            tooltip.append("text")
                .attr("dy", "0.6em")
                .style("text-anchor", "middle")
                .style("font-size", "24px")
                .text("Goals: " + d.data.Goals);
        })
        .on("mouseout", (d, i) => {
            // Remove the tooltip on mouseout
            svg.select(".tooltip").remove();
        });

    // Add labels to the pie chart slices
    svg.selectAll('label')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .text(d => d.data.Position);

    // Append a title for the pie chart
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text('Goals by Playing Position');
}