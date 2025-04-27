function drawTask1Chart(csvFile) {
    d3.csv(csvFile).then(data => {
        const ageBins = [
            { range: "20-30", min: 20, max: 30, Yes: 0, No: 0 },
            { range: "30-40", min: 30, max: 40, Yes: 0, No: 0 },
            { range: "40-50", min: 40, max: 50, Yes: 0, No: 0 },
            { range: "50-60", min: 50, max: 60, Yes: 0, No: 0 },
            { range: "60-70", min: 60, max: 70, Yes: 0, No: 0 },
            { range: "70-80", min: 70, max: 80, Yes: 0, No: 0 }
        ];

        data.forEach(d => {
            let age = +d["Age"];
            let status = d["Heart Disease Status"] === "1" ? "Yes" : "No";
            let bin = ageBins.find(b => age >= b.min && age <= b.max);
            if (bin) bin[status]++;
        });

        const container = d3.select("#groupbar_chart");
        const containerWidth = container.node().getBoundingClientRect().width * 0.7;
        const containerHeight = window.innerHeight * 0.8;

        const margin = { top: 60, right: 100, bottom: 60, left: 70 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const svg = container
            .html("") // clear old chart
            .append("svg")
            .attr("width", "100%")
            .attr("height", containerHeight)
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const ageGroups = ageBins.map(d => d.range);
        const subGroups = ["Yes", "No"];

        const x0 = d3.scaleBand()
            .domain(ageGroups)
            .range([0, width])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(subGroups)
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(ageBins, d => Math.max(d.Yes, d.No))])
            .nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(subGroups)
            .range(["#ff4d4d", "#4da6ff"]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .style("font-size", "2vh");

        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "2vh");

        const ageGroup = svg.selectAll(".age-group")
            .data(ageBins)
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d.range)},0)`);

        ageGroup.selectAll("rect")
            .data(d => subGroups.map(key => ({ key, value: d[key] })))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key))
            .attr("class", "bar")
            .on("mouseover", function () {
                d3.select(this).attr("fill", "#ffb300");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("fill", color(d.key));
            });

        ageGroup.selectAll("text")
            .data(d => subGroups.map(key => ({ key, value: d[key] })))
            .enter().append("text")
            .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
            .attr("y", d => y(d.value) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "2vh")
            .text(d => d.value);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .style("font-size", "3vh")
            .text("Age group");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left - 5)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .style("font-size", "3vh")
            .text("Number of people with heart disease");

        const legend = svg.append("g")
            .attr("transform", `translate(${width + 30}, ${10})`);

        legend.selectAll("rect")
            .data(subGroups)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20 + 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => color(d));

        legend.selectAll("text")
            .data(subGroups)
            .enter().append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 32)
            .text(d => d)
            .style("font-size", "2vh");
    });
}

function drawTask2Chart(csvFile) {
    d3.csv(csvFile).then(data => {
        const genders = ["Female", "Male"];
        const results = {
            Female: { Yes: 0, No: 0 },
            Male: { Yes: 0, No: 0 }
        };

        data.forEach(d => {
            const gender = d["Gender"] === "0" ? "Female" : "Male";
            const status = d["Heart Disease Status"] === "1" ? "Yes" : "No";

            if (genders.includes(gender)) {
                results[gender][status]++;
            }
        });

        const totals = {
            Female: results.Female.Yes + results.Female.No,
            Male: results.Male.Yes + results.Male.No
        };

        const maxTotal = Math.max(totals.Female, totals.Male);
        const baseRadius = 100;
        const svgWidth = 900, svgHeight = 450;

        const color = d3.scaleOrdinal()
            .domain(["Yes", "No"])
            .range(["#ff4d4d", "#4da6ff"]);

        // Xóa nội dung cũ và tạo svg mới
        const svg = d3.select("#chart")
            .html("")
            .append("svg")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .classed("responsive-svg", true);

        const svgContainer = svg.append("g");

        genders.forEach((gender, i) => {
            const dataset = [
                { status: "Yes", count: results[gender].Yes },
                { status: "No", count: results[gender].No }
            ];

            const pie = d3.pie().value(d => d.count);
            const data_ready = pie(dataset);

            const ratio = totals[gender] / maxTotal;
            const radius = baseRadius * ratio;

            const arc = d3.arc().innerRadius(0).outerRadius(radius);

            // const centerX = (i * svgWidth / 2) + svgWidth / 4;
            const centerX = (i * 300) + (svgWidth / 2 - 160);
            const centerY = svgHeight / 2 - 70;

            const chartGroup = svgContainer.append("g")
                .attr("transform", `translate(${centerX},${centerY})`);

            chartGroup.selectAll("path")
                .data(data_ready)
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("fill", d => color(d.data.status))
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .on("mouseover", function () {
                    d3.select(this).attr("fill", "#ffb300");
                })
                .on("mouseout", function (event, d) {
                    d3.select(this).attr("fill", color(d.data.status));
                });

            chartGroup.selectAll("text")
                .data(data_ready)
                .enter()
                .append("text")
                .text(d => `${d.data.status}: ${d.data.count}`)
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .style("text-anchor", "middle")
                .style("font-size", "13px");

            svgContainer.append("text")
                .attr("x", centerX)
                .attr("y", 40)
                .attr("text-anchor", "middle")
                .style("font-size", "1.5vh")
                .style("font-weight", "normal")
                .text(`${gender} (Total: ${totals[gender]})`);
        });
    });
}

function drawTask9Chart(csvFile, svgSelector) {
    d3.csv(csvFile).then(data => {
        const svg = d3.select(svgSelector)
            .html("") // clear old content
            .attr("viewBox", "0 0 900 600")
            .attr("preserveAspectRatio", "xMidYMid meet");

        const width = 900,
            height = 600,
            margin = { top: 60, right: 40, bottom: 60, left: 160 },
            chartWidth = width - margin.left - margin.right,
            chartHeight = height - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const ageGroups = [...new Set(data.map(d => d["Age Group"]))];
        const lifestyleGroups = [...new Set(data.map(d => d["Lifestyle Group"]))];

        const x = d3.scaleBand().domain(ageGroups).range([0, chartWidth]).padding(0.05);
        const y = d3.scaleBand().domain(lifestyleGroups).range([0, chartHeight]).padding(0.05);
        const color = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateReds);

        // Draw axes
        g.append("g").call(d3.axisTop(x)).selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start")
            .style("font-size", "11px");

        g.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "11px");

        // Draw cells
        g.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("x", d => x(d["Age Group"]))
            .attr("y", d => y(d["Lifestyle Group"]))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("fill", d => color(+d["Heart Disease Rate"]))
            .append("title")
            .text(d => `${(d["Heart Disease Rate"] * 100).toFixed(1)}%`);

        // Color legend
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("x2", "100%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateReds(0));
        gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateReds(1));

        const legendWidth = 200;
        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendWidth - 30}, ${height - 50})`);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", 15)
            .style("fill", "url(#legend-gradient)");

        legend.append("text").text("0%").attr("x", 0).attr("y", -5).style("font-size", "10px");
        legend.append("text").text("100%").attr("x", legendWidth - 30).attr("y", -5).style("font-size", "10px");
    });
}


