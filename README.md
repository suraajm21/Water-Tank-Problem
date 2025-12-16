# Water Tank Problem (Trapping Rain Water)

Frontend-only solution using **Vanilla JavaScript + HTML/CSS** and an **SVG visualization**.

## Run locally

Open `index.html` in a browser (or use any static server).

## What it does

- Parses an array of non-negative integer heights (units).
- Computes trapped water units between blocks.
- Renders blocks and water in an SVG grid.
- Shows a per-index breakdown (height, leftMax, rightMax, water).

## Algorithm

For each index `i`:

- `leftMax[i] = max(height[0..i])`
- `rightMax[i] = max(height[i..n-1])`
- `water[i] = max(min(leftMax[i], rightMax[i]) - height[i], 0)`

Total trapped water is `sum(water[i])`.

Time: `O(n)` | Space: `O(n)`
