import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RouteSEO } from "./SEO";
import { initAnalytics, trackPageView } from "../lib/analytics";

export default function SiteHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
    // Cambia el título dinámico en cada cambio de ruta
    document.title = "Aires Neumáticos | Tres Arroyos";
  }, [pathname]);

  return <RouteSEO pathname={pathname} />;
}