import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Al cambiar de página, vuelve arriba (excepto si hay hash de sección). */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
