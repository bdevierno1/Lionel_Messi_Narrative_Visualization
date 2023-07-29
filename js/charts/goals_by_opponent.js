async function goals_by_opponent(svg_width, svg_height, svg_id = '#goals-by-opponent-chart', startYear, endYear, annotationType) {
    const width = svg_width;
    const height = svg_height;
    const margin = { top: 250, right: 100, bottom: 150, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Retrieve data - assuming you have fetched the goals by opponent dataset as "opponentData"
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
    const goalsByOpponent = {};
    for (const record of messiData) {
        const opponent = String(record.Opponent);
        if (!goalsByOpponent[opponent]) {
            goalsByOpponent[opponent] = 0;
        }
        goalsByOpponent[opponent]++;
    }

    // Convert the goalsByOpponent object to an array of objects
    var data = Object.entries(goalsByOpponent).map(([Opponent, Goals]) => ({ Opponent, Goals }));

    data.sort((a, b) => b.Goals - a.Goals);

    // Take only the top ten opponents
    data = data.slice(0, 10);


    // Create the SVG element
    const svg = d3.select(svg_id)
        .append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create a scale for the x-axis (ordinal scale for categorical data)
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Opponent))
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
        .attr('x', d => xScale(d.Opponent))
        .attr('y', d => yScale(d.Goals))
        .attr('width', xScale.bandwidth())
        .attr('height', d => chartHeight - yScale(d.Goals))
        .attr('fill', 'steelblue')
        .on("mouseover", (d) => {
            // Show the tooltip on mouseover
            const tooltip = svg.append("g")
                .attr("class", "tooltip")
                .attr("transform", "translate(" + (xScale(d.Opponent) + xScale.bandwidth() / 2) + "," + (yScale(d.Goals) - 10) + ")");

            tooltip.append("text")
                .attr("y", -5)
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text("Goals: " + d.Goals);

            tooltip.append("text")
                .attr("y", 15)
                .style("text-anchor", "middle")
                .text("Opponent: " + d.Opponent);
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
        .text("Top Ten Opponents Scored Against");

    // Append y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text("Number of Goals");

    if (annotationType === "barcelona") {
        const defaultAnnotationData = data[0];
        const defaultX = xScale(defaultAnnotationData.Opponent) + xScale.bandwidth() / 2;
        const defaultY = yScale(defaultAnnotationData.Goals) - 10;
    
        const annotationLabel = "This visualization highlights Lionel Messi's prowess as a big-game player, showcasing that his highest goal tallies are against the formidable clubs in La Liga such as Real Madrid, Sevilla and Atletico. It exemplifies his remarkable ability to excel when facing the toughest opponents on the football field."
    
        const annotations = [{
            type: d3.annotationLabel,
            connector: { end: "arrow" },
            note: {
                label: annotationLabel,
                wrap: 500,
                color: "black"
            },
            x: defaultX,
            y: defaultY,
            dx: 400,
            dy: -40,
        }].map(function (d) { d.color = 'black'; return d });
    
        const makeAnnotations = d3.annotation()
            .annotations(annotations)
    
        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)   
    }
}
