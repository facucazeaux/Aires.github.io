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
  }, [pathname]);

  return <RouteSEO pathname={pathname} />;
}
