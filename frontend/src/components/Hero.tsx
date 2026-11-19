import { useEffect, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import BounceCards from '../reactbits/BounceCards';
import BlurText from '../reactbits/BlurText';
import { SAMPLES, SAMPLE_RATIO, SampleTimetable } from './landing/samples';
import { siteThemeName, useSiteTheme } from '../lib/siteTheme';

/** Window width, updated on resize. */
export function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

/**
 * Landing hero in the style of a product showcase: headline on the left, a diagonal fan of sample
 * timetable posters on the right (React Bits BounceCards: hover a card to spread the fan).
 * `children` goes under the text (the login form); `links` become the two call-to-action buttons.
 */
export default function Hero({ links = [], children, art }: { links?: { to: string; label: string }[]; children?: ReactNode; art?: ReactNode }) {
  const vw = useViewportWidth();
  const setTheme = useSiteTheme((s) => s.setTheme);
  const narrow = vw < 820;
  const stacked = !art; // fan of samples centred under the text (home); the login page keeps text beside its art
  const card = narrow ? Math.max(92, Math.min(120, vw / 3.6)) : Math.max(150, Math.min(210, vw / 7));
  const stepX = card * (narrow ? 0.55 : 0.78);
  const stepY = card * (narrow ? 0.2 : 0.12);
  const mid = (SAMPLES.length - 1) / 2;
  const slots = SAMPLES.map((_, i) => `translate(${((i - mid) * stepX).toFixed(0)}px, ${((i - mid) * stepY).toFixed(0)}px) rotate(${[-6, 4, -3, 5, -4, 3][i]}deg)`);
  const boxW = Math.min(vw - 32, card + stepX * (SAMPLES.length - 1) + 80);
  const boxH = card * SAMPLE_RATIO + stepY * (SAMPLES.length - 1) + 60;
  const inner = Math.round(card - 8);

  return (
    <section className={`hero2${children ? ' hero2-login' : ''}${stacked ? ' hero2-stack' : ''}`}>
      <div className="hero2-copy">
        <div className="hero2-eyebrow">Multi-objective timetabling</div>
        <h1 className="hero2-title">
          <BlurText text="Schedule, swap," animateBy="words" direction="top" delay={90} trigger="load" className="hero2-line" />
          <BlurText text="& publish timetables" animateBy="words" direction="top" delay={90} trigger="load" className="hero2-line red" />
          <BlurText text="for every class." animateBy="words" direction="top" delay={90} trigger="load" className="hero2-line" />
        </h1>
        <p className="hero2-sub">
          Clockwork builds clash-free weekly timetables with a memetic NSGA-II optimiser, balances gaps, rooms and teaching
          load, and turns the result into posters your students will actually read.
        </p>
        {children}
        {links.length > 0 && (
          <div className="hero2-actions">
            {links.slice(0, 2).map((l, i) => (
              <NavLink key={l.to} to={l.to} className={i === 0 ? 'pill-btn dark' : 'pill-btn'}>
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {art ? (
        <div className="hero2-art">{art}</div>
      ) : (
      <div className="hero2-art" style={{ minHeight: boxH }}>
        <BounceCards
          className="hero2-fan"
          items={SAMPLES.map((s) => <SampleTimetable key={s.key} spec={s} width={inner} />)}
          labels={SAMPLES.map((s) => `Sample timetable: ${s.title}. Use the ${siteThemeName(s.palette)} colours for the site`)}
          onCardClick={(i) => setTheme(SAMPLES[i].palette)}
          containerWidth={boxW}
          containerHeight={boxH}
          cardSize={card}
          transformStyles={slots}
          animationDelay={0.2}
          animationStagger={0.08}
          bounciness={0.55}
          pushDistance={card * 0.42}
          hoverScale={1.12}
          borderWidth={4}
          borderColor="#ffffff"
          radius={12}
        />
      </div>
      )}
    </section>
  );
}
