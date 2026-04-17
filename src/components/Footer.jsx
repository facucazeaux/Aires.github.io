import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="img-neumaticos/logo.jpg" alt="Aires Neumáticos" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }} />
          <span>Aires Neumáticos</span>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} Aires Neumáticos. Todos los derechos reservados.
        </p>
        <p className="footer-dev">
          Sitio desarrollado por{" "}
          <a href="#" rel="author">Facundo Cazeaux</a>
        </p>
      </div>
    </footer>
  );
}


