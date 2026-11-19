// Paper-cut waves down the left edge: deep red velvet at the edge, lightening layer by layer into the page colour.
// Listed back to front. base / amp in vw, period in vh (one full wave), dur in seconds per period.
const LAYERS = [
  { color: '#f7e4e7', base: 25, amp: 3.2, period: 72, dur: 30, phase: 0.2 },
  { color: '#f0c6cd', base: 20, amp: 3.2, period: 62, dur: 26, phase: 1.4 },
  { color: '#e39aa5', base: 15.5, amp: 3, period: 56, dur: 22, phase: 2.6 },
  { color: '#cf5a6c', base: 10.5, amp: 2.4, period: 50, dur: 19, phase: 3.7 },
  { color: '#a91d35', base: 6.5, amp: 2, period: 46, dur: 16, phase: 4.9 },
  { color: '#781223', base: 3, amp: 1.6, period: 42, dur: 14, phase: 0.9 },
];

/** Closed shape from the left edge to a wavy vertical edge that repeats every `period` units, over -period..100+period. */
function wavePath(base: number, amp: number, period: number, phase: number) {
  const pts: string[] = [];
  for (let y = -period; y <= 100 + period; y += 1.5) {
    const t = (2 * Math.PI * y) / period;
    const x = base + amp * (0.68 * Math.sin(t + phase) + 0.32 * Math.sin(2 * t + phase * 1.7));
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M0,${-period} L${pts.join(' L')} L0,${100 + period} Z`;
}

/**
 * Page backdrop: stacked wavy layers of red down the left side (like layered cut paper), each casting a soft
 * shadow on the next and flowing slowly at its own speed. Fixed, decorative and click-through; it holds still
 * when the system asks for reduced motion.
 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="bd-waves">
        {LAYERS.map((l, i) => {
          const w = l.base + l.amp + 3;
          return (
            <svg key={i} className="bd-wave" viewBox={`0 0 ${w} 100`} preserveAspectRatio="none" style={{ width: `${w}vw`, zIndex: i }}>
              <g className="bd-wave-flow" style={{ ['--p' as string]: l.period, animationDuration: `${l.dur}s` }}>
                <path d={wavePath(l.base, l.amp, l.period, l.phase)} style={{ fill: `var(--wave-${i}, ${l.color})` }} />
              </g>
            </svg>
          );
        })}
      </div>
    </div>
  );
}
