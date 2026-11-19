import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '../../reactbits/ScrollReveal';
import { SAMPLES, SampleTimetable } from './samples';
import { siteThemeName, useSiteTheme } from '../../lib/siteTheme';

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned section: the posters start in a loose diagonal fan and, as you scroll, settle into a tidy grid.
 * Same idea as Codrops' "Scroll-Based Layout Animations" (a pinned, scrubbed switch between two CSS layouts):
 * measure every poster in both layouts, keep the grid in the DOM, and scrub each poster from its fan offset to zero.
 */
export default function FanToGrid({ cardWidth }: { cardWidth: number }) {
  const wrap = useRef<HTMLElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const { id: themeId, setTheme } = useSiteTheme();

  useLayoutEffect(() => {
    const el = gallery.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-grid');
      return () => el.classList.remove('is-grid');
    }
    const items = [...el.querySelectorAll<HTMLElement>('.fg-item')];
    el.classList.remove('is-grid');
    const fan = items.map((it) => ({ x: it.offsetLeft, y: it.offsetTop, r: parseFloat(getComputedStyle(it).rotate) || 0 }));
    el.classList.add('is-grid');
    const grid = items.map((it) => ({ x: it.offsetLeft, y: it.offsetTop }));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'center center', end: '+=140%', pin: wrap.current, scrub: 0.5 },
      });
      items.forEach((it, i) => {
        tl.fromTo(
          it,
          { x: fan[i].x - grid[i].x, y: fan[i].y - grid[i].y, rotate: fan[i].r, transformOrigin: '50% 50%' },
          { x: 0, y: 0, rotate: 0, ease: 'power2.inOut', duration: 1 },
          i * 0.06,
        );
      });
    }, el);
    return () => {
      ctx.revert();
      el.classList.remove('is-grid');
    };
  }, [cardWidth]);

  return (
    <section className="fg-section" ref={wrap}>
      <div className="fg-gallery" ref={gallery}>
        <div className="fg-caption">
          <span className="eyebrow-icon" aria-hidden="true">✦</span>
          <h2>
            Our vision for <em>every</em> timetable.
          </h2>
          <ScrollReveal baseOpacity={0.12} enableBlur blurStrength={6} baseRotation={0} containerClassName="fg-reveal" textClassName="fg-reveal-text">
            Every week of classes tells a story. Clockwork keeps it free of clashes, keeps students' idle periods short,
            fills rooms sensibly and spreads teaching fairly, then lets you decorate it.
          </ScrollReveal>
        </div>
        {SAMPLES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`fg-item${themeId === s.palette ? ' active' : ''}`}
            style={{ ['--i' as string]: i }}
            onClick={() => setTheme(s.palette)}
            aria-pressed={themeId === s.palette}
            aria-label={`Use the ${siteThemeName(s.palette)} colours for the site`}
            title={`Use ${siteThemeName(s.palette)} colours`}
          >
            <SampleTimetable spec={s} width={cardWidth} />
          </button>
        ))}
      </div>
    </section>
  );
}
