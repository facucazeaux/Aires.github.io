import { useEffect } from "react";
import { absoluteUrl, SITE_NAME, SITE_OG_IMAGE } from "../config";

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  if (!href) return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEO({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noindex = false,
}) {
  const url = absoluteUrl(path);
  const ogImage = image || SITE_OG_IMAGE;

  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);

    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", type, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", "es_AR", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);
  }, [title, description, url, ogImage, type, noindex]);

  return null;
}

export function RouteSEO({ pathname, product }) {
  const configs = {
    home: {
      title: `${SITE_NAME} — Neumáticos Agrícolas`,
      description: "Neumáticos agrícolas para tractores, cosechadoras e implementos. Asesoramiento técnico, stock y envío nacional.",
      path: "/",
    },
    catalogo: {
      title: `Catálogo — ${SITE_NAME}`,
      description: "Explorá nuestro catálogo de neumáticos agrícolas. Consultá precio y disponibilidad por WhatsApp.",
      path: "/catalogo",
    },
    admin: {
      title: `Administración — ${SITE_NAME}`,
      description: "Panel de administración.",
      path: "/admin",
      noindex: true,
    },
    notFound: {
      title: `Página no encontrada — ${SITE_NAME}`,
      description: "La página que buscás no existe.",
      noindex: true,
    },
  };

  if (product) {
    const name = `${product.marca} ${product.modelo}`;
    return (
      <SEO
        title={`${name} — ${SITE_NAME}`}
        description={`${product.medida} · ${product.construccion}. ${product.aplicacion || "Consultá precio y disponibilidad."}`}
        path={`/producto/${product.slug}`}
        image={product.imagen?.startsWith("http") ? product.imagen : undefined}
        type="product"
      />
    );
  }

  if (pathname.startsWith("/producto/")) return null;
  if (pathname === "/admin") return <SEO {...configs.admin} />;
  if (pathname === "/catalogo") return <SEO {...configs.catalogo} />;
  if (pathname.startsWith("/catalogo/")) {
    const cat = decodeURIComponent(pathname.replace("/catalogo/", ""));
    return (
      <SEO
        title={`${cat} — Catálogo — ${SITE_NAME}`}
        description={`Neumáticos ${cat} agrícolas. Stock, asesoramiento y envío.`}
        path={pathname}
      />
    );
  }
  if (pathname !== "/") return <SEO {...configs.notFound} path={pathname} />;
  return <SEO {...configs.home} />;
}
