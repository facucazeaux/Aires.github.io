import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WHATSAPP } from "../data/productos";
import "./Home.css";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Animated counter ── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Contact form → WhatsApp ── */
function ContactForm() {
  const [fields, setFields] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [status, setStatus] = useState(null);

  const set = (k) => (e) => setFields({ ...fields, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!fields.nombre || !fields.email) {
      setStatus({ type: "err", msg: "Completá Nombre y Email para continuar." });
      return;
    }
    const text =
      "Hola, les escribo desde la web de Aires Neumáticos.\n\n" +
      `Nombre: ${fields.nombre}\nEmail: ${fields.email}\n` +
      `Teléfono: ${fields.telefono || "-"}\n\nMensaje:\n${fields.mensaje || "-"}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    setStatus({ type: "ok", msg: "¡Abrimos WhatsApp para que enviés tu consulta!" });
    setFields({ nombre: "", email: "", telefono: "", mensaje: "" });
  };

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form-row">
        <div className="field">
          <label htmlFor="nombre">Nombre *</label>
          <input id="nombre" type="text" placeholder="Tu nombre" value={fields.nombre} onChange={set("nombre")} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email *</label>
          <input id="email" type="email" placeholder="tu@mail.com" value={fields.email} onChange={set("email")} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="telefono">Teléfono</label>
        <input id="telefono" type="tel" placeholder="+54 9 ..." value={fields.telefono} onChange={set("telefono")} />
      </div>
      <div className="field">
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" rows={5} placeholder="Contanos el equipo, medida y aplicación" value={fields.mensaje} onChange={set("mensaje")} />
      </div>
      <button className="btn" type="submit">
        Enviar por WhatsApp
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.544 5.875L0 24l6.304-1.513A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.375l-.36-.213-3.73.895.937-3.619-.234-.372A9.818 9.818 0 1112 21.818z"/>
        </svg>
      </button>
      {status && (
        <p className={`form-status ${status.type}`}>{status.msg}</p>
      )}
    </form>
  );
}

/* ══════════════════════════════════════ */
export default function Home() {
  const [heroRef, heroIn] = useInView(0.1);
  const [nosRef, nosIn] = useInView();
  const [catRef, catIn] = useInView();
  const [srvRef, srvIn] = useInView();
  const [statRef, statIn] = useInView();
  const [conRef, conIn] = useInView();

  return (
    <main>
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-inner">
          <div className={`hero-copy${heroIn ? " fade-up" : ""}`}>
            <span className="section-label">Neumáticos agrícolas</span>
            <h1>
              El neumático correcto
              <br />
              <span className="hero-accent">para cada campaña</span>
            </h1>
            <p>
              Asesoramiento técnico real, entrega rápida y stock disponible
              pensado para tractores, cosechadoras e implementos.
            </p>
            <div className="hero-cta">
              <a className="btn" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                Pedí tu cotización
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.544 5.875L0 24l6.304-1.513A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.375l-.36-.213-3.73.895.937-3.619-.234-.372A9.818 9.818 0 1112 21.818z"/></svg>
              </a>
              <Link className="btn btn-outline" to="/catalogo">
                Ver catálogo →
              </Link>
            </div>
            <ul className="hero-pills">
              {["Marcas líderes", "Garantía y soporte", "Envío nacional"].map((t) => (
                <li key={t}>
                  <span className="pill-dot" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className={`hero-media${heroIn ? " fade-up fade-up-delay-2" : ""}`}>
            <div className="hero-img-wrap">
              <img
                src="/img-neumaticos/negocio_por_fuera.jpg"   
                alt="Local Aires Neumáticos"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-strip" ref={statRef}>
        <div className="container stats-inner">
          {[
            { label: "Años en el mercado", value: 15, suffix: "+" },
            { label: "Marcas disponibles", value: 12, suffix: "+" },
            { label: "Clientes activos", value: 400, suffix: "+" },
            { label: "Envíos por año", value: 1200, suffix: "+" },
          ].map(({ label, value, suffix }, i) => (
            <div className={`stat-item${statIn ? ` fade-up fade-up-delay-${i + 1}` : ""}`} key={label}>
              <span className="stat-value">
                {statIn ? <Counter to={value} suffix={suffix} /> : `0${suffix}`}
              </span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOSOTROS ── */}
      <section id="nosotros" className="section" ref={nosRef}>
        <div className="container">
          <span className="section-label">¿Por qué elegirnos?</span>
          <h2 className="section-title">Experiencia que se nota en el campo</h2>
          <div className="grid-3">
            {[
              {
                icon: "🔧",
                title: "Asesoramiento experto",
                desc: "Te ayudamos a elegir el neumático adecuado según suelo, carga y aplicación. Sin rodeos.",
                delay: 1,
              },
              {
                icon: "🚚",
                title: "Stock y entrega ágil",
                desc: "Disponibilidad real y logística pensada para que no se detenga tu trabajo ni un día.",
                delay: 2,
              },
              {
                icon: "✅",
                title: "Calidad garantizada",
                desc: "Marcas confiables, garantía de fábrica y respaldo posventa en cada producto.",
                delay: 3,
              },
            ].map(({ icon, title, desc, delay }) => (
              <article
                key={title}
                className={`feature-card${nosIn ? ` fade-up fade-up-delay-${delay}` : ""}`}
              >
                <div className="feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS ── */}
      <section id="categorias" className="section cat-section" ref={catRef}>
        <div className="container">
          <span className="section-label">Productos</span>
          <h2 className="section-title">Categorías disponibles</h2>
          <div className="cat-grid">
            {[
              {
                title: "Tractores",
                desc: "R1, R1W, radial y diagonal para máxima tracción y durabilidad en todo tipo de suelo.",
                tag: "Tractor",
                img: "./img-neumaticos/tractor_home.jpg",
                delay: 1,
              },
              {
                title: "Cosechadoras",
                desc: "Baja compactación y alta capacidad de carga para proteger el suelo en cosecha.",
                tag: "Cosechadora",
                img: "./img-neumaticos/cosechadora_home.jpg",
                delay: 2,
              },
              {
                title: "Implementos",
                desc: "Carros, sembradoras, pulverizadoras y todo lo que rueda en el campo.",
                tag: "Implemento",
                img: "./img-neumaticos/sembradora_home.webp",
                delay: 3,
              },
            ].map(({ title, desc, tag, img, delay }) => (
              <article
                key={title}
                className={`cat-card${catIn ? ` fade-up fade-up-delay-${delay}` : ""}`}
              >
                <div className="cat-card-img">
                  <img src={img} alt={title} />
                </div>
                <div className="cat-card-inner">
                  <div className="cat-badge">{tag}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <Link
                    className="cat-link"
                    to={`/catalogo?categoria=${tag}`}
                  >
                    Ver productos →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="section" ref={srvRef}>
        <div className="container">
          <span className="section-label">Servicios</span>
          <h2 className="section-title">Todo lo que necesitás</h2>
          <div className="grid-3">
            {[
              { icon: "🔩", title: "Venta y colocación", desc: "Montaje y balanceo con personal capacitado.", delay: 1 },
              { icon: "📦", title: "Envío a todo el país", desc: "Coordinamos logística para tu campo o taller.", delay: 2 },
              { icon: "🛡️", title: "Garantía y respaldo", desc: "Acompañamos el ciclo de vida de tus neumáticos.", delay: 3 },
            ].map(({ icon, title, desc, delay }) => (
              <article
                key={title}
                className={`service-card${srvIn ? ` fade-up fade-up-delay-${delay}` : ""}`}
              >
                <span className="service-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="section contact-section" ref={conRef}>
        <div className="container contact-inner">
          <div className={`contact-copy${conIn ? " fade-up" : ""}`}>
            <span className="section-label">Contacto</span>
            <h2 className="section-title" style={{ marginBottom: 24 }}>
              Hablemos de tu equipo
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
              Contanos qué máquina tenés y te cotizamos rápido.
            </p>
            <ul className="contact-list">
              <li>
                <span className="contact-icon">📱</span>
                <div>
                  <span className="contact-label">WhatsApp</span>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                    +54 9 2983 60-3968
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div>
                  <span className="contact-label">Email</span>
                  <a href="mailto:contacto@airesneumaticos.com">
                    contacto@airesneumaticos.com
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                <div>
                  <span className="contact-label">Horario</span>
                  <span>Lunes a viernes · 8:30 – 18:00 hs</span>
                </div>
              </li>
            </ul>
          </div>
          <div className={`contact-form-wrap${conIn ? " fade-up fade-up-delay-2" : ""}`}>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