function drawTask9(csvFile) {
    d3.csv(csvFile).then(data => {
        // Tiền xử lý: gom nhóm theo Exercise, Smoking, Alcohol
        let groupedData = {};

        data.forEach(d => {
            const age = +d["Age"];
            const ageGroup = 
                age < 30 ? "18-29" :
                age < 40 ? "30-39" :
                age < 50 ? "40-49" :
                age < 60 ? "50-59" :
                age < 70 ? "60-69" : "70-80";

            const key = `${d["Smoking"]}_${d["Alcohol Consumption"]}_${d["Exercise Habits"]}_${ageGroup}`;
            const hasDisease = d["Heart Disease Status"] === "1" ? 1 : 0;

            if (!groupedData[key]) {
                groupedData[key] = {
                    Smoking: d["Smoking"],
                    Alcohol: d["Alcohol Consumption"],
                    Exercise: d["Exercise Habits"],
                    AgeGroup: ageGroup,
                    total: 0,
                    disease: 0
                };
            }

            groupedData[key].total += 1;
            groupedData[key].disease += hasDisease;
        });

        const heatmapData = Object.values(groupedData).map(d => ({
            group: `${d.Smoking}-${d.Alcohol}-${d.Exercise}`,
            age: d.AgeGroup,
            value: +(d.disease / d.total * 100).toFixed(2)
        }));

        const groups = Array.from(new Set(heatmapData.map(d => d.group)));

        // Sắp xếp lại các group theo quy tắc Smoking -> Alcohol -> Exercise
        const sortedGroups = groups.sort((a, b) => {
            const aParts = a.split("-").map(Number);
            const bParts = b.split("-").map(Number);

            if (aParts[0] !== bParts[0]) return aParts[0] - bParts[0];       // Smoking
            if (aParts[1] !== bParts[1]) return aParts[1] - bParts[1];       // Alcohol
            return aParts[2] - bParts[2];                                    // Exercise
        });

        const ageGroups = Array.from(new Set(heatmapData.map(d => d.age)))
            .sort((a, b) => {
                const ageA = a.split("-").map(Number); // Chuyển chuỗi thành số
                const ageB = b.split("-").map(Number); // Chuyển chuỗi thành số
                return ageA[0] - ageB[0]; // So sánh phần đầu của dãy tuổi
            });

        const margin = { top: 80, right: 30, bottom: 80, left: 80 };
        const container = d3.select("#heatmap-container");
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = window.innerHeight * 0.8;

        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        d3.select("#heatmap-container").html(""); // clear

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(sortedGroups)
            .padding(0.05);

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(ageGroups)
            .padding(0.05);

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateYlOrRd)
            .domain([0, 50]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "1.9vh")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "1.9vh");

        svg.selectAll()
            .data(heatmapData, d => d.group + ':' + d.age)
            .join("rect")
            .attr("x", d => x(d.group))
            .attr("y", d => y(d.age))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.value))
            .on("mouseover", function () {
                d3.select(this).style("stroke", "black");
            })
            .on("mouseout", function () {
                d3.select(this).style("stroke", "none");
            });

        svg.selectAll()
            .data(heatmapData)
            .enter()
            .append("text")
            .attr("x", d => x(d.group) + x.bandwidth() / 2)
            .attr("y", d => y(d.age) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "middle")
            .style("font-size", "1.9vh")
            .text(d => `${d.value}%`);

        // Nhãn trục
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 75)
            .attr("text-anchor", "middle")
            .style("font-size", "2.4vh")
            .style("font-weight", "bold")
            .text("Lifestyle group (Smoking - Alcohol - Exercise)");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .style("font-size", "2.4vh")
            .style("font-weight", "bold")
            .text("Age group");

        // Thêm Legend cho trục X (Lifestyle group)
        const legendData = [
            { label: "Smoking (1 = Yes, 0 = No)", value: "Smoking" },
            { label: "Alcohol (0 = High, 1 = Low, 2 = Medium)", value: "Alcohol" },
            { label: "Exercise (0 = High, 1 = Low, 2 = Medium)", value: "Exercise" }
        ];

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 310}, -65)`); // Vị trí chú thích

        legendData.forEach((d, i) => {
            legend.append("text")
                .attr("x", 0)
                .attr("y", i * 20)
                .style("font-size", "2.2vh")
                .text(d.label);
        });

    });
}