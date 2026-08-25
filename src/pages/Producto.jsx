import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { WHATSAPP, BASE } from "../data/productos";
import { resolveImageUrl } from "../lib/storage";
import { formatCategoria, formatAplicacion, getCategoriasArray } from "../lib/categorias";
import SEO from "../components/SEO";
import ErrorState from "../components/ErrorState";
import { absoluteUrl } from "../config";
import "./Producto.css";

function buildWspUrl(p) {
  const msg =
    "Hola, quisiera consultar por este neumático:\n\n" +
    `Categoría: ${formatCategoria(p.categoria)}\n` +
    `Marca/Modelo: ${p.marca} ${p.modelo}\n` +
    `Medida: ${p.medida}\n` +
    `Construcción: ${p.construccion}\n` +
    `Aplicación: ${formatAplicacion(p.aplicacion) || "-"}\n` +
    `Código: ${p.codigo || p.id}\n\n` +
    "¿Me pueden pasar precio y disponibilidad?";
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export default function Producto() {
  const { slug } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("productos")
      .select("*")
      .eq("slug", decodeURIComponent(slug))
      .maybeSingle();
    if (err) setError(err.message);
    else if (!data) setError("Producto no encontrado.");
    else setProducto(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  if (loading) {
    return (
      <main className="producto-page">
        <div className="container producto-loading">Cargando producto...</div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="producto-page">
        <SEO title="Producto no encontrado" description="El producto no existe." path={`/producto/${slug}`} noindex />
        <div className="container">
          <ErrorState
            title="Producto no encontrado"
            message={error || "No encontramos este neumático en el catálogo."}
            onRetry={load}
          />
          <p style={{ textAlign: "center", marginTop: 16 }}>
            <Link to="/catalogo">← Volver al catálogo</Link>
          </p>
        </div>
      </main>
    );
  }

  const imgSrc = resolveImageUrl(producto.imagen, BASE);
  const categoriasArray = getCategoriasArray(producto.categoria);
  const categoriaTexto = formatCategoria(producto.categoria);
  const categoriaPrincipal = categoriasArray[0] || categoriaTexto;
  const aplicacionTexto = formatAplicacion(producto.aplicacion);
  const specs = [
    ["Medida", producto.medida],
    ["Construcción", producto.construccion],
    ["Categoría", categoriaTexto],
    ["Aplicación", aplicacionTexto],
    ["Índice de carga", producto.indiceCarga],
    ["Velocidad", producto.velocidad],
    ["Prof. de taco", producto.profundidad],
    ["Código", producto.codigo || producto.id],
  ].filter(([, v]) => v);

  return (
    <main id="main-content" className="producto-page">
      <SEO
        title={`${producto.marca} ${producto.modelo} — Aires Neumáticos`}
        description={`${producto.medida} · ${producto.construccion}. Consultá precio y disponibilidad.`}
        path={`/producto/${producto.slug}`}
        image={producto.imagen?.startsWith("http") ? producto.imagen : absoluteUrl(resolveImageUrl(producto.imagen, BASE))}
        type="product"
      />

      <div className="producto-breadcrumb container">
        <Link to="/">Inicio</Link>
        <span aria-hidden>/</span>
        <Link to="/catalogo">Catálogo</Link>
        <span aria-hidden>/</span>
        <span>{producto.marca} {producto.modelo}</span>
      </div>

      <div className="container producto-grid">
        <div className="producto-media">
          {imgSrc ? (
            <img src={imgSrc} alt={`${producto.marca} ${producto.modelo}`} />
          ) : (
            <div className="producto-media-placeholder">Sin imagen</div>
          )}
        </div>

        <div className="producto-info">
          <span className="producto-cat">{categoriaTexto}</span>
          <h1>{producto.marca}</h1>
          <p className="producto-modelo">{producto.modelo}</p>
          <p className="producto-medida">{producto.medida} · {producto.construccion}</p>

          <dl className="producto-specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="producto-actions">
            <a className="btn" href={buildWspUrl(producto)} target="_blank" rel="noopener noreferrer">
              Consultar por WhatsApp
            </a>
            <Link className="btn btn-outline" to={`/catalogo/${encodeURIComponent(categoriaPrincipal)}`}>
              Ver más {categoriaPrincipal}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
