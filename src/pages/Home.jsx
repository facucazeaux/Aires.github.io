import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { WHATSAPP, BASE } from "../data/productos";
import { fetchCategorias, categoriaToHomeItem } from "../lib/categorias";
import { INTRO_VIDEO_POSTER, INTRO_VIDEO_SOURCES } from "../data/introVideo";
import "./Home.css";

/** Fallback si Supabase aún no tiene categorías cargadas. */
const CATEGORIAS_FALLBACK = [
  {
    title: "Tractores",
    desc: "R1, R1W, radial y diagonal para máxima tracción y durabilidad en todo tipo de suelo.",
    tag: "Tractor",
    img: `${BASE}/img-neumaticos/tractor_home.jpg`,
  },
  {
    title: "Cosechadoras",
    desc: "Baja compactación y alta capacidad de carga para proteger el suelo en cosecha.",
    tag: "Cosechadora",
    img: `${BASE}/img-neumaticos/cosechadora_home.jpg`,
  },
  {
    title: "Implementos",
    desc: "Carros, sembradoras, pulverizadoras y todo lo que rueda en el campo.",
    tag: "Implemento",
    img: `${BASE}/img-neumaticos/sembradora_home.webp`,
  },
];

/* ── MARCAS CON LAS QUE TRABAJAMOS ── */
const MARCAS = [
  { name: "Kenda", img: `${BASE}/img-neumaticos/KENDA.jpeg` },
  { name: "MRL", img: `${BASE}/img-neumaticos/MRL.jpeg` },
  { name: "Titan", img: `${BASE}/img-neumaticos/TITAN.jpeg` },
  { name: "Tortuga", img: `${BASE}/img-neumaticos/TORTUGA.jpeg` },
  { name: "Unimax", img: `${BASE}/img-neumaticos/UNIMAX.jpeg` },
  { name: "Alliance", img: `${BASE}/img-neumaticos/ALLIANCE.jpeg` },
  { name: "BKT", img: `${BASE}/img-neumaticos/BKT.jpeg` },
  { name: "Forerunner", img: `${BASE}/img-neumaticos/FORERUNNER.jpeg` },
];

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

