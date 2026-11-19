// Where the Python server lives.
// Locally (npm run dev) this is '/api', which Vite proxies to port 8000 (see vite.config.ts).
// On Vercel, set VITE_API_URL to the hosted backend, e.g. https://clockwork-api.onrender.com
const origin = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

export const API_BASE = `${origin}/api`;
