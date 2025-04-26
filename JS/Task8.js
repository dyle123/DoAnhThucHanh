d3.csv("../cleaned_heart_disease1.csv").then(function (data) {
    const maleData = [];
    const femaleData = [];

    data.forEach(d => {
        const gender = +d["Gender"]; // 1: Male, 0: Female
        const cholesterol = +d["Cholesterol Level"];
        if (!isNaN(cholesterol)) {
            if (gender === 1) maleData.push(cholesterol);
            else if (gender === 0) femaleData.push(cholesterol);
        }
    });

    const width = 900;
    const height = 600;
    const margin = { top: 30, right: 100, bottom: 70, left: 90 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => +d["Cholesterol Level"]), d3.max(data, d => +d["Cholesterol Level"])])
        .range([margin.left, width - margin.right]);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(20)); // 20 bins

    const maleBins = histogram(maleData);
    const femaleBins = histogram(femaleData);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...maleBins, ...femaleBins], d => d.length)])
        .range([height - margin.bottom, margin.top]);

    // Draw male histogram
    svg.selectAll(".bar-male")
        .data(maleBins)
        .enter().append("rect")
        .attr("class", "bar-male")
        .attr("x", d => x(d.x0) + 1)
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 2)
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "#4da6ff")
        .attr("opacity", 0.6);

    // Draw female histogram
    svg.selectAll(".bar-female")
        .data(femaleBins)
        .enter().append("rect")
        .attr("class", "bar-female")
        .attr("x", d => x(d.x0) + 1)
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 2)
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "deeppink")
        .attr("opacity", 0.5);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "18px");

    // Y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "18px");


    // X label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-family", "Times New Roman")
        .style("font-weight", "bold")
        .text("Cholesterol Level");

    // Y label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-family", "Times New Roman")
        .style("font-weight", "bold")
        .text("Number of Patients");


    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 80}, ${margin.top})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#4da6ff")
        .attr("opacity", 0.6);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Male")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "deeppink")
        .attr("opacity", 0.5);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 33)
        .text("Female")
        .attr("class", "legend");

});

