d3.csv("../cleaned_heart_disease1.csv").then(function(data) {
    // Convert string to numbers
    data.forEach(d => {
      d["Exercise Habits"] = +d["Exercise Habits"]; // 0 = High, 1 = Low, 2 = Medium
      d["Heart Disease Status"] = +d["Heart Disease Status"]; // 0 = No, 1 = Yes
    });
  
    // Map exercise value to label
    const exerciseLabels = {
      0: "High",
      1: "Low",
      2: "Medium"
    };
  
    // Group data for stacking
    const counts = d3.rollup(
      data,
      v => ({
        Yes: v.filter(d => d["Heart Disease Status"] === 1).length,
        No: v.filter(d => d["Heart Disease Status"] === 0).length
      }),
      d => exerciseLabels[d["Exercise Habits"]]
    );
  
    const formattedData = Array.from(counts, ([habit, val]) => ({
      habit,
      Yes: val.Yes,
      No: val.No
    }));
  
    drawStackedBar(formattedData);
  });
  
  function drawStackedBar(data) {
    // const margin = { top: 50, right: 30, bottom: 80, left: 60 },
    //       width = 1200 - margin.left - margin.right - 20,
    //       height = 600 - margin.top - margin.bottom;
  
    const margin = { top: 50, right: 30, bottom: 100, left: 100 }; // <-- Tăng bottom từ 50 → 100
          const width = 1200;
          const height = 600; // giữ nguyên chiều cao phần vẽ

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const subgroups = ["Yes", "No"];
    const groups = data.map(d => d.habit);
  
    // X-axis
    const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding(0.3);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "16px"); // <-- Căn giữa
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Exercise Habit");
  
    // Y-axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Yes + d.No)])
      .nice()
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "16px")  // Tăng kích thước chữ trục y
      .style("font-weight", "bold"); // Làm đậm chữ
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "16px"); // Làm đậm chữ; // <-- Căn giữa

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -80)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Number of People");
  
    // Stack data
    const stacked = d3.stack()
      .keys(subgroups)
      (data);
  
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range([ "#E69F00","#0072B2"]);
  
    // Tooltip
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");
  
    // Draw bars
    svg.append("g")
      .selectAll("g")
      .data(stacked)
      .enter()
      .append("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => x(d.data.habit))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .each(function(d) {
        // Add text label in the middle of each segment
        const height = y(d[0]) - y(d[1]);
        if (height > 25) { // Only show text if segment is tall enough
          const group = d3.select(this.parentNode).datum().key;
          svg.append("text")
            .attr("x", x(d.data.habit) + x.bandwidth()/2)
            .attr("y", y(d[1]) + height/2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "left")
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .text(d[1] - d[0]);
        }
      })
      .on("mouseover", function(event, d) {
        const group = d3.select(this.parentNode).datum().key;
        tooltip
          .style("opacity", 1)
          .html(`Heart Disease: ${group}<br>Count: ${d[1] - d[0]}<br>Exercise Habit: ${d.data.habit}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  
    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, -20)`);
  
    subgroups.forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));
      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(`Heart Disease: ${key}`)
        .size("16px");
    });
  }
