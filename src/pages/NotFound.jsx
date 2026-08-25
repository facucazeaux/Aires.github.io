import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="container not-found-inner">
        <span className="not-found-code">404</span>
        <h1>Página no encontrada</h1>
        <p>La ruta que buscás no existe o fue movida.</p>
        <div className="not-found-actions">
          <Link className="btn" to="/">Ir al inicio</Link>
          <Link className="btn btn-outline" to="/catalogo">Ver catálogo</Link>
        </div>
      </div>
    </main>
  );
}
