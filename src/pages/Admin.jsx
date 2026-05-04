import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import "./Admin.css";

const EMPTY = {
  codigo: "", categoria: "Tractor", marca: "", modelo: "",
  medida: "", construccion: "Radial", aplicacion: "",
  indiceCarga: "", velocidad: "", profundidad: "", imagen: "",
};

const CATEGORIAS = ["Tractor", "Cosechadora", "Implemento"];
const CONSTRUCCIONES = ["Radial", "Diagonal"];

// ── LOGIN ──
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setErr("Email o contraseña incorrectos.");
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <img src="/Aires.github.io/img-neumaticos/logo.jpg" alt="Aires" />
        </div>
        <h1>Panel de administración</h1>
        <p>Aires Neumáticos</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@airesneumaticos.com" required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <p className="form-status err">{err}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── FORM PRODUCTO ──
function ProductoForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.marca || !form.modelo || !form.medida) {
      setErr("Marca, modelo y medida son obligatorios.");
      return;
    }
    setLoading(true);
    setErr("");
    await onSave(form);
    setLoading(false);
  };

  return (
    <form className="prod-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label>Código</label>
          <input type="text" value={form.codigo} onChange={set("codigo")} placeholder="TR-01" />
        </div>
        <div className="field">
          <label>Categoría</label>
          <select value={form.categoria} onChange={set("categoria")}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Marca *</label>
          <input type="text" value={form.marca} onChange={set("marca")} placeholder="BKT" required />
        </div>
        <div className="field">
          <label>Modelo *</label>
          <input type="text" value={form.modelo} onChange={set("modelo")} placeholder="Agrimax Force" required />
        </div>
        <div className="field">
          <label>Medida *</label>
          <input type="text" value={form.medida} onChange={set("medida")} placeholder="600/70R30" required />
        </div>
        <div className="field">
          <label>Construcción</label>
          <select value={form.construccion} onChange={set("construccion")}>
            {CONSTRUCCIONES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Aplicación</label>
          <input type="text" value={form.aplicacion} onChange={set("aplicacion")} placeholder="Tracción / Campo" />
        </div>
        <div className="field">
          <label>Índice de carga</label>
          <input type="text" value={form.indiceCarga} onChange={set("indiceCarga")} placeholder="161A8" />
        </div>
        <div className="field">
          <label>Velocidad</label>
          <input type="text" value={form.velocidad} onChange={set("velocidad")} placeholder="A8" />
        </div>
        <div className="field">
          <label>Profundidad</label>
          <input type="text" value={form.profundidad} onChange={set("profundidad")} placeholder="38 mm" />
        </div>
        <div className="field field-full">
          <label>URL de imagen</label>
          <input type="text" value={form.imagen} onChange={set("imagen")} placeholder="/img-neumaticos/nombre.jpg" />
        </div>
      </div>
      {err && <p className="form-status err">{err}</p>}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar producto"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── ADMIN PANEL ──
export default function Admin() {
  const [session, setSession] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("lista"); // lista | nuevo | editar
  const [editando, setEditando] = useState(null);
  const [msg, setMsg] = useState("");

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Cargar productos
  useEffect(() => {
    if (session) fetchProductos();
  }, [session]);

  const fetchProductos = async () => {
    setLoading(true);
    const { data } = await supabase.from("productos").select("*").order("id");
    setProductos(data || []);
    setLoading(false);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const guardar = async (form) => {
    if (editando) {
      await supabase.from("productos").update({
        codigo: form.codigo, categoria: form.categoria, marca: form.marca,
        modelo: form.modelo, medida: form.medida, construccion: form.construccion,
        aplicacion: form.aplicacion, indiceCarga: form.indiceCarga,
        velocidad: form.velocidad, profundidad: form.profundidad, imagen: form.imagen,
      }).eq("id", editando.id);
      showMsg("✓ Producto actualizado correctamente.");
    } else {
      await supabase.from("productos").insert([{
        codigo: form.codigo, categoria: form.categoria, marca: form.marca,
        modelo: form.modelo, medida: form.medida, construccion: form.construccion,
        aplicacion: form.aplicacion, indiceCarga: form.indiceCarga,
        velocidad: form.velocidad, profundidad: form.profundidad, imagen: form.imagen,
      }]);
      showMsg("✓ Producto agregado correctamente.");
    }
    await fetchProductos();
    setVista("lista");
    setEditando(null);
  };

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminás "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("productos").delete().eq("id", id);
    showMsg("✓ Producto eliminado.");
    fetchProductos();
  };

  const logout = () => supabase.auth.signOut();

  if (!session) return <Login />;

  return (
    <div className="admin-wrap">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src="/Aires.github.io/img-neumaticos/logo.jpg" alt="Aires" />
            <div>
              <span className="admin-title">Panel de administración</span>
              <span className="admin-sub">Aires Neumáticos</span>
            </div>
          </div>
          <div className="admin-header-actions">
            <span className="admin-email">{session.user.email}</span>
            <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Mensaje de éxito */}
        {msg && <div className="admin-msg">{msg}</div>}

        {vista === "lista" && (
          <>
            <div className="admin-toolbar">
              <div>
                <h2>Productos <span className="count-badge">{productos.length}</span></h2>
                <p>Administrá el catálogo de neumáticos</p>
              </div>
              <button className="btn" onClick={() => { setEditando(null); setVista("nuevo"); }}>
                + Agregar producto
              </button>
            </div>

            {loading ? (
              <div className="admin-loading">Cargando productos...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Categoría</th>
                      <th>Marca / Modelo</th>
                      <th>Medida</th>
                      <th>Construcción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td><span className="code-badge">{p.codigo || p.id}</span></td>
                        <td><span className={`cat-pill cat-${p.categoria?.toLowerCase()}`}>{p.categoria}</span></td>
                        <td><strong>{p.marca}</strong> — {p.modelo}</td>
                        <td>{p.medida}</td>
                        <td>{p.construccion}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-action edit" onClick={() => { setEditando(p); setVista("editar"); }}>
                              Editar
                            </button>
                            <button className="btn-action del" onClick={() => eliminar(p.id, `${p.marca} ${p.modelo}`)}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productos.length === 0 && (
                  <div className="admin-empty">No hay productos cargados todavía.</div>
                )}
              </div>
            )}
          </>
        )}

        {(vista === "nuevo" || vista === "editar") && (
          <>
            <div className="admin-toolbar">
              <div>
                <h2>{vista === "nuevo" ? "Agregar producto" : "Editar producto"}</h2>
                <p>{vista === "nuevo" ? "Completá los datos del nuevo neumático" : `Editando: ${editando?.marca} ${editando?.modelo}`}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => { setVista("lista"); setEditando(null); }}>
                ← Volver
              </button>
            </div>
            <div className="form-card">
              <ProductoForm
                initial={editando ? {
                  codigo: editando.codigo || "",
                  categoria: editando.categoria || "Tractor",
                  marca: editando.marca || "",
                  modelo: editando.modelo || "",
                  medida: editando.medida || "",
                  construccion: editando.construccion || "Radial",
                  aplicacion: editando.aplicacion || "",
                  indiceCarga: editando.indiceCarga || "",
                  velocidad: editando.velocidad || "",
                  profundidad: editando.profundidad || "",
                  imagen: editando.imagen || "",
                } : null}
                onSave={guardar}
                onCancel={() => { setVista("lista"); setEditando(null); }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
