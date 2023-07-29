async function goals_per_season(svg_width, svg_height, svg_id = '#messi-goals-chart', startYear, endYear, annotationType) {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 80, right: 100, bottom: 80, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Retrieve data - assuming you have fetched the Lionel Messi dataset as "messiData"
    const filePath = "main/js/data/goals_per_season.csv";
    const messiData = await d3.csv(`https://raw.githubusercontent.com/bdevierno1/Lionel_Messi_Narrative_Visualization/${filePath}`);

    const data = messiData
        .filter(d => {
            const year = Number(d.Season.split('/')[0]) + 2000;
            if (!startYear && !endYear) {
                return year;
            }
            return year >= startYear && year <= endYear;
        })
        .map(d => {
            const year = Number(d.Season.split('/')[0]) + 2000;
            return {
                Season: new Date(year, 0, 1),
                goals: Number(d.Number_of_Goals)
            };
        });

    // Create the SVG element
    const svg = d3.select(svg_id)
        .append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create a scale for the x-axis
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Season))
        .range([0, chartWidth]);

    // Create a scale for the y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.goals)])
        .range([chartHeight, 0]);

    // Create the line generator
    const line = d3.line()
        .x(d => xScale(d.Season))
        .y(d => yScale(d.goals));

    // Append the line path
    svg.append('path')
        .datum(data)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2);

    // Append circle data points
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.Season))
        .attr('cy', (d) => yScale(d.goals))
        .attr('r', 3)
        .style('fill', 'steelblue')
        .style('stroke', 'black')
        .on("mouseover", (d) => {
            // Show the tooltip on mouseover
            const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", "translate(" + (xScale(d.Season) + 10) + "," + (yScale(d.goals) + 40) + ")");

            tooltip.append("text")
                .attr("y", 15)
                .text("Season: " + d3.timeFormat('%Y')(d.Season)); // Format the Date object for display

            tooltip.append("text")
                .attr("y", 30)
                .text("Goals: " + d.goals);
        })
        .on("mouseout", (d, i) => {
            // Remove the tooltip on mouseout
            svg.select(".tooltip").remove();
        });

    // Append X-axis
    svg.append('g')
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

    // Append Y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('~s')));

    // Append x-axis label
    svg.append("text")
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("x", chartWidth / 2)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Season");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Lionel Messi Number of Goals By Season");

    const maxGoalsData = data.reduce((prev, current) => (prev.goals > current.goals) ? prev : current);
    var annotationLabel = "";
    var dx = 0;
    if (annotationType === 'barcelona') {
        annotationLabel = `Maximum Goals: ${maxGoalsData.goals}. In the remarkable 2011 season, Lionel Messi's partnership with coach Pep Guardiola led to a revolutionary tactical change. Embracing the false 9 role, Messi's deep positioning unlocked new attacking possibilities, making him a prolific scorer and reinforcing his status as a footballing genius.`;
    }
    if (annotationType === 'psg') {
        annotationLabel = `Maximum Goals: ${maxGoalsData.goals}. Despite scoring a substantial number of goals, Lionel Messi's goal tally in PSG did not match the extraordinary standards he had previously set throughout his illustrious career. This dip in performance left fans frustrated, and unfortunately, his time at the club was cut short.`;
        dx -= 5;
    }
    if (annotationType === 'psg' || annotationType === 'barcelona') {
        const annotations = [{
            type: d3.annotationCalloutCircle,
            connector: { end: "arrow" },
            note: {
                label: annotationLabel,
                title: "Season: " + d3.timeFormat('%Y')(maxGoalsData.Season),
                wrap: 300,
                color: "black"
            },
            x: xScale(maxGoalsData.Season),
            y: yScale(maxGoalsData.goals),
            dx: dx,
            dy: 300,
        }].map(function (d) { d.color = 'black'; return d });
    
        const makeAnnotations = d3.annotation()
            .annotations(annotations)
    
        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
    }
}
