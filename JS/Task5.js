// Load dữ liệu và xử lý
d3.csv("../cleaned_heart_disease1.csv", d3.autoType).then(data => {
    //Nhóm dữ liệu theo nhóm cholesterol, đếm số người theo trạng thái bệnh
    const grouped = d3.rollups(
      data,
      v => ({
        "No Disease": v.filter(d => d["Heart Disease Status"] === 0).length,
        "Heart Disease": v.filter(d => d["Heart Disease Status"] === 1).length
      }),
      d => getCholGroup(d["Cholesterol Level"])
    );
  
    const categories = ["No Disease", "Heart Disease"];
    const cholGroups = ["Low (<200)", "Medium (200 - 239)", "High (>=240)"];
  
    const formattedData = cholGroups.map(group => {
      const found = grouped.find(d => d[0] === group);
      return {
        group,
        ...(
          found
            ? found[1]
            : { "No Disease": 0, "Heart Disease": 0 }
        )
      };
    });
//Các thông số chung về kích thước, lề, hiển thị thông tin, màu sắc,...
const svg = d3.select("svg");
const margin = { top: 100, right: 20, bottom: 60, left: 60 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

const color = d3.scaleOrdinal()
  .domain(["No Disease", "Heart Disease"])
  .range(["#4da6ff", "#ffed00"]); // xanh: no, vàng: yes

// Phân loại cholesterol theo 3 nhóm 
function getCholGroup(level) {
  if (level < 200) return "Low (<200)";
  else if (level < 240) return "Medium (200 - 239)";
  else return "High (>=240)";
}

// Tạo tỷ lệ x0 cho các nhóm cholesterol
  const x0 = d3.scaleBand()
    .domain(cholGroups)
    .range([0, width])
    .padding(0.2);
// Tạo tỷ lệ x1 cho trạng thái bệnh tim trong mỗi nhóm cholesterol
  const x1 = d3.scaleBand()
    .domain(categories)
    .range([0, x0.bandwidth()])
    .padding(0.05);
// Tạo tỷ lệ y biểu thị số người
  const y = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => Math.max(d["No Disease"], d["Heart Disease"])) * 1.1])
    .nice()
    .range([height, 0]);
// Thêm trục x (các nhóm cholesterol)
  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));
// Thêm trục y (số người) 
  chart.append("g")
    .call(d3.axisLeft(y));
// Tạo nhóm cột cho từng nhóm cholesterol
  const barGroups = chart.selectAll(".bar-group")
    .data(formattedData)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.group)},0)`)
    .attr("class", "bar-group");
// vẽ cột
  barGroups.selectAll("rect")
    .data(d => categories.map(key => ({ key, value: d[key], group: d.group })))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", d => color(d.key))
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).attr("fill", "lightpink");
      tooltip.style("opacity", 1)
             .html(`<strong>${d.group} Cholesterol</strong><br>${d.key}: <strong>${d.value}</strong>`)
             .style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseover", (event, d) => {
      const hoverColor = d.key === "No Disease" ? "#b3e0ff" : "deeppink";
      d3.select(event.currentTarget).attr("fill", hoverColor);
      tooltip.style("opacity", 1)
             .html(`<strong>${d.group} Cholesterol</strong><br>${d.key}: <strong>${d.value}</strong>`)
             .style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget).attr("fill", color(d.key));
      tooltip.style("opacity", 0);
    });
// thêm label số liệu 
  barGroups.selectAll("text")
    .data(d => categories.map(key => ({ key, value: d[key], group: d.group })))
    .enter()
    .append("text")
    .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", "12px")
    .style("font-weight", "bold")
    .text(d => d.value);

  const legend = svg.append("g")
    .attr("transform", `translate(${width + margin.left - 100}, 20)`);

  categories.forEach((key, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(key));
    g.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text(key)
      .attr("class", "legend");
  });
  // thêm tên biểu đồ
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Cholesterol Level vs Heart Disease Status");
  // tên trục x
  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 40)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Cholesterol Level Group");
  // tên trục y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", margin.left - 45)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Number of People");
});
