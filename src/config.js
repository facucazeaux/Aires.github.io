/** Base path del deploy (ej. /Aires.github.io). Viene de vite.config base. */
export const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** basename para React Router (con slash inicial). */
export const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

/** URL pública absoluta del sitio (SEO, OG, sitemap). Configurá tu dominio acá. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  "https://facucazeaux.github.io/Aires.github.io"
).replace(/\/$/, "");

export const SITE_NAME = "Aires Neumáticos";
export const SITE_DESCRIPTION =
  "Venta de neumáticos agrícolas. Tractores, cosechadoras e implementos. Asesoramiento técnico, stock y envío a todo el país.";
export const SITE_OG_IMAGE = `${SITE_URL}${APP_BASE}/img-neumaticos/logo.png`;

export const WHATSAPP = "5492983603968";

/** Google Analytics 4 — opcional, definir VITE_GA_MEASUREMENT_ID en .env */
export const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

/** Plausible — alternativa privacy-friendly, definir VITE_PLAUSIBLE_DOMAIN */
export const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || "";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${p}`;
}
