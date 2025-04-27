d3.csv("../5_cleaned_heart_disease1.csv").then(function (data) {
    // Kiểm tra dữ liệu đầu vào
    console.log(data);

    // Đếm số người mắc bệnh tim với tiền sử gia đình và không có tiền sử gia đình
    let withFamilyHistory = { total: 0, heartDisease: 0 };
    let withoutFamilyHistory = { total: 0, heartDisease: 0 };

    data.forEach(d => {
        if (d["Family Heart Disease"] == 1) { // Có tiền sử gia đình
            withFamilyHistory.total++;
            if (d["Heart Disease Status"] == 1) withFamilyHistory.heartDisease++;
        } else { // Không có tiền sử gia đình
            withoutFamilyHistory.total++;
            if (d["Heart Disease Status"] == 1) withoutFamilyHistory.heartDisease++;
        }
    });

    // Tính tỷ lệ mắc bệnh tim trong mỗi nhóm
    const withFamilyPercentage = (withFamilyHistory.heartDisease / withFamilyHistory.total) * 100;
    const withoutFamilyPercentage = (withoutFamilyHistory.heartDisease / withoutFamilyHistory.total) * 100;

    // Dữ liệu cho Group Bar Chart
    const chartData = [
        { label: "With family history of heart disease", value: withFamilyPercentage },
        { label: "Without family history of heart disease", value: withoutFamilyPercentage }
    ];

    // Cài đặt cho Group Bar Chart
    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(chartData.map(d => d.label))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([height, 0]);

    // Vẽ các thanh cột của biểu đồ
    svg.selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.label === "With family history of heart disease" ? "#ffed00" : "#4da6ff") // Điều kiện màu
        .on("mouseover", function () {
            d3.select(this).attr("fill", "lightpink"); // Đổi màu khi hover
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", d => d.label === "With family history of heart disease" ? "#ffed00" : "#4da6ff");
        });
    

    // Thêm số liệu phần trăm trên đầu mỗi cột
    svg.selectAll(".label")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.label) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "black")
        .text(d => `${d.value.toFixed(1)}%`);


    // Thêm trục X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "20px")
        .style("font-family", "Times New Roman")
        .style("font-weight", "bold")
        .style("text-anchor", "middle");

    // Thêm trục Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-family", "Times New Roman")
        .style("font-size", "18px");

    // Thêm nhãn trục Y
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-margin.left / 1.4}, ${height / 2}) rotate(-90)`)
        .style("font-size", "22px")
        .style("font-family", "Times New Roman")
        .style("font-weight", "bold")
        .text("Heart Disease Rate (%)");
});