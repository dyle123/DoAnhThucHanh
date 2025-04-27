d3.csv("../cleaned_heart_disease1.csv").then(function (data) {
    const maleData = [];
    const femaleData = [];

    // --- 1. Tiền xử lý dữ liệu (giữ nguyên) ---
    data.forEach(d => {
        const gender = +d["Gender"]; // 1: Male, 0: Female
        const cholesterol = +d["Cholesterol Level"];
        if (!isNaN(cholesterol)) {
            if (gender === 1) maleData.push(cholesterol);
            else if (gender === 0) femaleData.push(cholesterol);
        }
    });

    const width = 1400;
    const height = 600;
    const margin = { top: 40, right: 150, bottom: 70, left: 90 }; // Tăng top/right margin nếu cần

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // --- 2. Scales và Histogram Generator ---
    // Tìm min/max thực tế từ dữ liệu đã lọc NaN
    const allCholesterol = [...maleData, ...femaleData];
    const xMin = d3.min(allCholesterol); // Vẫn cần để biết dữ liệu bắt đầu từ đâu
    const xMax = d3.max(allCholesterol);

    const x = d3.scaleLinear()
        // Chỉnh domain để bắt đầu từ 0
        .domain([0, xMax]).nice()
        .range([margin.left, width - margin.right]);

    // Định nghĩa thresholds cố định cho các bin (ví dụ: bin rộng 10 đơn vị)
    // Bắt đầu từ 0 và kết thúc tại giá trị lớn nhất + kích thước bin
    const binThresholds = d3.range(0, xMax + 10, 10); // Tạo ranh giới các bin: 0, 10, 20, ... , xMax

    const histogram = d3.histogram()
        .value(d => d)
        // Domain của histogram generator vẫn dùng domain từ 0 để tính toán trên toàn bộ phạm vi
        .domain([0, xMax])
        // Chỉ định thresholds TƯỜNG MINH để kiểm soát kích thước bin
        .thresholds(binThresholds);

    const maleBins = histogram(maleData);
    const femaleBins = histogram(femaleData);

    // Tìm max count từ cả hai bộ bin mới
    const yMax = d3.max([...maleBins, ...femaleBins], d => d.length);

    const y = d3.scaleLinear()
        .domain([0, yMax]).nice() // .nice() cho trục Y
        .range([height - margin.bottom, margin.top]);

    // --- 3. Tooltip Div và Handlers ---
    const tooltip = d3.select(".tooltip");

    // Hàm mouseover cho từng thanh riêng lẻ
    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.select(this)
          .style("stroke", "black") // Thêm viền đen khi hover
          .style("opacity", 1);     // Tăng độ mờ lên 100%
    };

    // Hàm mousemove cho từng thanh riêng lẻ
    const mousemove = function(event, d) {
        // d ở đây là pairedBin data cho nhóm
        const element = d3.select(this);
        const isMale = element.classed("bar-male");
        const genderText = isMale ? "Male" : "Female";
        // Truy cập count từ paired data
        const count = isMale ? d.maleCount : d.femaleCount;
        // Lấy khoảng giá trị của bin (làm tròn cho dễ đọc nếu cần)
        // Sử dụng d.x0 và d.x1 từ pairedBin data
        const binRange = `[${Math.round(d.x0)} - ${Math.round(d.x1)})`;

        tooltip
            .html(`Cholesterol: ${binRange}<br>Gender: ${genderText}<br>Count: ${count}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    // Hàm mouseleave cho từng thanh riêng lẻ
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        const element = d3.select(this);
        // Xác định opacity gốc dựa trên class
        const originalOpacity = element.classed("bar-male") ? 0.6 : 0.5;
        element
            .style("stroke", "none") // Bỏ viền đen
            .style("opacity", originalOpacity); // Trả về độ mờ ban đầu
    };

    // --- 4 & 5. Tạo Paired Bins và Vẽ Overlapping Histograms với thanh thấp hơn ở trên ---

    // Kết hợp dữ liệu maleBins và femaleBins dựa trên bin
    // maleBins và femaleBins bây giờ đã có cùng cấu trúc bin (rộng 10 đơn vị)
    const pairedBins = maleBins.map((maleBin, i) => {
        const femaleBin = femaleBins[i];
        return {
            x0: maleBin.x0, // Bắt đầu khoảng bin
            x1: maleBin.x1, // Kết thúc khoảng bin
            maleCount: maleBin.length, // Số lượng nam trong bin
            femaleCount: femaleBin.length // Số lượng nữ trong bin
        };
    });

    // Lọc bỏ các pairedBins có cả maleCount và femaleCount bằng 0
    const filteredPairedBins = pairedBins.filter(d => d.maleCount > 0 || d.femaleCount > 0);


    // Tạo một nhóm (g) cho mỗi bin có dữ liệu
    const binGroups = svg.selectAll(".bin-group")
        .data(filteredPairedBins) // Sử dụng dữ liệu đã lọc
        .enter().append("g")
        .attr("class", "bin-group");

    // Vẽ các thanh Male bên trong nhóm
    binGroups.append("rect")
        .attr("class", "bar-male") // Giữ class
        .attr("x", d => x(d.x0) + 1) // +1 để có khoảng cách nhỏ giữa các bin
        .attr("y", d => y(d.maleCount))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2)) // -2 để có khoảng cách, đảm bảo không âm
        .attr("height", d => y(0) - y(d.maleCount))
        .attr("fill", "#4da6ff")
        .attr("opacity", 0.6); // Opacity gốc cho male

    // Vẽ các thanh Female bên trong nhóm
    binGroups.append("rect")
        .attr("class", "bar-female") // Giữ class
        .attr("x", d => x(d.x0) + 1)
        .attr("y", d => y(d.femaleCount))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
        .attr("height", d => y(0) - y(d.femaleCount))
        .attr("fill", "deeppink")
        .attr("opacity", 0.5); // Opacity gốc cho female

    // --- Đảm bảo thanh thấp hơn nằm ở trên ---
    binGroups.each(function(d) {
        const group = d3.select(this);
        const maleRect = group.select(".bar-male");
        const femaleRect = group.select(".bar-female");

        // Sử dụng .raise() để đưa phần tử lên trên cùng trong nhóm cha (group)
        if (d.maleCount <= d.femaleCount) {
            // Nếu nam thấp hơn hoặc bằng nữ, đưa thanh nam lên trên
            maleRect.raise();
        } else {
            // Nếu nữ thấp hơn, đưa thanh nữ lên trên
            femaleRect.raise();
        }
    });


    // --- Gắn Event Handlers cho từng thanh riêng lẻ ---
    // Chọn tất cả các thanh rect bên trong các nhóm bin-group
    svg.selectAll(".bin-group rect")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    // --- 6. Vẽ trục X ---
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x)) // Trục X vẫn dùng scale x có domain từ 0
        .selectAll("text")
        .attr("class", "tick-text"); // Áp dụng class cho tick text
        // Bỏ xoay và chỉnh font ở đây nếu muốn dùng CSS

    // --- 7. Vẽ trục Y ---
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "tick-text"); // Áp dụng class


    // --- 8. Labels (giữ nguyên vị trí bạn đã chỉnh) ---
    // X label
    svg.append("text")
        .attr("class", "axis-label") // Dùng class
        .attr("x", width / 2)
        .attr("y", height - 10) // Điều chỉnh Y nếu cần
        .attr("text-anchor", "middle")
        .text("Cholesterol Level");

    // Y label
    svg.append("text")
        .attr("class", "axis-label") // Dùng class
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 25) // Điều chỉnh Y nếu cần
        .attr("text-anchor", "middle")
        .text("Number of Patients");


    // --- 9. Legend (giữ nguyên style bạn đã chỉnh) ---
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right + 40}, ${margin.top})`); // Điều chỉnh vị trí

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#4da6ff")
        .attr("opacity", 0.6); // Giữ opacity gốc

    legend.append("text")
        .attr("x", 20)
        .attr("y", 9) // Căn giữa với hình vuông
        .attr("dy", "0.35em")
        .text("Male")
        .style("font-family", "Times New Roman")
        .style("font-size", "18px") // Thay đổi kích thước chữ
        .attr("class", "legend-text"); // Dùng class


    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25) // Tăng khoảng cách
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "deeppink")
        .attr("opacity", 0.5); // Giữ opacity gốc

    legend.append("text")
        .attr("x", 20)
        .attr("y", 25 + 9) // Căn giữa với hình vuông
        .attr("dy", "0.35em")
        .text("Female")
        .style("font-family", "Times New Roman")
        .style("font-size", "18px") // Thay đổi kích thước chữ
        .attr("class", "legend-text"); // Dùng class

}).catch(function(error){
    console.log("Error loading or processing data: ", error);
});