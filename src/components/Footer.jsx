import { Link } from "react-router-dom";
import { APP_BASE } from "../config";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={`${APP_BASE}/img-neumaticos/logo.png`} alt="Aires Neumáticos" style={{ width: 24, height: 24, objectFit: "contain", borderRadius: 4 }} />
          <span>Aires Neumáticos</span>
        </div>
        <nav className="footer-nav" aria-label="Pie de página">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <a href="https://wa.me/5492983603968" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </nav>
        <p className="footer-copy">
          © {new Date().getFullYear()} Aires Neumáticos. Todos los derechos reservados.
        </p>
        <p className="footer-dev">
          Sitio desarrollado por{" "}
          <a href="https://www.linkedin.com/in/facundo-cazeaux-8b057a321/" target="_blank" rel="noopener noreferrer">Facundo Cazeaux</a>  - 02983385115
        </p>
      </div>
    </footer>
  );
}
