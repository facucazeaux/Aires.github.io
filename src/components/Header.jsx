import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const homeLink = (hash) =>
    location.pathname === "/" ? hash : `/${hash}`;

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <Link className="brand" to="/">
          <div className="brand-logo">
            <img src="img-neumaticos/logo.jpg" alt="Aires Neumáticos logo" />
          </div>
          <span className="brand-text">Aires Neumáticos</span>
        </Link>

        <nav className="nav" aria-label="Principal">
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
            <li><a href={homeLink("#nosotros")}>Nosotros</a></li>
            <li><a href={homeLink("#categorias")}>Categorías</a></li>
            <li><a href={homeLink("#servicios")}>Servicios</a></li>
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
