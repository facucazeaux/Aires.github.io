import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { APP_BASE } from "../config";
import "./Header.css";


export default function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [headerMode, setHeaderMode] = useState({ scrolled: false, overIntro: false });
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const introEnd = window.innerHeight * 0.88;
      const overIntro = isHome && y < introEnd;
      const scrolled = !overIntro && (y > 32 || !isHome);
      setHeaderMode({ scrolled, overIntro });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const scrollToSection = (e, sectionId) => {
    if (!isHome) return;
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const handleBrandClick = (e) => {
    setOpen(false); // Cierra el menú mobile en caso de estar abierto
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" }); // Desplaza suavemente hacia arriba si ya estás en el Inicio
    }
  };

  const sectionTo = (id) => ({ pathname: "/", hash: `#${id}` });

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
    setOpen(false);
  };

  const { scrolled, overIntro } = headerMode;

  const navLinks = (
    <>
      <li>
        <Link to={sectionTo("nosotros")} onClick={(e) => scrollToSection(e, "nosotros")}>
          Nosotros
        </Link>
      </li>
      <li>
        <Link to={sectionTo("categorias")} onClick={(e) => scrollToSection(e, "categorias")}>
          Categorías
        </Link>
      </li>
      <li>
        <Link to={sectionTo("servicios")} onClick={(e) => scrollToSection(e, "servicios")}>
          Servicios
        </Link>
      </li>
      <li>
        <Link to={sectionTo("contacto")} onClick={(e) => scrollToSection(e, "contacto")}>
          Contacto
        </Link>
      </li>
      <li>
        <NavLink className="btn btn-sm-nav" to="/catalogo">
          Ver catálogo
        </NavLink>
      </li>
      <li>
        <a
          className="btn"
          href="https://wa.me/5492983603968"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </li>
    </>
  );

  return (
    <header
      className={`site-header${scrolled ? " scrolled" : ""}${overIntro ? " over-intro" : ""}`}
    >
      <div className="container header-inner">
        <Link className="brand" to="/" onClick={handleBrandClick}>
          <div className="brand-logo">
            <img src={`${APP_BASE}/img-neumaticos/logo.png`} alt="Aires Neumáticos logo" />
          </div>
          <span className="brand-text">Aires Neumáticos</span>
        </Link>

        <form className="header-search" onSubmit={onSearch} role="search">
          <label htmlFor="header-search-input" className="sr-only">Buscar neumáticos</label>
          <input
            id="header-search-input"
            type="search"
            placeholder="Buscar medida, marca…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <nav className="nav" aria-label="Principal">
          <button
            className={`nav-toggle${open ? " active" : ""}`}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
            type="button"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

          {/* Pill de navegación de desktop: siempre montado, se oculta por CSS en mobile. */}
          <ul className="nav-list">{navLinks}</ul>
        </nav>
      </div>

      {/* Menú mobile: se monta/desmonta con React (no con display toggle) y se
          porta directo a <body>, fuera del header fixed+blur. Esto evita el bug
          de repintado de iOS/Chrome mobile donde un nodo persistente con
          backdrop-filter, anidado en un position:fixed, no se repinta al
          togglear su visibilidad mientras la página está scrolleada. */}
      {open && createPortal(
        <nav id="mobile-nav-panel" className="mobile-nav-panel" aria-label="Menú principal">
          <ul className="mobile-nav-list">{navLinks}</ul>
        </nav>,
        document.body
      )}
    </header>
  );
}