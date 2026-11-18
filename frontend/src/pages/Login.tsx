import { useState } from 'react';
import { post, useAuth, type User } from '../auth';
import Hero, { useViewportWidth } from '../components/Hero';
import FanToGrid from '../components/landing/FanToGrid';
import FloatingTiles from '../components/landing/FloatingTiles';
import StoryStack from '../components/landing/StoryStack';
import MarqueeStrip from '../components/landing/MarqueeStrip';
import StickerPlayground from '../components/landing/StickerPlayground';
import Backdrop from '../components/Backdrop';
import ClickSpark from '../reactbits/ClickSpark';
import ShinyText from '../reactbits/ShinyText';
import Magnet from '../reactbits/Magnet';
import { SPARKS } from '../lib/theme';

export default function Login() {
  const setSession = useAuth((s) => s.setSession);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const vw = useViewportWidth();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    // Read the inputs directly: browser autofill can fill them without React seeing a change event.
    const form = new FormData(e.currentTarget);
    const u = String(form.get('username') ?? '').trim();
    const pw = String(form.get('password') ?? '');
    if (!u || !pw) {
      setError('Enter your username and password.');
      return;
    }
    setUsername(u);
    setPassword(pw);
    setBusy(true);
    setError(null);
    try {
      const r = await post<{ token: string; user: User; unread: number }>('/auth/login', { username: u, password: pw });
      setSession(r.token, r.user, r.unread);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ClickSpark sparkColor={SPARKS} sparkCount={9} sparkRadius={22} sparkSize={9} duration={450}>
    <div className="shell">
      <Backdrop />
      <header className="topbar">
        <span className="logo">
          <ShinyText text="Clockwork" color="#1e1316" shineColor="#d6404f" speed={3.2} delay={2} />
        </span>
        <span className="topbar-note">Sign in</span>
      </header>
      <main className="main">
        <Hero art={<StickerPlayground width={vw < 820 ? Math.min(340, vw - 40) : Math.round(Math.min(380, vw * 0.27))} />}>
          <form className="login-card" onSubmit={submit}>
            <label className="field">
              Username
              <input type="text" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </label>
            <label className="field">
              Password
              <input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && <div className="error-box">{error}</div>}
            <Magnet padding={40} magnetStrength={4} maxOffset={8} wrapperClassName="login-magnet" innerClassName="login-magnet">
            <button type="submit" className="btn accent" aria-busy={busy}>
              {busy ? <span className="spinner" /> : null} {busy ? 'Signing in…' : 'Sign in'}
            </button>
            </Magnet>
            <p className="tiny" style={{ margin: 0 }}>
              Teachers and students get their accounts from the administrator.
            </p>
          </form>
        </Hero>
        <FanToGrid cardWidth={vw < 820 ? Math.round((vw - 56) / 2) : Math.round(Math.min(200, vw / 7.2))} />
        <FloatingTiles />
        <StoryStack posterWidth={vw < 820 ? Math.min(220, vw - 100) : 230} />
        <MarqueeStrip />
        <footer className="land-foot">
          <span>Clockwork · multi-objective timetabling</span>
          <span>Sample timetables on this page use the built-in demo department, not optimiser results.</span>
        </footer>
      </main>
    </div>
    </ClickSpark>
  );
}
