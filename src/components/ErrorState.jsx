import { Link } from "react-router-dom";
import "./ErrorState.css";

export default function ErrorState({ title = "Algo salió mal", message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
      </svg>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="error-state-actions">
        {onRetry && (
          <button type="button" className="btn" onClick={onRetry}>
            Reintentar
          </button>
        )}
        <Link className="btn btn-outline" to="/">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
