export function barChart(xps) {
    const maxXP = Math.max(...xps.map(xp => xp.amount));
    const svgNS = "http://www.w3.org/2000/svg";
    const barHeight = 25;
    const gap = 10;
    const width = 300;
    const height = Math.min(xps.length * (barHeight + gap), 600);

    // Create SVG element
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Create chart bars and labels
    xps.forEach((xp, i) => {
        const barWidth = (xp.amount / maxXP) * (width - 70); // leave room for labels

        // Create a bar (rectangle)
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", 70); // Start X position, leave space for labels
        rect.setAttribute("y", i * (barHeight + gap));
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", "#3498db");
        svg.appendChild(rect);

        // Create a label for the bar
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", 0); // X position for the label
        label.setAttribute("y", i * (barHeight + gap) + 15); // Adjust vertical position
        label.textContent = shortenPath(xp.path);
        label.setAttribute("font-size", "10");
        svg.appendChild(label);
    });

    // Add the SVG to the DOM
    let chartContainer = document.getElementById("xp-chart");
    if (!chartContainer) {
        chartContainer = document.createElement("div");
        chartContainer.id = "xp-chart";
        chartContainer.style.marginTop = "20px";  // Add some space above chart
        document.getElementById("profile").appendChild(chartContainer);
    }

    // Clear previous chart before adding a new one
    chartContainer.innerHTML = ""; 
    chartContainer.appendChild(svg);
    chartContainer.style.height = `${height}px`; // Set height of the container
}

// Simple path label shortening
function shortenPath(path) {
    const parts = path.split('/');
    return parts.slice(-2).join('/'); // Return last two segments
}
