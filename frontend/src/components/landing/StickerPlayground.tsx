import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { iconStickers } from '../../themes/stickers';
import { SAMPLES, SAMPLE_RATIO, SampleTimetable } from './samples';

type Item = { type: 'icon'; k: string; c: string } | { type: 'word'; text: string; c: string; ink: string };
interface Placed {
  uid: number;
  item: Item;
  x: number; // % of the timetable width
  y: number; // % of the timetable height
  rot: number;
}
interface Drag {
  item: Item;
  uid?: number; // set when moving a sticker that is already on the timetable
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
}

const PALETTE: Item[] = [
  { type: 'icon', k: 'star', c: '#FFC145' },
  { type: 'icon', k: 'heart', c: '#F0A6CA' },
  { type: 'icon', k: 'coffee', c: '#D9B48F' },
  { type: 'icon', k: 'sun', c: '#FF6B4A' },
  { type: 'icon', k: 'flower', c: '#B79CD9' },
  { type: 'icon', k: 'book', c: '#7CC6C2' },
  { type: 'icon', k: 'cat', c: '#E2B85C' },
  { type: 'icon', k: 'sparkle', c: '#FFE27A' },
  { type: 'icon', k: 'cloud', c: '#CFE3FF' },
  { type: 'icon', k: 'bow', c: '#C8102E' },
  { type: 'word', text: 'EXAM', c: '#1e1316', ink: '#ffffff' },
  { type: 'word', text: 'QUIZ', c: '#b01e35', ink: '#ffffff' },
  { type: 'word', text: 'YAY!', c: '#FFC145', ink: '#1e1316' },
  { type: 'word', text: 'BREAK', c: '#7CC6C2', ink: '#1e1316' },
  { type: 'word', text: 'DEADLINE', c: '#F0A6CA', ink: '#1e1316' },
  { type: 'word', text: 'GYM', c: '#f4d9dd', ink: '#1e1316' },
];

const label = (it: Item) => (it.type === 'icon' ? `${iconStickers[it.k]?.name ?? it.k} sticker` : `${it.text} sticker`);

function Face({ item, size }: { item: Item; size: number }) {
  if (item.type === 'icon') {
    return (
      <span className="pg-icon" style={{ width: size, height: size }}>
        {iconStickers[item.k]?.draw(item.c, '#1e1316')}
      </span>
    );
  }
  return (
    <span className="pg-word" style={{ background: item.c, color: item.ink, fontSize: Math.max(11, size * 0.3) }}>
      {item.text}
    </span>
  );
}

/**
 * One sample timetable with a tray of stickers: drag a sticker onto the timetable, drag placed stickers to move
 * them, drag one off the timetable to remove it. Enter or Space on a tray sticker drops it at a random spot.
 */
export default function StickerPlayground({ width }: { width: number }) {
  const board = useRef<HTMLDivElement>(null);
  const nextUid = useRef(1);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const size = Math.round(width * 0.16);
  const height = Math.round(width * SAMPLE_RATIO);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    const up = (e: PointerEvent) => {
      const d = drag;
      const r = board.current?.getBoundingClientRect();
      const cx = e.clientX - d.dx;
      const cy = e.clientY - d.dy;
      const inside = !!r && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      if (inside && r) {
        const x = ((cx - r.left) / r.width) * 100;
        const y = ((cy - r.top) / r.height) * 100;
        if (d.uid) setPlaced((p) => p.map((s) => (s.uid === d.uid ? { ...s, x, y } : s)));
        else setPlaced((p) => [...p, { uid: nextUid.current++, item: d.item, x, y, rot: d.rot }]);
      } else if (d.uid) {
        setPlaced((p) => p.filter((s) => s.uid !== d.uid)); // dragged off the timetable: remove
      }
      setDrag(null);
    };
    const cancel = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
    // Re-attach only when a drag starts or ends; the position updates do not need new listeners.
  }, [drag?.item, drag?.uid]);

  const start = (e: RPointerEvent<HTMLElement>, item: Item, uid?: number, rot?: number) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setDrag({
      item,
      uid,
      x: e.clientX,
      y: e.clientY,
      dx: e.clientX - (r.left + r.width / 2),
      dy: e.clientY - (r.top + r.height / 2),
      rot: rot ?? Math.round(Math.random() * 30 - 15),
    });
  };

  const dropRandom = (item: Item) =>
    setPlaced((p) => [...p, { uid: nextUid.current++, item, x: 15 + Math.random() * 70, y: 12 + Math.random() * 76, rot: Math.round(Math.random() * 30 - 15) }]);

  return (
    <div className="pg">
      <div className="pg-board" ref={board} style={{ width, height }}>
        <SampleTimetable spec={SAMPLES[0]} width={width} />
        {placed.map((s) =>
          drag?.uid === s.uid ? null : (
            <span
              key={s.uid}
              className="pg-placed"
              style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.rot}deg` }}
              onPointerDown={(e) => start(e, s.item, s.uid, s.rot)}
              title="Drag to move, or drag off the timetable to remove"
            >
              <Face item={s.item} size={size} />
            </span>
          ),
        )}
      </div>

      <div className="pg-tray">
        <div className="pg-tray-head">
          <b>Decorate it</b>
          <span>Drag stickers onto the timetable</span>
        </div>
        <div className="pg-tray-grid">
          {PALETTE.map((it, i) => (
            <button
              key={i}
              type="button"
              className="pg-source"
              aria-label={`Add ${label(it)}`}
              onPointerDown={(e) => start(e, it)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dropRandom(it);
                }
              }}
            >
              <Face item={it} size={Math.round(size * 0.72)} />
            </button>
          ))}
        </div>
        {placed.length > 0 && (
          <button type="button" className="pill-btn pg-clear" onClick={() => setPlaced([])}>
            Clear stickers
          </button>
        )}
      </div>

      {drag && (
        <span className="pg-ghost" style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, rotate: `${drag.rot}deg` }} aria-hidden="true">
          <Face item={drag.item} size={size} />
        </span>
      )}
    </div>
  );
}
