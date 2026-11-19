/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the hosted Python server, without /api. Empty = same origin (the Vite proxy in development). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
