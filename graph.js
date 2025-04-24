export function barChart(data, title = "Bar Chart", containerId = "bar-chart") {
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
        rect.setAttribute("fill", "#2ecc71"); // Green for skills
        svg.appendChild(rect);
        // skill bar left
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", 0);
        label.setAttribute("y", i * (barHeight + gap) + 15);
        label.textContent = item.type.replace("skill_", ""); // Clean skill label
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

    let chartContainer = document.getElementById(containerId);
    if (!chartContainer) {
        chartContainer = document.createElement("div");
        chartContainer.id = containerId;
        document.getElementById("profile").appendChild(chartContainer);
    }

    chartContainer.innerHTML = "";

    const scrollWrapper = document.createElement("div");
    scrollWrapper.style.maxHeight = "550px";
    scrollWrapper.style.overflowY = "auto";
    scrollWrapper.style.border = "1px solid #ccc";
    scrollWrapper.style.padding = "10px";
    scrollWrapper.style.borderRadius = "10px";
    scrollWrapper.style.backgroundColor = "#fff";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.textAlign = "center";
    titleElement.style.marginBottom = "10px";
    scrollWrapper.appendChild(titleElement);

    scrollWrapper.appendChild(svg);
    chartContainer.appendChild(scrollWrapper);
}
