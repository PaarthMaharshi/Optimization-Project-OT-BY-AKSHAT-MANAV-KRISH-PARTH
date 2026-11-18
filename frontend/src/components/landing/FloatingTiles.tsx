import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../../reactbits/SplitText';
import { iconStickers } from '../../themes/stickers';

gsap.registerPlugin(ScrollTrigger);

// Small tiles that drift around the headline at different depths (parallax), like the floating avatars in the reference.
const TILES: { x: number; y: number; d: number; kind: 'code' | 'icon'; v: string; c: string }[] = [
  { x: 4, y: 18, d: 1.4, kind: 'code', v: 'OT', c: '#A50E15' },
  { x: 13, y: 6, d: 0.7, kind: 'icon', v: 'book', c: '#F28A8F' },
  { x: 22, y: 26, d: 1.1, kind: 'code', v: 'ML', c: '#5E9471' },
  { x: 31, y: 8, d: 1.6, kind: 'icon', v: 'star', c: '#FFC145' },
  { x: 40, y: 2, d: 0.9, kind: 'code', v: 'CN', c: '#6F84C6' },
  { x: 50, y: 12, d: 1.3, kind: 'icon', v: 'coffee', c: '#D9B48F' },
  { x: 59, y: 3, d: 0.8, kind: 'code', v: 'SE', c: '#C2477A' },
  { x: 68, y: 10, d: 1.5, kind: 'icon', v: 'sparkle', c: '#B79CD9' },
  { x: 77, y: 24, d: 1.0, kind: 'code', v: 'OS', c: '#2A7F8E' },
  { x: 87, y: 7, d: 1.2, kind: 'icon', v: 'sun', c: '#FF6B4A' },
  { x: 94, y: 22, d: 0.75, kind: 'code', v: 'HCI', c: '#7E6BA8' },
  { x: 2, y: 72, d: 0.9, kind: 'icon', v: 'pencil', c: '#9CB380' },
  { x: 12, y: 86, d: 1.5, kind: 'code', v: 'PC', c: '#C8102E' },
  { x: 24, y: 70, d: 1.0, kind: 'icon', v: 'heart', c: '#F0A6CA' },
  { x: 74, y: 74, d: 1.3, kind: 'icon', v: 'leaf', c: '#6B7F4E' },
  { x: 85, y: 88, d: 0.8, kind: 'code', v: 'PHY', c: '#E2B85C' },
  { x: 95, y: 70, d: 1.6, kind: 'icon', v: 'cloud', c: '#7CC6C2' },
];

export default function FloatingTiles() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('.ft-tile').forEach((t) => {
        const d = Number(t.dataset.d);
        gsap.fromTo(
          t,
          { y: 160 * d, rotate: -8 * d, opacity: 0 },
          { y: -120 * d, rotate: 6 * d, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ft-section" ref={root}>
      {TILES.map((t, i) => (
        <span key={i} className={`ft-tile ${t.kind}`} data-d={t.d} style={{ left: `${t.x}%`, top: `${t.y}%`, ['--c' as string]: t.c, ['--s' as string]: 0.75 + t.d * 0.3 }}>
          {t.kind === 'code' ? t.v : iconStickers[t.v]?.draw('#ffffff', '#ffffff')}
        </span>
      ))}
      <div className="ft-copy">
        <SplitText text="Every class finds its slot." tag="h2" className="ft-title" splitType="words, chars" delay={22} duration={0.7} from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }} threshold={0.3} />
        <p>Divisions, teachers, rooms and labs: one search balances all of them, and every timetable is re-checked by an independent constraint checker before you see it.</p>
      </div>
    </section>
  );
}
