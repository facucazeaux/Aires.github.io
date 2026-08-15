import { GA_ID, PLAUSIBLE_DOMAIN } from "../config";

let gaLoaded = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function initAnalytics() {
  if (GA_ID && !gaLoaded) {
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`).catch(() => {});
  }

  if (PLAUSIBLE_DOMAIN && !document.querySelector("[data-plausible]")) {
    const s = document.createElement("script");
    s.defer = true;
    s.dataset.plausible = "true";
    s.dataset.domain = PLAUSIBLE_DOMAIN;
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }
}

export function trackPageView(path) {
  if (GA_ID && window.gtag) {
    window.gtag("event", "page_view", { page_path: path });
  }
  if (PLAUSIBLE_DOMAIN && window.plausible) {
    window.plausible("pageview");
  }
}

export function trackEvent(name, props = {}) {
  if (GA_ID && window.gtag) {
    window.gtag("event", name, props);
  }
  if (PLAUSIBLE_DOMAIN && window.plausible) {
    window.plausible(name, { props });
  }
}
