import ScrollVelocity from '../../reactbits/ScrollVelocity';

/** Tilted red marquee that speeds up while you scroll (React Bits ScrollVelocity). */
export default function MarqueeStrip() {
  return (
    <section className="strip-section full-bleed">
      <div className="strip-band">
        <ScrollVelocity
          texts={['No clashes ✦ Fewer gaps ✦ Fair workloads ✦', 'Print it ✦ Share it ✦ Stick it on the wall ✦']}
          velocity={60}
          className="strip-text"
          numCopies={6}
        />
      </div>
    </section>
  );
}
