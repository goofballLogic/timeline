const textarea = document.querySelector("textarea");
const svg = document.querySelector("svg");

const svgNS = svg.getAttribute("xmlns");

const parseData = data => data?.split(",").map(x => x.trim());
const parseLine = line => line?.split(":").map((x, i) => i ? parseData(x) : (Number(x) || 0));
const parseLines = value => value?.split("\n").filter(x => x).map(x => x.trim()).map(parseLine) || "";
const numericAscending = (a, b) => a > b ? 1 : a < b ? -1 : 0;
const plotWidth = 800 - 20 - 100;
const plotOffsetX = 10;
const textLineHeight = 20;

const dataListPosition = (dir, index) =>
    dir > 0
        ? 50 + (textLineHeight * 2) + (index * textLineHeight)
        : -60 - (index * textLineHeight);


const titlePosition = (dir, dataCount) =>
    dir > 0 ? (50 + textLineHeight) : -(60 + (dataCount * textLineHeight));

const dataListSVG = (x, dir, data, index) => `

    <text x="${x - 5}" y="${dataListPosition(dir, index)}" class="data">${data}</text>

`;

const r = [8, 122];
const g = [53, 182];
const b = [93, 232];

const color = x => {

    const fraction = (x - plotOffsetX) / plotWidth;
    const offsetR = Math.floor((r[1] - r[0]) * fraction + r[0]);
    const offsetG = Math.floor((g[1] - g[0]) * fraction + g[0]);
    const offsetB = Math.floor((b[1] - b[0]) * fraction + b[0]);

    return `rgb(${offsetR}, ${offsetG}, ${offsetB})`;
};

const dataPointSVG = (x, title, data = [], dir = 1) => `

    <text x="${x - 5}" y="${titlePosition(dir, data.length)}" class="title">${title}</text>
    ${data.map((datum, index) => dataListSVG(x, dir, datum, dir > 0 ? index : data.length - index - 1)).join("\n")}
    <g class="data-point-marker" fill="${color(x)}" stroke="${color(x)}">
        <circle cx="${x}" cy="${50 * dir}" r="2" />
        <line x1="${x}" x2="${x}" y1="0" y2="${50 * dir}" stroke-width="1" />
        <circle cx="${x}" cy="0" r="7" />
    </g >

    `;


function draw() {
    sessionStorage.setItem("data", textarea.value);
    const data = parseLines(textarea.value).sort((a, b) => numericAscending(a[0], b[0]));
    const dates = data.map(x => x[0]);
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const dataWidth = max - min;
    const intervalWidth = plotWidth / dataWidth;
    Array.from(svg.querySelectorAll("g.data-point")).forEach(x => x.remove());
    data.forEach((dataPoint, index) => {

        const rangeOffset = dataPoint[0] - min;
        const g = document.createElementNS(svgNS, "g");
        g.setAttribute("class", "data-point");
        const pointX = plotOffsetX + (rangeOffset * intervalWidth);
        g.innerHTML = dataPointSVG(pointX, dataPoint[0], dataPoint[1], (index % 2) || -1);
        svg.appendChild(g);

    });
}

textarea.addEventListener("input", draw);
textarea.value = sessionStorage.getItem("data") || "1999: One thing\n2000: Multiple things, Thing 2, Thing 3";
draw();