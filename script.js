// Water Tank (Trapping Rain Water) - Vanilla JS + SVG
// Algorithm: prefix leftMax + suffix rightMax
// water[i] = max(min(leftMax[i], rightMax[i]) - height[i], 0)

const $ = (sel) => document.querySelector(sel);

const heightsInput = $("#heightsInput");
const computeBtn = $("#computeBtn");
const exampleBtn = $("#exampleBtn");
const errorEl = $("#error");
const resultBadge = $("#resultBadge");
const viz = $("#viz");
const breakdownBody = $("#breakdown tbody");
const gridToggle = $("#gridToggle");
const labelsToggle = $("#labelsToggle");

const EXAMPLE = [0,4,0,0,0,6,0,6,4,0];

function parseHeights(raw) {
  const s = raw.trim();
  if (!s) return [];
  // Accept JSON array or comma-separated.
  let arr;
  try {
    arr = JSON.parse(s);
    if (!Array.isArray(arr)) throw new Error("Not an array");
  } catch {
    arr = s.split(",").map(x => x.trim()).filter(Boolean).map(Number);
  }
  if (!Array.isArray(arr)) throw new Error("Invalid input");
  if (arr.some(v => !Number.isFinite(v))) throw new Error("All values must be numbers");
  if (arr.some(v => v < 0)) throw new Error("Heights must be >= 0");
  // Optional: coerce to integers for unit-grid visualization.
  if (arr.some(v => !Number.isInteger(v))) throw new Error("Please use integer heights (units).");
  return arr;
}

function computeWater(heights) {
  const n = heights.length;
  if (n === 0) return { total: 0, leftMax: [], rightMax: [], water: [] };

  const leftMax = new Array(n);
  const rightMax = new Array(n);
  leftMax[0] = heights[0];
  for (let i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], heights[i]);

  rightMax[n - 1] = heights[n - 1];
  for (let i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], heights[i]);

  const water = new Array(n).fill(0);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.max(Math.min(leftMax[i], rightMax[i]) - heights[i], 0);
    water[i] = w;
    total += w;
  }
  return { total, leftMax, rightMax, water };
}

function clearSvg(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function elSvg(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function renderSvg(heights, water) {
  clearSvg(viz);

  const n = heights.length;
  const maxH = Math.max(0, ...heights.map((h, i) => h + water[i]));
  const cell = 28;      // px per unit
  const pad = 14;
  const w = n * cell + pad * 2;
  const h = Math.max(1, maxH) * cell + pad * 2;

  viz.setAttribute("width", w);
  viz.setAttribute("height", h);
  viz.setAttribute("viewBox", `0 0 ${w} ${h}`);

  // Background
  viz.appendChild(elSvg("rect", {
    x: 0, y: 0, width: w, height: h, rx: 14, ry: 14,
    fill: "rgba(0,0,0,.10)", stroke: "rgba(255,255,255,.06)"
  }));

  const chartX = pad;
  const chartY = pad;
  const chartW = n * cell;
  const chartH = Math.max(1, maxH) * cell;
  const baseY = chartY + chartH;

  const showGrid = gridToggle.checked;
  const showLabels = labelsToggle.checked;

  // Grid
  if (showGrid) {
    for (let i = 0; i <= n; i++) {
      const x = chartX + i * cell;
      viz.appendChild(elSvg("line", {
        x1: x, y1: chartY, x2: x, y2: baseY,
        stroke: "rgba(255,255,255,.08)"
      }));
    }
    for (let r = 0; r <= maxH; r++) {
      const y = baseY - r * cell;
      viz.appendChild(elSvg("line", {
        x1: chartX, y1: y, x2: chartX + chartW, y2: y,
        stroke: "rgba(255,255,255,.08)"
      }));
    }
  }

  // Water + blocks
  for (let i = 0; i < n; i++) {
    const x = chartX + i * cell;
    const bh = heights[i];
    const wh = water[i];

    if (wh > 0) {
      viz.appendChild(elSvg("rect", {
        x: x + 1, width: cell - 2,
        y: baseY - (bh + wh) * cell + 1,
        height: wh * cell - 2,
        rx: 6, ry: 6,
        fill: "var(--water)"
      }));
    }

    if (bh > 0) {
      viz.appendChild(elSvg("rect", {
        x: x + 1, width: cell - 2,
        y: baseY - bh * cell + 1,
        height: bh * cell - 2,
        rx: 6, ry: 6,
        fill: "var(--block)"
      }));
    }

    if (showLabels) {
      const label = elSvg("text", {
        x: x + cell / 2,
        y: baseY + 16,
        "text-anchor": "middle",
        "font-size": 12,
        fill: "rgba(233,238,252,.75)"
      });
      label.textContent = String(heights[i]);
      viz.appendChild(label);
    }
  }
}

function renderTable(heights, stats) {
  breakdownBody.innerHTML = "";
  for (let i = 0; i < heights.length; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i}</td>
      <td>${heights[i]}</td>
      <td>${stats.leftMax[i]}</td>
      <td>${stats.rightMax[i]}</td>
      <td>${stats.water[i]}</td>
    `;
    breakdownBody.appendChild(tr);
  }
}

function setError(msg) {
  if (!msg) {
    errorEl.hidden = true;
    errorEl.textContent = "";
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = msg;
}

function run() {
  try {
    setError("");
    const heights = parseHeights(heightsInput.value);
    const stats = computeWater(heights);
    resultBadge.textContent = `${stats.total} units`;
    renderSvg(heights, stats.water);
    renderTable(heights, stats);
  } catch (e) {
    setError(e.message || String(e));
    resultBadge.textContent = "—";
    clearSvg(viz);
    breakdownBody.innerHTML = "";
  }
}

computeBtn.addEventListener("click", run);
exampleBtn.addEventListener("click", () => {
  heightsInput.value = JSON.stringify(EXAMPLE);
  run();
});
gridToggle.addEventListener("change", run);
labelsToggle.addEventListener("change", run);

// initial render
run();
