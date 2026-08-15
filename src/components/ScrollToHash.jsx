import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll suave a secciones cuando la URL trae hash (#nosotros, etc.). */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash || pathname !== "/") return;
    const id = hash.replace("#", "");
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
