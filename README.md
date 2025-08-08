# Logtimer — a logarithmic analog/digital clock + moonphase + stopwatch

A clean, canvas-driven clock that renders **logarithmic** hour/minute/second scales

### Logarithmic mapping
We map clock values to a unit circle using base-2 logarithms, compressing early values and stretching later ones for a distinctive “accelerating” dial:

- **Seconds/Minutes** map to `[0,1)` via  
  `fraction = log2(value + 1) / log2(61)` where `value ∈ [0,60]` (plus sub-second/minute fractional parts).
- **Hours** map to `[0,1)` via  
  `fraction = log2((h % 12) + 1 + minutes/60) / log2(13)`.

Then convert to an angle with `θ = fraction * 2π - π/2` and draw each hand from the center to its respective radius.

### Other Feeatures

#### Synchronous analog + digital
- Both the digital readout and the analog hands pull from the **same `Date` instant** each animation frame

#### Dial & markers
- **Hour markers** use the same logarithmic scale for positions 0–12.
- **Second scale** has ticks at log-spaced positions; numerals every 10.

#### Moonphase
- A quick, accurate approximation using the synodic month.


#### Stopwatch (logarithmic dial)
- **Outer dial**: seconds (with numerals every 10).  
- **Inner dial**: minutes (with numerals every 10).  