/* ── Contact form → Supabase + WhatsApp ── */
function ContactForm() {
  const [fields, setFields] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState("");
  const [formLoadedAt] = useState(() => Date.now());

  const set = (k) => (e) => setFields({ ...fields, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (website.trim() !== "") {
      setStatus({ type: "ok", msg: "¡Consulta registrada! Abrimos WhatsApp para que enviés tu mensaje." });
      setFields({ nombre: "", email: "", telefono: "", mensaje: "" });
      return;
    }

    if (Date.now() - formLoadedAt < 2000) {
      setStatus({ type: "err", msg: "Completá el formulario antes de enviarlo." });
      return;
    }

    if (!fields.nombre || !fields.email) {
      setStatus({ type: "err", msg: "Completá Nombre y Email para continuar." });
      return;
    }
    setSending(true);
    setStatus(null);

    const { error } = await supabase.from("consultas").insert([{
      nombre: fields.nombre.trim().slice(0, 120),
      email: fields.email.trim().slice(0, 200),
      telefono: fields.telefono.trim().slice(0, 40),
      mensaje: fields.mensaje.trim().slice(0, 2000),
    }]);

    const text =
      "Hola, les escribo desde la web de Aires Neumáticos.\n\n" +
      `Nombre: ${fields.nombre}\nEmail: ${fields.email}\n` +
      `Teléfono: ${fields.telefono || "-"}\n\nMensaje:\n${fields.mensaje || "-"}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");

    if (error) {
      setStatus({ type: "err", msg: "Guardamos tu consulta en WhatsApp, pero hubo un error al registrarla. Igual te vamos a responder." });
    } else {
      setStatus({ type: "ok", msg: "¡Consulta registrada! Abrimos WhatsApp para que enviés tu mensaje." });
      setFields({ nombre: "", email: "", telefono: "", mensaje: "" });
    }
    setSending(false);
  };

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="website">No completar</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
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
      <button className="btn" type="submit" disabled={sending}>
        {sending ? "Enviando..." : "Enviar consulta"}
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

/* ── Video intro ── */
function VideoIntro() {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  return (
    <section className="video-intro" aria-label="Introducción">
      <video
        ref={videoRef}
        className="video-intro__media"
        autoPlay
        muted
        loop
        playsInline
        poster={INTRO_VIDEO_POSTER}
      >
        {INTRO_VIDEO_SOURCES.map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
      </video>
      <div className="video-intro__overlay" aria-hidden="true" />
      <div className="video-intro__content">
        <p className="video-intro__eyebrow">Neumáticos agrícolas · Argentina</p>
        <h2 className="video-intro__title">
          El neumático ideal para que tu trabajo rinda el máximo
        </h2>
      </div>
      <button
        type="button"
        className="video-intro__toggle"
        onClick={toggle}
        aria-label={paused ? "Reproducir video" : "Pausar video"}
      >
        {paused ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </button>
    </section>
  );
}

/* ── Carrusel Infinito de Marcas ── */
function BrandsCarousel() {
  const doubleBrands = [...MARCAS, ...MARCAS];

  return (
    <section className="brands-section">
      <div className="container brands-header">
        <span className="section-label">Marcas</span>
        <h2 className="section-title">Marcas con las que trabajamos</h2>
      </div>
      <div className="brands-ticker">
        <div className="brands-track">
          {doubleBrands.map((marca, i) => (
            <div className="brand-card" key={`${marca.name}-${i}`}>
              <img src={marca.img} alt={marca.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Categorías Carousel ── */
function CategoryCarousel({ items, catIn }) {
  const scrollRef = useRef(null);

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.firstElementChild;
    const gap = 20;
    const step = slide ? slide.getBoundingClientRect().width + gap : Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="cat-carousel">
      <button
        type="button"
        className="cat-carousel__btn cat-carousel__btn--prev"
        onClick={() => scrollByDir(-1)}
        aria-label="Categorías anteriores"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="cat-carousel__scroll"
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Categorías de productos"
      >
        {items.map(({ title, desc, tag, img }, i) => (
          <article
            key={tag}
            className={`cat-card${catIn ? ` fade-up fade-up-delay-${(i % 4) + 1}` : ""}`}
          >
            <div className="cat-card-img">
              <img src={img} alt={title} />
            </div>
            <div className="cat-card-inner">
              <div className="cat-badge">{tag}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link className="cat-link" to={`/catalogo/${encodeURIComponent(tag)}`}>
                Ver productos →
              </Link>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="cat-carousel__btn cat-carousel__btn--next"
        onClick={() => scrollByDir(1)}
        aria-label="Categorías siguientes"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════ */
export default function Home() {
  const [heroRef, heroIn] = useInView(0.1);
  const [nosRef, nosIn] = useInView();
  const [catRef, catIn] = useInView();
  const [srvRef, srvIn] = useInView();
  const [mapRef, mapIn] = useInView();
  const [statRef, statIn] = useInView();
  const [conRef, conIn] = useInView();
  const [categoriasHome, setCategoriasHome] = useState(CATEGORIAS_FALLBACK);

  useEffect(() => {
    fetchCategorias()
      .then((cats) => {
        if (cats.length > 0) {
          setCategoriasHome(cats.map(c => categoriaToHomeItem(c, BASE)));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main>
      <VideoIntro />

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
                src={`${BASE}/img-neumaticos/negocio_por_fuera.jpg`}
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
            { label: "Años en el mercado", value: 20, suffix: "+" },
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

      {/* ── MARCAS ── */}
      <BrandsCarousel />

      {/* ── CATEGORIAS ── */}
      <section id="categorias" className="section cat-section" ref={catRef}>
        <div className="container">
          <span className="section-label">Productos</span>
          <h2 className="section-title">Categorías disponibles</h2>
          <CategoryCarousel items={categoriasHome} catIn={catIn} />
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="section" ref={srvRef}>
        <div className="container">
          <span className="section-label">Servicios</span>
          <h2 className="section-title">Todo lo que necesitás</h2>
          <div className="grid-3">
            {[
              { icon: "⚡", title: "Rápida atención y costo conveniente", desc: "Te respondemos rápido, con el precio más conveniente para tu operación.", delay: 1 },
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

      {/* ── UBICACIÓN ── */}
      <section id="ubicacion" className="section map-section" ref={mapRef}>
        <div className="container">
          <div className={mapIn ? "fade-up" : ""}>
            <span className="section-label">Ubicación</span>
            <h2 className="section-title">Nuestra Ubicación</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 16px" }}>
              Visítanos en nuestra sucursal para recibir asesoramiento personalizado sobre la compra y cambio de tus neumáticos.
            </p>
            <div className="map-info">
              <span className="map-info-item">
                📍 <strong>Dirección:</strong> Av. Almafuerte 125, Tres Arroyos
              </span>
              <span className="map-info-item">
                🕐 <strong>Horarios:</strong> Lun a Vie: 8:30 a 18:00 hs
              </span>
              <span className="map-info-item">
                📞 <strong>Teléfono:</strong> +54 9 2983 60-3968
              </span>
            </div>
          </div>
          <div className={`map-wrapper${mapIn ? " fade-up fade-up-delay-2" : ""}`}>
            <iframe
              title="Ubicación de Aires Neumáticos"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3133.275133379207!2d-60.2796120235334!3d-38.37731767183861!2m3!1f0!0f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9592f2c8d2d6f78d%3A0x1b4b6ee980b1e42a!2sAv.%20Almafuerte%20125%2C%20B7500%20Tres%20Arroyos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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

                  <span className="contact-label">WhatsApp</span>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                    +54 9 2983 66-4193
                  </a>



                   <span className="contact-label">TELÉFONO FIJO</span>
                  <a href="tel:+542983426110" target="_blank" rel="noopener noreferrer">
                    +54 2983 42-6110
                  </a>

                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div>
                  <span className="contact-label">Email</span>
                  <a href="mailto:fcazeaux8@yahoo.com.ar">
                    fcazeaux8@yahoo.com.ar
                  </a>


                   <span className="contact-label">Email</span>
                  <a href="mailto:pepoulsen58@gmail.com">
                    pepoulsen58@gmail.com
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