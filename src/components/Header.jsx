import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
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

  const homeLink = (hash) =>
    location.pathname === "/" ? hash : `/#${hash.replace("#", "")}`;


  // 2. ACÁ COLOCAMOS LA NUEVA FUNCIÓN DE SCROLL
  const scrollToSection = (e, sectionId) => {
    if (isHome) {
      e.preventDefault(); // Evita el salto brusco solo si ya estamos en la página de inicio
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" }); // Desliza suavemente
      }
      setOpen(false); // Cierra el menú hamburguesa en móviles al hacer clic
    }
  };

  const { scrolled, overIntro } = headerMode;

  return (
    <header
      className={`site-header${scrolled ? " scrolled" : ""}${overIntro ? " over-intro" : ""}`}
    >
      <div className="container header-inner">

        {/* ── Logo + nombre ── */}
        <Link className="brand" to="/">
          <div className="brand-logo">
            <img src="/Aires.github.io/img-neumaticos/logo.png" alt="Aires Neumáticos logo" />
          </div>
          <span className="brand-text">Aires Neumáticos</span>
        </Link>

        {/* ── Navegación ── */}
        <nav className="nav" aria-label="Principal">
          {/* Hamburguesa (solo mobile) */}
          <button
            className={`nav-toggle${open ? " active" : ""}`}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

        <ul className={`nav-list${open ? " open" : ""}`}>
            <li>
              <a href={homeLink("#nosotros")} onClick={(e) => scrollToSection(e, "nosotros")}>
                Nosotros
              </a>
            </li>
            <li>
              <a href={homeLink("#categorias")} onClick={(e) => scrollToSection(e, "categorias")}>
                Categorías
              </a>
            </li>
            <li>
              <a href={homeLink("#servicios")} onClick={(e) => scrollToSection(e, "servicios")}>
                Servicios
              </a>
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
                Contacto
              </a>
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
}