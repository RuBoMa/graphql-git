export function barChart(data, title = "Bar Chart", containerId = "bar-chart") {
    const maxAmount = Math.max(...data.map(d => d.amount));
    const svgNS = "http://www.w3.org/2000/svg";
    const barHeight = 25;
    const gap = 10;
    const width = 300;
    const height = Math.min(data.length * (barHeight + gap), 600);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    data.forEach((item, i) => {
        const barWidth = (item.amount / maxAmount) * (width - 70);

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", 70);
        rect.setAttribute("y", i * (barHeight + gap));
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", "#2ecc71"); // Green for skills
        svg.appendChild(rect);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", 0);
        label.setAttribute("y", i * (barHeight + gap) + 15);
        label.textContent = item.type.replace("skill_", ""); // Clean skill label
        label.setAttribute("font-size", "10");
        svg.appendChild(label);
    });

    let chartContainer = document.getElementById(containerId);
    if (!chartContainer) {
        chartContainer = document.createElement("div");
        chartContainer.id = containerId;
        document.getElementById("profile").appendChild(chartContainer);
    }

    chartContainer.innerHTML = `<h3>${title}</h3>`;
    
    const scrollWrapper = document.createElement("div");
    scrollWrapper.style.maxHeight = "500px";
    scrollWrapper.style.overflowY = "auto";
    scrollWrapper.style.border = "1px solid #ccc";
    scrollWrapper.style.padding = "10px";
    scrollWrapper.style.borderRadius = "10px";
    scrollWrapper.style.backgroundColor = "#fff";

    scrollWrapper.appendChild(svg);
    chartContainer.appendChild(scrollWrapper);
}
