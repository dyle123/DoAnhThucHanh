// Load và xử lý dữ liệu từ csv
d3.csv("../cleaned_heart_disease1.csv").then(data => {
    data.forEach(d => {
        d.BMI = +d.BMI;
        d.HeartDisease = +d["Heart Disease Status"];
    });

    // Tạo các nhóm dựa vào số liệu BMI theo khoảng cách 5 đơn vị (10-50)
    const binSize = 5;
    const bmiBins = d3.bin().value(d => d.BMI).thresholds(d3.range(10, 50, binSize))(data);

    // Tính tỷ lệ bệnh tim với mỗi nhóm BMI
    const binnedData = bmiBins.map(bin => {
        const total = bin.length; 
        const diseaseCount = bin.filter(d => d.HeartDisease === 1).length;
        return {
            binMid: (bin.x0 + bin.x1) / 2, 
            label: `${Math.round(bin.x0)}–${Math.round(bin.x1)}`, 
            rate: total > 0 ? diseaseCount / total : 0 
        };
    });
    // Tạo SVG
    const svg = d3.select("#chart").append("svg")
        .attr("width", 900)
        .attr("height", 500);

    const margin = { top: 50, right: 50, bottom: 50, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo tỷ lệ x (BMI) - CHỈNH TRỤC BẮT ĐẦU TỪ 0
    const x = d3.scaleLinear()
        .domain([0, 50])  // <-- chỉnh ở đây, cố định từ 0 đến 50
        .range([0, width]);

    // Tạo tỷ lệ y (phần trăm bệnh tim)
    const y = d3.scaleLinear()
        .domain([0, d3.max(binnedData, d => d.rate)]).nice()
        .range([height, 0]);

    // Vẽ trục x (BMI)
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Vẽ trục y (tỷ lệ % bệnh tim)
    chart.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    // tạo line nối các điểm
    const line = d3.line()
        .x(d => x(d.binMid))
        .y(d => y(d.rate));

    // vẽ đường
    chart.append("path")
        .datum(binnedData)
        .attr("fill", "none")
        .attr("stroke", "#007acc")
        .attr("stroke-width", 3)
        .attr("d", line);

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("padding", "6px")
        .style("background", "#f0f0f0")
        .style("border", "1px solid #999")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-weight", "bold");

    // Vẽ các điểm (circles)
    chart.selectAll("circle")
        .data(binnedData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.binMid))
        .attr("cy", d => y(d.rate))
        .attr("r", 6)
        .attr("fill", "#fbc02d")
        .on("mouseover", function (event, d) {
            d3.select(this).transition().duration(200).attr("fill", "deeppink");
            tooltip.style("visibility", "visible")
                .html(`BMI ${d.label}<br>Rate: ${(d.rate * 100).toFixed(1)}%`)
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(200).attr("fill", "#fbc02d");
            tooltip.style("visibility", "hidden");
        });

    // Thêm nhãn văn bản hiển thị tỷ lệ phần trăm
    chart.selectAll("text.label")
        .data(binnedData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.binMid))
        .attr("y", d => y(d.rate) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "deeppink")
        .text(d => `${(d.rate * 100).toFixed(1)}%`);

    // Title chính
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("BMI and Heart Disease Status");

    // Nhãn trục x
    svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("BMI");

    // Nhãn trục y
    svg.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", -margin.top - height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Heart Disease Rate");
});
