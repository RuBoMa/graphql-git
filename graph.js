/**
 * Creates a horizontal bar chart visualization of the provided skills data
 * 
 * @param {Array<Object>} data - Array of skill objects, each containing type and amount properties
 * @param {string} [title="Skills"] - Title to display above the chart
 * @param {string} [containerId="bar-chart"] - ID of the DOM element to contain the chart
 */
export function barChart(data, title = "Skills", containerId = "bar-chart") {
    const maxAmount = Math.max(...data.map(d => d.amount));
    const svgNS = "http://www.w3.org/2000/svg";
    const barHeight = 25;
    const gap = 10;
    const width = 600;
    const height = Math.min(data.length * (barHeight + gap), 600);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    data.forEach((item, i) => {
        const barWidth = (item.amount / maxAmount) * (width - 120);

        // draw the bar
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", 70);
        rect.setAttribute("y", i * (barHeight + gap));
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", "#2ecc71");
        svg.appendChild(rect);
        // skill bar left
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", 0);
        label.setAttribute("y", i * (barHeight + gap) + 15);
        label.textContent = item.type.replace("skill_", "");
        label.setAttribute("font-size", "14");
        svg.appendChild(label);

        const valueLabel = document.createElementNS(svgNS, "text");
        valueLabel.setAttribute("x", 70 + barWidth + 5);
        valueLabel.setAttribute("y", i * (barHeight + gap) + barHeight / 2 + 4);
        valueLabel.textContent = `${item.amount.toLocaleString()}%`;
        valueLabel.setAttribute("font-size", "14");
        valueLabel.setAttribute("fill", "#000");
        svg.appendChild(valueLabel);
    });

    const chartContainer = document.getElementById(containerId);
    if (!chartContainer) return;

    chartContainer.innerHTML = "";

    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "chart-scroll-wrapper";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.className = "chart-title";
    scrollWrapper.appendChild(titleElement);

    scrollWrapper.appendChild(svg);
    chartContainer.appendChild(scrollWrapper);
}
/**
 * Creates a line graph visualization of XP progression over time
 * 
 * @param {Array<Object>} progression - Array of data points with amount and createdAt properties
 * @param {string} [title="XP Progression"] - Title to display above the chart
 */
export function lineGraph(progression, title = "XP Progression") {
    const svgNS = "http://www.w3.org/2000/svg";
    const width = 600;
    const height = 300;
    const padding = 60;
    // calculate scale for y-axis
    const rawMax = Math.max(...progression.map(p => p.amount));
    const roundTo = 100000;
    const maxXP = Math.ceil(rawMax / roundTo) * roundTo;
    
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const container = document.getElementById("xp-chart");
    container.innerHTML = "";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.className = "chart-title";
    container.appendChild(titleElement);
    container.appendChild(svg);
/**
    * Scale function to convert index to x coordinate and XP amount to y coordinate
    * @param {number} i - Index in progression array
    * @returns {number} Scaled x coordinate
    * @param {number} xp - XP amount
    * @returns {number} Scaled y coordinate
    */
    const xScale = (i) =>
        i * (width - 2 * padding) / (progression.length - 1) + padding;
    const yScale = (xp) =>
        height - padding - (xp / maxXP) * (height - 2 * padding);

    // Y Axis
    const yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("stroke", "black");
    svg.appendChild(yAxis);

    // X Axis
    const xAxis = document.createElementNS(svgNS, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "black");
    svg.appendChild(xAxis);
    // add y-axis grid lines and labels
    const tickStep = 100000;
    const maxTicks = Math.ceil(maxXP / tickStep);

    for (let i = 0; i <= maxTicks; i++) {
        const value = i * tickStep;
        const y = yScale(value);

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", padding);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#ccc");
        line.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "10");
        text.textContent = `${value.toLocaleString()}`;
        svg.appendChild(text);
    }

    // X Axis labels
    const labelStep = Math.ceil(progression.length / 6);
    for (let i = 0; i < progression.length; i += labelStep) {
        const x = xScale(i);
        const date = new Date(progression[i].createdAt);
        const label = `${date.getMonth() + 1}/${date.getDate()}`; // e.g. 4/25

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding + 15);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "10");
        text.textContent = label;
        svg.appendChild(text);
    }

    // Create line path connecting all data points
    let pathData = `M ${xScale(0)} ${yScale(progression[0].amount)} `;
    for (let i = 1; i < progression.length; i++) {
        pathData += `L ${xScale(i)} ${yScale(progression[i].amount)} `;
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "teal");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", 2);
    svg.appendChild(path);

    // add dots for each data point
    for (let i = 0; i < progression.length; i++) {
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", xScale(i));
        circle.setAttribute("cy", yScale(progression[i].amount));
        circle.setAttribute("r", 3);
        circle.setAttribute("fill", "teal");
        svg.appendChild(circle);
    }
    const xpChart = document.getElementById("xp-chart");
    xpChart.classList.add("chart-scroll-wrapper", "xp-chart-wrapper");

}
