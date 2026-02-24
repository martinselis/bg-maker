# Background Image Generator — Single-page Web App

Build a single-page HTML/CSS/JS app (no frameworks, no build tools) for generating background images for Tableau dashboards.

## Features

### Canvas
- Width × Height inputs with presets dropdown: "Tableau Default (1200×800)", "Full HD (1920×1080)", "Laptop (1366×768)", "Custom"
- Selecting a preset fills the inputs, "Custom" lets you type
- Live preview canvas that scales to fit the viewport

### Gradient
- Toggle between 2 or 3 color stops
- Each stop: hex input + native color picker (synced)
- Direction: Linear (angle slider 0-360°) or Radial (center)

### Pattern Overlay (select one or none)
Patterns rendered on a canvas overlay on top of the gradient:

1. **Bubbles** — random circles
   - Count (1-200), Min size, Max size, Opacity (0-1), Blur (0-20px), Color (hex, default white), Randomize button (new seed)

2. **Honeycomb** — hexagonal grid
   - Cell size (10-100), Line thickness (1-10), Opacity (0-1), Fill vs Stroke toggle, Color (hex)

3. **Dots Grid** — evenly spaced dots
   - Spacing (5-100), Dot size (1-20), Opacity (0-1), Color (hex)

4. **Diagonal Lines** — parallel lines
   - Spacing (5-100), Thickness (1-10), Angle (0-180°), Opacity (0-1), Color (hex)

5. **Waves** — sinusoidal wave lines
   - Amplitude (5-100), Frequency (1-20), Thickness (1-10), Opacity (0-1), Color (hex), Wave count (1-20)

### Export
- "Download JPEG" button (quality 0.92) — primary, best for Tableau
- "Download PNG" button — secondary option
- Filename: `bg-{width}x{height}.{ext}`

## Design
- Dark UI (sidebar controls, main area preview) — the user prefers dark mode
- Clean, minimal, professional
- Controls in a scrollable sidebar on the left (~300px wide)
- Preview takes remaining space, canvas centered and scaled to fit
- Responsive: on narrow screens, controls above preview

## Technical
- Pure HTML + CSS + JS in a single `index.html` file (or index.html + style.css + app.js, your call — keep it simple)
- Use Canvas API for rendering
- Seeded random for reproducible patterns (simple seed-based PRNG)
- All rendering happens live as controls change
- No external dependencies

## File structure
```
index.html
style.css
app.js
```

Build all three files. Make it polished — this is a tool someone will use regularly.
