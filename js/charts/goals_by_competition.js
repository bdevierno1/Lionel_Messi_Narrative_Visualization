async function goals_by_competition(svg_width, svg_height, svg_id='#goals-by-competition-chart', startYear, endYear) {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 80, right: 100, bottom: 150, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

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
    const goalsByCompetition = {};
    for (const record of messiData) {
        const competition = String(record.Competition);
        if (!goalsByCompetition[competition]) {
            goalsByCompetition[competition] = 0;
        }
        goalsByCompetition[competition]++;
    }

    // Convert the goalsByCompetition object to an array of objects
    const data = Object.entries(goalsByCompetition).map(([Competition, Goals]) => ({ Competition, Goals }));



    // Create the SVG element
    const svg = d3.select(svg_id)
        .append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create a scale for the x-axis (ordinal scale for categorical data)
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Competition))
        .range([0, chartWidth])
        .padding(0.1);

    // Create a scale for the y-axis (linear scale for the number of goals)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Goals)])
        .range([chartHeight, 0]);

    // Append the bars
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.Competition))
        .attr('y', d => yScale(d.Goals))
        .attr('width', xScale.bandwidth())
        .attr('height', d => chartHeight - yScale(d.Goals))
        .attr('fill', 'steelblue')
        .on("mouseover", (d) => {
            // Show the tooltip on mouseover
            const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", "translate(" + (xScale(d.Competition) + xScale.bandwidth() / 2) + "," + (yScale(d.Goals) - 10) + ")");

            tooltip.append("text")
                .attr("y", -5)
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text("Goals: " + d.Goals);

            tooltip.append("text")
                .attr("y", 15)
                .style("text-anchor", "middle")
                .text("Competition: " + d.Competition);
        })
        .on("mouseout", () => {
            // Remove the tooltip on mouseout
            svg.select(".tooltip").remove();
        });

    // Append X-axis
    svg.append('g')
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Append Y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')));

    // Append x-axis label
    svg.append("text")
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("x", chartWidth / 2)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Competition");

    // Append y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Number of Goals");
}
