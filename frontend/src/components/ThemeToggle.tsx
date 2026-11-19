import { useSiteMode, useSiteTheme } from '../lib/siteTheme';

/** Sun / moon button in the top bar that switches the whole site between light and dark. */
export default function ThemeToggle() {
  const mode = useSiteMode();
  const toggle = useSiteTheme((s) => s.toggleMode);
  const dark = mode === 'dark';
  return (
    <button
      type="button"
      className="mode-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </>
        ) : (
          <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" />
        )}
      </svg>
    </button>
  );
}
