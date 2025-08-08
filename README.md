# Logtimer — a logarithmic analog/digital clock + moonphase + stopwatch

A clean, canvas-driven clock that renders **logarithmic** hour/minute/second scales,
keeps **digital and analog perfectly in sync**, includes an **astronomical moonphase**
and a **logarithmic stopwatch** (outer seconds, inner minutes with labels, centiseconds hand),
all HiDPI-sharp and responsive.

## Demo / Deploy
This repo is static — you can open `src/index.html` directly or deploy to GitHub Pages.
See **Deploy to GitHub Pages** below.

---

## How it works

### 1) Logarithmic mapping
We map clock values to a unit circle using base-2 logarithms, compressing early values and stretching later ones for a distinctive “accelerating” dial:

- **Seconds/Minutes** map to `[0,1)` via  
  `fraction = log2(value + 1) / log2(61)` where `value ∈ [0,60]` (plus sub-second/minute fractional parts).
- **Hours** map to `[0,1)` via  
  `fraction = log2((h % 12) + 1 + minutes/60) / log2(13)`.

Then convert to an angle with `θ = fraction * 2π - π/2` and draw each hand from the center to its respective radius.

### 2) Synchronous analog + digital
Both the digital readout and the analog hands pull from the **same `Date` instant** each animation frame:
- `h = now.getHours()`
- `sFloat = seconds + milliseconds/1000`
- `mFloat = minutes + sFloat/60`

No drift, no double-sampling artifacts.

### 3) HiDPI / Retina crispness
Each canvas uses its CSS pixel size for layout, but its backing store is scaled by
`devicePixelRatio`. We set the transform via `ctx.setTransform(dpr,0,0,dpr,0,0)` so lines and
type are crisp on all screens.

### 4) Dial & markers
- **Hour markers** use the same logarithmic scale for positions 0–12.
- **Second scale** has ticks at log-spaced positions; numerals every 10.
- Hand colors: **hours/minutes** off‑white (`--hand`), **seconds** red (`--accent`).

### 5) Moonphase
A quick, accurate approximation using the synodic month (≈ 29.530588853 days).
We compute the days since a reference epoch (2000‑01‑06 18:14 UTC), then clip an ellipse from a full
disk to visualize waxing/waning. A label (`New/First Quarter/Full/Last Quarter`, etc.) is shown.

### 6) Stopwatch (logarithmic dial)
- **Outer dial**: seconds (with numerals every 10).  
- **Inner dial**: minutes (with numerals every 10).  
- **Hands**: minutes (inner, off‑white), seconds (outer, red), centiseconds (short, subtle).
- Uses `performance.now()` for steady timing. Laps append to a scrollable list.

### 7) Performance loop
A single `requestAnimationFrame` drives:
- Clock frame + hands
- Digital readout
- Moonphase redraw (cheap)
- Stopwatch analog render and time text

### 8) Accessibility & UX
- Large numerals and clear contrast by default.
- Responsive layout keeps the analog clock prominent with a tidy right column for digital time,
  calendar, moonphase, and the stopwatch with a lap list.

---

## Local setup
No build step needed.

```bash
git clone https://github.com/your-username/logtimer.git
cd logtimer
# open in browser:
open src/index.html  # macOS
# or
start src\index.html # Windows
```

## Deploy to GitHub Pages
1. Create a repo on GitHub and push this folder.
2. In the repo, go to **Settings → Pages** and set:
   - **Source**: GitHub Actions.
3. Commit the workflow in `.github/workflows/deploy-pages.yml`. On push to `main`, it will publish `/src`.

Your site will appear at: `https://<your-username>.github.io/<repo>/`.

---

## About the author
Fill this in with your bio, links, and a short note about why you built Logtimer.

- **Name**: _Your Name_
- **Site**: _yourdomain.tld_
- **X / Twitter**: _@yourhandle_
- **Contact**: _you@domain.tld_

---

## License
MIT © 2025 _Your Name_
