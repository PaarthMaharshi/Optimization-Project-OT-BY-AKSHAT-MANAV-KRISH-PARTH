import ScrollStack, { ScrollStackItem } from '../../reactbits/ScrollStack';
import { SAMPLES, SampleTimetable } from './samples';

const STORIES = [
  { sample: 0, kicker: 'For students', title: 'Your whole week, at a glance.', text: 'One poster per division with every lecture and lab, the teacher and the room. Fewer idle periods between classes.', tone: '#f6e9e3' },
  { sample: 1, kicker: 'For teachers', title: 'A fair share of the teaching.', text: 'The optimiser evens out teaching load and respects each teacher’s daily and weekly limits and blocked hours.', tone: '#f3ecdf' },
  { sample: 3, kicker: 'For the department', title: 'Rooms that fit the class.', text: 'Seats are matched to class size, labs go to labs, and leave or a cancelled lecture is handled from the calendar.', tone: '#efe9f6' },
];

/** "Every timetable tells a story": cards that pin and stack as you scroll (React Bits ScrollStack). */
export default function StoryStack({ posterWidth }: { posterWidth: number }) {
  return (
    <section className="story-section">
      <div className="story-head">
        <span className="eyebrow-icon" aria-hidden="true">✦</span>
        <h2>
          Every timetable <em>tells a story</em>
        </h2>
      </div>
      <ScrollStack useWindowScroll itemDistance={60} itemStackDistance={26} stackPosition="18%" baseScale={0.9} itemScale={0.03} blurAmount={0.6} className="story-stack">
        {STORIES.map((s) => (
          <ScrollStackItem key={s.title} itemClassName="story-card" style={{ background: s.tone }}>
            <div className="story-text">
              <span className="story-kicker">{s.kicker}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
            <div className="story-poster">
              <SampleTimetable spec={SAMPLES[s.sample]} width={posterWidth} />
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  );
}
