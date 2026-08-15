import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { fetchCategorias } from "../lib/categorias";
import { resolveImageUrl } from "../lib/storage";
import { productPath } from "../lib/slug";
import ErrorState from "../components/ErrorState";
import { WHATSAPP, BASE } from "../data/productos";
import "./Catalogo.css";

const BADGE_COLORS = {
  Tractor: "badge-tractor",
  Cosechadora: "badge-cosechadora",
  Implemento: "badge-implemento",
  Moto: "badge-moto",
  moto: "badge-moto",
};

// ── FUNCIÓN DE AYUDA: NORMALIZA Y LIMPIA CUALQUIER FORMATO DE CATEGORÍA ──
function getCategoriasArray(catData) {
  if (!catData) return [];

  if (Array.isArray(catData)) {
    return catData.map((c) => String(c).replace(/[\[\]"']/g, "").trim());
  }

  if (typeof catData === "string") {
    try {
      const parsed = JSON.parse(catData);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => String(c).replace(/[\[\]"']/g, "").trim());
      }
    } catch {
      // Si no es un JSON válido, seguimos a limpiar el string
    }
    return [catData.replace(/[\[\]"']/g, "").trim()];
  }

  return [String(catData)];
}

function buildWspUrl(p) {
  const cats = getCategoriasArray(p.categoria).join(", ");
  const msg =
    "Hola, quisiera consultar por este neumático:\n\n" +
    `Categoría: ${cats}\n` +
    `Marca/Modelo: ${p.marca} ${p.modelo}\n` +
    `Medida: ${p.medida}\n` +
    `Construcción: ${p.construccion}\n` +
    `Aplicación: ${p.aplicacion}\n` +
    `Código: ${p.codigo || p.id}\n\n` +
    "¿Me pueden pasar precio y disponibilidad?";
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function ProductCard({ p, index }) {
  const [expanded, setExpanded] = useState(false);
  const imgSrc = resolveImageUrl(p.imagen, BASE);

  // Lista limpia de categorías
  const categoriasLista = getCategoriasArray(p.categoria);

  return (
    <article className="prod-card fade-up" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="prod-img">
        {imgSrc ? (
          <img src={imgSrc} alt={`${p.marca} ${p.modelo}`} loading="lazy" />
        ) : (
          <div className="prod-img-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
              <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
            </svg>
            <span>Sin imagen</span>
          </div>
        )}

        {/* Muestra las etiquetas limpias sobre la imagen */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap", zIndex: 2 }}>
          {categoriasLista.map((cat, i) => (
            <span key={i} className={`prod-badge ${BADGE_COLORS[cat] || "badge-default"}`}>
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="prod-body">
        <div className="prod-header">
          <h3>{p.marca}</h3>
          <span className="prod-modelo">{p.modelo}</span>
        </div>
        <p className="prod-medida">
          <strong>{p.medida}</strong>
          <span className="dot-sep">·</span>
          {p.construccion}
        </p>
        <ul className="prod-specs">
          <li><span>Aplicación</span><b>{p.aplicacion}</b></li>
          <li><span>Código</span><b>{p.codigo || p.id}</b></li>
        </ul>

        {expanded && (
          <div className="prod-details">
            <div className="prod-details-grid">
              {[
                ["Medida", p.medida],
                ["Construcción", p.construccion],
                ["Índice de carga", p.indiceCarga],
                ["Velocidad", p.velocidad],
                ["Prof. de taco", p.profundidad],
              ].map(([k, v]) => (
                <div key={k} className="detail-cell">
                  <span>{k}</span><b>{v}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prod-actions">
          <Link className="btn btn-ghost" to={productPath(p)}>Ver ficha</Link>
          <a className="btn" href={buildWspUrl(p)} target="_blank" rel="noopener noreferrer">
            Consultar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.544 5.875L0 24l6.304-1.513A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.375l-.36-.213-3.73.895.937-3.619-.234-.372A9.818 9.818 0 1112 21.818z"/>
            </svg>
          </a>
          <button className="btn btn-ghost" onClick={() => setExpanded(!expanded)} type="button">
            {expanded ? "Ocultar" : "Ver detalles"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Catalogo() {
  const { categoria: categoriaParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtros = useMemo(() => ["Todas", ...categorias.map((c) => c.nombre)], [categorias]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [prodRes, cats] = await Promise.all([
      supabase.from("productos").select("*").order("id"),
      fetchCategorias().catch(() => []),
    ]);
    if (prodRes.error) {
      setError(prodRes.error.message);
      setProductos([]);
    } else {
      setProductos(prodRes.data || []);
    }
    setCategorias(cats);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const legacy = searchParams.get("categoria");
    const q = searchParams.get("q");
    if (q) setQuery(q);
    if (categoriaParam) {
      setCategoria(decodeURIComponent(categoriaParam));
    } else if (legacy) {
      setCategoria(legacy);
      navigate(`/catalogo/${encodeURIComponent(legacy)}`, { replace: true });
    } else {
      setCategoria("Todas");
    }
  }, [categoriaParam, searchParams, navigate]);

  // ── FILTRADO FLEXIBLE Y SEGURO ──
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return productos.filter((p) => {
      const pCats = getCategoriasArray(p.categoria);

      const okCat =
        categoria === "Todas" ||
        pCats.some((c) => c.toLowerCase() === categoria.toLowerCase());

      const okQ =
        !q ||
        [p.marca, p.modelo, p.medida, p.construccion, p.aplicacion, ...pCats]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return okCat && okQ;
    });
  }, [query, categoria, productos]);

  const setcat = (c) => {
    setCategoria(c);
    if (c !== "Todas") navigate(`/catalogo/${encodeURIComponent(c)}`);
    else navigate("/catalogo");
  };

  return (
    <main className="catalogo-page">
      <div className="catalogo-hero">
        <div className="catalogo-hero-glow" aria-hidden="true" />
        <div className="container">
          <span className="section-label">Productos</span>
          <h1 className="section-title" style={{ marginBottom: 8 }}>Catálogo</h1>
          <p className="catalogo-sub">Seleccioná un neumático y consultá directo por WhatsApp</p>
        </div>
      </div>

      <div className="container catalogo-body">
        <div className="catalogo-controls">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Buscar por medida, marca, modelo…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="cat-filters">
            {filtros.map((c) => (
              <button
                key={c}
                className={`filter-btn${categoria === c ? " active" : ""}`}
                onClick={() => setcat(c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)" }}>
            Cargando productos...
          </div>
        ) : error ? (
          <ErrorState
            title="No pudimos cargar el catálogo"
            message="Verificá tu conexión e intentá de nuevo. Si el problema persiste, escribinos por WhatsApp."
            onRetry={load}
          />
        ) : (
          <>
            <div className="results-meta">
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              {categoria !== "Todas" ? ` en ${categoria}` : ""}
              {query ? ` para "${query}"` : ""}
            </div>
            {filtered.length > 0 ? (
              <div className="prod-grid">
                {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
                  <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                  <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.2" />
                </svg>
                <h3>Sin resultados</h3>
                <p>
                  ¿No encontrás tu medida?{" "}
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                    Escribinos por WhatsApp
                  </a>{" "}
                  y te asesoramos.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}