import { memo, useMemo } from 'react';
import TimetablePoster from '../TimetablePoster';
import { mockInstance } from '../../mock/instance';
import { generateSolutions } from '../../mock/solutions';
import { palettes } from '../../themes/palettes';
import { aspects, type BgStyle } from '../../themes/designs';
import { defaultTheme, type Deco, type ThemeSettings } from '../../store';
import type { Solution, ViewKind } from '../../types';

/** Decorative sample posters for the landing page. They use the built-in demo department, not optimiser output. */
export interface SampleSpec {
  key: string;
  palette: string;
  font: string;
  design: string;
  bg: BgStyle;
  title: string;
  subtitle: string;
  view: { kind: ViewKind; entityId: string };
  decos: Deco[];
}

const st = (id: string, sticker: string, x: number, y: number, size: number, rot: number, color = 'c1'): Deco => ({
  id, kind: 'sticker', sticker, x, y, size, rot, color,
});
const word = (id: string, text: string, x: number, y: number, size: number, rot: number, color = 'c2'): Deco => ({
  id, kind: 'word', text, x, y, size, rot, color,
});
const note = (id: string, text: string, x: number, y: number, rot: number, color = '#FFF3A6'): Deco => ({
  id, kind: 'note', text, x, y, size: 170, rot, color,
});

export const SAMPLES: SampleSpec[] = [
  {
    key: 'cherry', palette: 'cherry', font: 'retro', design: 'pill', bg: 'dots',
    title: 'Weekly Schedule', subtitle: 'SY Comp · Division A', view: { kind: 'group', entityId: 'gA' },
    decos: [st('a1', 'bow', 84, 6, 92, 12), st('a2', 'star', 8, 90, 70, -14, 'c2'), word('a3', 'QUIZ', 76, 92, 30, -8)],
  },
  {
    key: 'berry', palette: 'berry', font: 'notebook', design: 'planner', bg: 'lines',
    title: 'My Teaching Week', subtitle: 'Prof. Kulal · OT', view: { kind: 'faculty', entityId: 'f1' },
    decos: [st('b1', 'coffee', 86, 7, 86, 10, 'c2'), note('b2', 'Office hours Thu 3pm', 70, 88, -6), st('b3', 'flower', 10, 92, 74, -10)],
  },
  {
    key: 'matcha', palette: 'matcha', font: 'handwritten', design: 'columns', bg: 'grain',
    title: 'Class Timetable', subtitle: 'SY Comp · Division B', view: { kind: 'group', entityId: 'gB' },
    decos: [st('c1', 'leaf', 88, 6, 80, 18, 'c3'), word('c2', 'EXAM', 14, 93, 30, 6, 'c1'), st('c3', 'sparkle', 82, 90, 66, 0, 'c2')],
  },
  {
    key: 'olive', palette: 'olive', font: 'bubbly', design: 'glass', bg: 'gradient',
    title: 'Room Bookings', subtitle: 'Lecture Hall 201', view: { kind: 'room', entityId: 'r3' },
    decos: [st('d1', 'cloud', 84, 6, 96, 0, 'c2'), st('d2', 'heart', 10, 91, 64, -16), word('d3', 'YAY!', 80, 93, 28, 10, 'c3')],
  },
  {
    key: 'ocean', palette: 'ocean', font: 'editorial', design: 'minimal', bg: 'grid',
    title: 'Lecture Plan', subtitle: 'Prof. Sase · Parallel Computing', view: { kind: 'faculty', entityId: 'f2' },
    decos: [st('e1', 'sun', 86, 6, 90, 0, 'c2'), st('e2', 'pencil', 12, 92, 80, -24, 'c1'), note('e3', 'Lab moved to Fri', 72, 89, 5, '#FFD1DC')],
  },
  {
    key: 'sunset', palette: 'sunset', font: 'tech', design: 'pill', bg: 'solid',
    title: 'CR-101 Week', subtitle: 'Classroom 101', view: { kind: 'room', entityId: 'r1' },
    decos: [st('f1', 'star', 86, 6, 76, 14), st('f2', 'cat', 12, 91, 86, -6, 'c2'), word('f3', 'BREAK', 78, 93, 26, -6, 'c3')],
  },
];

let cached: Solution | null = null;
/** One demo timetable, generated once and reused by every sample. */
function sampleSolution(): Solution {
  if (!cached) {
    const sols = generateSolutions(mockInstance, 11, 12);
    cached = sols.find((s) => s.onFront) ?? sols[0];
  }
  return cached;
}

const A4 = aspects.find((a) => a.id === 'a4')!;
export const SAMPLE_RATIO = A4.h / A4.w;

/** A full poster scaled down to `width` px. */
export const SampleTimetable = memo(function SampleTimetable({ spec, width }: { spec: SampleSpec; width: number }) {
  const theme: ThemeSettings = useMemo(
    () => ({
      ...defaultTheme,
      palette: { ...(palettes.find((p) => p.id === spec.palette) ?? palettes[0]) },
      fontId: spec.font,
      designId: spec.design,
      bgStyle: spec.bg,
      aspect: 'a4',
      title: spec.title,
      subtitle: spec.subtitle,
    }),
    [spec],
  );
  const scale = width / A4.w;
  return (
    <div className="sample-tt" style={{ width, height: A4.h * scale }} role="img" aria-label={`Sample timetable: ${spec.title}, ${spec.subtitle}`}>
      <div style={{ width: A4.w, height: A4.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <TimetablePoster instance={mockInstance} solution={sampleSolution()} view={spec.view} theme={theme} decorations={spec.decos} blockNotes={{}} />
      </div>
    </div>
  );
});
