// Đọc dữ liệu từ file CSV
d3.csv("../cleaned_heart_disease1.csv").then(function(data) {
    // Chuyển đổi dữ liệu từ chuỗi sang số
    data.forEach(d => {
        d.Smoking = +d.Smoking;  // 0: Không hút thuốc, 1: Hút thuốc
        d.HeartDiseaseStatus = +d["Heart Disease Status"];  // 0: Không bị, 1: Bị bệnh tim
    });

    // Nhóm dữ liệu theo Smoking và Heart Disease Status
    const groupedData = d3.rollup(
        data,
        v => v.length,
        d => d.Smoking,
        d => d.HeartDiseaseStatus
    );

    // Chuyển đổi về dạng phù hợp cho D3
    const formattedData = Array.from(groupedData, ([smoking, heartData]) => ({
        smoking: smoking === 1 ? "Smoker" : "Non-smoker",
        values: [
            { heart: "Yes", count: heartData.get(1) || 0 },
            { heart: "No", count: heartData.get(0) || 0 }
        ]
    }));
    

    // Vẽ biểu đồ với dữ liệu đã xử lý
    drawChart(formattedData);
});

function makeCurlyBrace(x1, y1, x2, y2, width, height) {
    const cpx = (x1 + x2) / 2; // Điểm điều khiển x (ở giữa)
    const cpy = y1 + height;   // Điểm điều khiển y (dưới đáy)
    
    return `M ${x1} ${y1} 
            C ${x1} ${y1 + width / 2}, ${cpx - width / 2} ${cpy}, ${cpx} ${cpy} 
            C ${cpx + width / 2} ${cpy}, ${x2} ${y1 + width / 2}, ${x2} ${y1}`;
}


function addCurlyBraces(svg, x0, data, height, margin) {
    // Vị trí của 2 cột "Smoker"
    const smokerX1 = x0("Smoker") - x0.bandwidth() * 0.1; // Mở rộng chút về phía trái
    const smokerX2 = x0("Smoker") + x0.bandwidth() * 1.1; // Mở rộng chút về phía phải
    
    // Vị trí của 2 cột "Non-smoker" 
    const nonSmokerX1 = x0("Non-smoker") - x0.bandwidth() * 0.1;
    const nonSmokerX2 = x0("Non-smoker") + x0.bandwidth() * 1.1;
    
    // Vị trí y cho tất cả dấu ngoặc (dưới trục x)
    const braceY = height + 15; // Điều chỉnh khoảng cách dưới trục x
    
    // Tạo dấu ngoặc nhọn cho Smoker
    svg.append("path")
        .attr("d", makeCurlyBrace(smokerX1, braceY, smokerX2, braceY, 10, 20))
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    
    // Tạo dấu ngoặc nhọn cho Non-smoker
    svg.append("path")
        .attr("d", makeCurlyBrace(nonSmokerX1, braceY, nonSmokerX2, braceY, 10, 20))
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    
    // Thêm text "Smoker" và "Non-smoker" dưới dấu ngoặc
    svg.append("text")
        .attr("x", (smokerX1 + smokerX2) / 2)
        .attr("y", braceY + 30) // Điều chỉnh khoảng cách dưới dấu ngoặc
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");
        //.text("Smoker");
    
    svg.append("text")
        .attr("x", (nonSmokerX1 + nonSmokerX2) / 2)
        .attr("y", braceY + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");
       // .text("Non-smoker");
}


// Hàm vẽ biểu đồ Group Bar Chart
function drawChart(data) {
    const margin = { top: 50, right: 30, bottom: 80, left: 120 },
        width = 1200 - margin.left - margin.right- 20,  // Tăng từ 800 lên 1200
        height = 600 - margin.top - margin.bottom;  // Tăng từ 400 lên 600

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)  // Sẽ thành 1200
        .attr("height", height + margin.top + margin.bottom)  // Sẽ thành 600
        .append("g")        
        .attr("transform", `translate(${margin.left},${margin.top})`);

   
    const x0 = d3.scaleBand()
        .domain(data.map(d => d.smoking))
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["Yes", "No"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data.flatMap(d => d.values.map(v => v.count)))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["#ff4d4d", "#4da6ff"]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")  // Chọn tất cả các phần tử text trong trục
        .style("font-size", "16px")  // Thay đổi cỡ chữ ở đây
        .style("font-weight", "bold");  // Tùy chọn: làm đậm chữ
        

    svg.append("g")
        .call(d3.axisLeft(y)
            .tickSize(-10) // Điều chỉnh độ dài của tick lines
            .tickPadding(10)) // Tăng khoảng cách giữa tick lines và label
        .selectAll("text")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("dx", "-10") // Dịch chuyển text sang trái thêm 10px
        .style("fill", "black");

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    const bars = svg.selectAll("g.layer")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.smoking)},0)`);

    bars.selectAll("rect")
        .data(d => d.values)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x1(d.heart))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => color(d.heart))
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(200);
            
            tooltip.style("opacity", 1)
                .html(`${d.heart}: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("fill", d => color(d.heart));
                
            tooltip.style("opacity", 0);
        });

    const legend = svg.selectAll(".legend")
        .data(["Yes", "No"])
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${i * 200}, -30)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", d => color(d));

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d => `Heart Disease: ${d}`)
        .style("font-weight", "bold");

    // Thêm nhãn cho trục X (Tình trạng hút thuốc)
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", 540)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Smoking status");

    // Thêm nhãn cho trục Y (Số người bị bệnh tim)
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 40)  // Tăng giá trị này để di chuyển nhãn ra xa hơn
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Total number of people");

    // Thêm dòng này vào cuối hàm drawChart, trước khi kết thúc hàm
addCurlyBraces(svg, x0, data, height, margin);
// Thay thế đoạn code tạo trục x:
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickSize(0).tickFormat("")); // Không hiển thị nhãn và tick


// Thêm nhãn số liệu cho mỗi cột
bars.selectAll(".bar-label")
    .data(d => d.values)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => x1(d.heart) + x1.bandwidth() / 2)
    .attr("y", d => y(d.count) - 10) // Đặt nhãn phía trên cột
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "black")
    .text(d => d.count);

}
