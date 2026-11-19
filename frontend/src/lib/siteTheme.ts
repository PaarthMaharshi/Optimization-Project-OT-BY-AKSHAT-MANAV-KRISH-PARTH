import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mix, palettes } from '../themes/palettes';

/**
 * Site-wide colour theme. Each sample poster's palette maps to one accent colour; every themed CSS token
 * (accents, red gradients, page tints, the backdrop waves) is derived from it, so one click recolours the site.
 */
export const SITE_ACCENTS: Record<string, string> = {
  cherry: '#b01e35', // the original look
  berry: '#c2477a',
  matcha: '#6b7f4e',
  olive: '#5a5b45',
  ocean: '#2a7f8e',
  sunset: '#e8553a', // a touch deeper than Sunset Pop's #FF6B4A so white text on it stays readable
};

export const DEFAULT_SITE_THEME = 'cherry';

export type Mode = 'light' | 'dark';

const BASE = {
  light: { paper: '#edeae8', paper2: '#e3dedc', line: '#dcd3d2', ink: '#1e1316' },
  dark: { paper: '#161214', paper2: '#211a1d', line: '#3a3034', ink: '#f3ecee' },
};

export function siteColors(id: string, mode: Mode = 'light') {
  const base = SITE_ACCENTS[id] ?? SITE_ACCENTS[DEFAULT_SITE_THEME];
  const b = BASE[mode];
  const dark = mode === 'dark';
  // On a dark page the accent is lifted a little so accent-coloured text stays readable.
  const a = dark ? mix(base, '#ffffff', 0.16) : base;
  const light = mix(a, '#ffffff', 0.22);
  const deep = mix(a, '#000000', 0.3);
  const deeper = mix(a, '#000000', 0.58);
  // Backdrop waves, back (widest, nearest the content) to front (the screen edge), built from the palette's own
  // colours so the page picks up the look of the poster that was clicked: soft c2 at the back, then c2, c3, c1.
  const p = palettes.find((x) => x.id === id) ?? palettes[0];
  const waves = dark
    ? [mix(b.paper, p.c2, 0.12), mix(b.paper, p.c2, 0.26), mix(b.paper, p.c2, 0.52), mix(b.paper, p.c3, 0.72), mix(b.paper, p.c1, 0.88), mix(p.c1, '#000000', 0.38)]
    : [mix(b.paper, p.c2, 0.22), mix(b.paper, p.c2, 0.46), mix(b.paper, p.c2, 0.82), p.c3, p.c1, mix(p.c1, '#000000', 0.3)];
  const vars: Record<string, string> = {
    '--accent': a,
    '--accent-2': dark ? light : deep,
    '--accent-soft': dark ? mix(b.paper, a, 0.26) : mix(a, '#ffffff', 0.84),
    '--paper': mix(b.paper, a, dark ? 0.03 : 0.035),
    '--paper-2': mix(b.paper2, a, dark ? 0.05 : 0.045),
    '--line': mix(b.line, a, dark ? 0.08 : 0.05),
    '--grad-red': `radial-gradient(130% 110% at 30% 18%, ${light} 0%, ${a} 32%, ${deep} 66%, ${deeper} 100%)`,
    '--grad-red-flat': `linear-gradient(135deg, ${mix(a, '#ffffff', 0.1)} 0%, ${mix(a, '#000000', 0.12)} 55%, ${mix(a, '#000000', 0.4)} 100%)`,
  };
  waves.forEach((w, i) => (vars[`--wave-${i}`] = w));
  return { accent: a, light, ink: b.ink, sparks: [a, light, '#b8923a'], vars };
}

const systemMode = (): Mode =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function apply(id: string, mode: Mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(siteColors(id, mode).vars)) root.style.setProperty(k, v);
  root.dataset.siteTheme = id;
  root.dataset.mode = mode;
}

type VT = { updateCallbackDone: Promise<void>; finished: Promise<void> };
let activeTransition: VT | null = null;

/**
 * Cross-fade the whole page when the browser supports view transitions. The change itself must never be lost:
 * if a fade is already running (quick second click) it applies straight away, and if the browser skips the
 * fade before calling back, the change is applied anyway.
 */
function withTransition(run: () => void) {
  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    run();
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  if (!doc.startViewTransition || activeTransition || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    once();
    return;
  }
  const t = doc.startViewTransition(once);
  activeTransition = t;
  t.updateCallbackDone.catch(once);
  t.finished.catch(() => undefined).finally(() => {
    if (activeTransition === t) activeTransition = null;
    once();
  });
  setTimeout(once, 400); // belt and braces if the browser stalls the transition
}

interface SiteThemeState {
  id: string;
  /** null = follow the system setting */
  modePref: Mode | null;
  systemMode: Mode;
  setTheme: (id: string) => void;
  toggleMode: () => void;
}

export const resolvedMode = (s: Pick<SiteThemeState, 'modePref' | 'systemMode'>): Mode => s.modePref ?? s.systemMode;

export const useSiteTheme = create<SiteThemeState>()(
  persist(
    (set, get) => ({
      id: DEFAULT_SITE_THEME,
      modePref: null,
      systemMode: systemMode(),
      setTheme: (id) => {
        if (!SITE_ACCENTS[id]) return;
        withTransition(() => {
          apply(id, resolvedMode(get()));
          set({ id });
        });
      },
      toggleMode: () => {
        const next: Mode = resolvedMode(get()) === 'dark' ? 'light' : 'dark';
        withTransition(() => {
          apply(get().id, next);
          set({ modePref: next });
        });
      },
    }),
    {
      name: 'clockwork-site-theme',
      partialize: (s) => ({ id: s.id, modePref: s.modePref }),
      onRehydrateStorage: () => (state) => apply(state?.id ?? DEFAULT_SITE_THEME, state ? resolvedMode(state) : systemMode()),
    },
  ),
);

{
  const s = useSiteTheme.getState();
  apply(s.id, resolvedMode(s));
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const m: Mode = e.matches ? 'dark' : 'light';
      useSiteTheme.setState({ systemMode: m });
      const st = useSiteTheme.getState();
      if (!st.modePref) apply(st.id, m);
    });
  }
}

/** Hex colours for components that paint to a canvas and cannot read CSS variables. */
export function useSiteColors() {
  const id = useSiteTheme((s) => s.id);
  const mode = useSiteTheme(resolvedMode);
  return siteColors(id, mode);
}

export const useSiteMode = () => useSiteTheme(resolvedMode);

export const siteThemeName = (id: string) => palettes.find((p) => p.id === id)?.name ?? id;
