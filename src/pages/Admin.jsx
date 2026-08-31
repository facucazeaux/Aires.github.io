import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { isAdminUser } from '../lib/auth';

import { fetchCategorias } from '../lib/categorias';
import { generateSlug, ensureUniqueSlug } from '../lib/slug';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();

  // ── CONTROL DE SEGURIDAD Y SESIÓN ──
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Estados Formulario Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockedUntil, setLoginLockedUntil] = useState(0);

  // Bloqueo temporal creciente tras varios intentos fallidos
  const registerFailedAttempt = () => {
    setLoginAttempts((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        const lockSeconds = Math.min(30 * (next - 4), 300); // 30s, 60s, 90s... hasta 5min
        setLoginLockedUntil(Date.now() + lockSeconds * 1000);
      }
      return next;
    });
  };

  // Estados del panel
  const [activeTab, setActiveTab] = useState('consultas');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Referencias para resetear inputs de archivo
  const fileInputRef = useRef(null);
  const catFileInputRef = useRef(null);

  // Listados Supabase
  const [consultas, setConsultas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Modal Consulta
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  // Formulario Producto
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({
    marca: '',
    modelo: '',
    medida: '',
    construccion: 'Radial',
    categoria: [],
    aplicacion: '',
    codigo: '',
    imagen: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Formulario Categoría
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatNombre, setEditingCatNombre] = useState('');
  const [editingCatImagen, setEditingCatImagen] = useState('');
  const [editCatImageFile, setEditCatImageFile] = useState(null);
  const [editCatImagePreview, setEditCatImagePreview] = useState('');

// ── VERIFICACIÓN DE AUTENTICACIÓN ──
useEffect(() => {
  let isMounted = true;

  // 1. Límite de seguridad para la carga inicial
  const timeoutId = setTimeout(() => {
    if (isMounted) setAuthChecking(false);
  }, 3000);

  // 2. Función de verificación al cargar la página
  const checkAuth = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (currentSession) {
        const isUserAdmin = await isAdminUser(currentSession.user).catch(() => false);

        if (!isUserAdmin) {
          await supabase.auth.signOut();
          setSession(null);
          setLoginError('Esta cuenta no tiene permisos de administrador.');
        } else {
          setSession(currentSession);
          loadData();
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Error al comprobar sesión:', err);
      setSession(null);
    } finally {
      if (isMounted) setAuthChecking(false);
      clearTimeout(timeoutId);
    }
  };

  checkAuth();

  // 3. Escuchador de eventos de autenticación.
  // Solo reacciona a cierre de sesión y refrescos de sesión en segundo plano
  // (otra pestaña, expiración/renovación de token). El flujo de LOGIN activo
  // (signInWithPassword -> isAdminUser -> setSession) se maneja
  // enteramente dentro de handleLogin, para no depender de que este evento
  // se dispare (a veces no llega, o llega como INITIAL_SESSION en vez de
  // SIGNED_IN, dejando la UI de "Ingresando..." colgada para siempre).
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
    if (event === 'SIGNED_OUT' || !currentSession) {
      setSession(null);
      return;
    }

    if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      // Solo actualizamos el objeto de sesión si ya había una sesión admin
      // validada; no volvemos a chequear isAdminUser ni a recargar datos.
      setSession((prev) => (prev ? currentSession : prev));
    }
    // SIGNED_IN se ignora deliberadamente acá: lo maneja handleLogin.
  });

  // 4. Limpieza al desmontar el componente
  return () => {
    isMounted = false;
    clearTimeout(timeoutId);
    subscription?.unsubscribe();
  };
}, []);



  // ── PROCESO DE INICIO DE SESIÓN CORREGIDO ──
  // Maneja todo el flujo acá mismo (login -> validar admin -> setSession),
  // en vez de delegar en onAuthStateChange. Así evitamos la carrera donde
  // el evento SIGNED_IN no llega (o llega antes/después de lo esperado) y
  // la UI queda trabada en "Ingresando..." para siempre. El `finally`
  // garantiza que loggingIn SIEMPRE se apague, pase lo que pase.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginLockedUntil && Date.now() < loginLockedUntil) {
      const segsRestantes = Math.ceil((loginLockedUntil - Date.now()) / 1000);
      setLoginError(`Demasiados intentos. Probá de nuevo en ${segsRestantes}s.`);
      return;
    }

    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      const currentSession = data.session;
      if (!currentSession) {
        throw new Error('No se recibió una sesión válida.');
      }

      const isUserAdmin = await isAdminUser(currentSession.user).catch(() => false);

      if (!isUserAdmin) {
        await supabase.auth.signOut();
        setLoginError('Esta cuenta no tiene permisos de administrador.');
        registerFailedAttempt();
        return;
      }

      setLoginAttempts(0);
      setLoginPassword('');
      setSession(currentSession);
      loadData();

    } catch (err) {
      console.error('Error en login:', err);
      setLoginError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verificá tu correo y contraseña.'
          : err.message || 'Error al iniciar sesión.'
      );
      registerFailedAttempt();
    } finally {
      setLoggingIn(false);
    }
  };
  
  
  // ── LOGOUT / CERRAR SESIÓN ──
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
    }
  };

  // ── CARGA DE DATOS DESDE SUPABASE ──
  const loadData = async () => {
    setLoading(true);
    try {
      const [consultRes, prodRes, catsData] = await Promise.all([
        supabase.from('consultas').select('*').order('created_at', { ascending: false }),
        supabase.from('productos').select('*').order('id', { ascending: false }),
        fetchCategorias().catch(() => [])
      ]);

      if (consultRes.data) setConsultas(consultRes.data);
      if (prodRes.data) setProductos(prodRes.data);
      if (catsData) setCategorias(catsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── FUNCIÓN GENÉRICA PARA SUBIR IMÁGENES A SUPABASE STORAGE ──
  const uploadImageToSupabase = async (file, folder = 'productos') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagenes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('imagenes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ── MARCAR / DESMARCAR LEÍDO ──
  const toggleLeidoConsulta = async (consulta, e) => {
    if (e) e.stopPropagation();
    const nuevoEstado = !consulta.leido;

    setConsultas((prev) =>
      prev.map((c) => (c.id === consulta.id ? { ...c, leido: nuevoEstado } : c))
    );
    if (selectedConsulta && selectedConsulta.id === consulta.id) {
      setSelectedConsulta((prev) => ({ ...prev, leido: nuevoEstado }));
    }

    const { error } = await supabase
      .from('consultas')
      .update({ leido: nuevoEstado })
      .eq('id', consulta.id);

    if (error) {
      console.error('Error al actualizar en DB:', error);
      alert('Ocurrió un error al guardar el estado.');
      loadData();
    }
  };

  const handleOpenConsulta = async (item) => {
    setSelectedConsulta(item);

    if (!item.leido) {
      setConsultas((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, leido: true } : c))
      );
      setSelectedConsulta((prev) => ({ ...prev, leido: true }));

      const { error } = await supabase
        .from('consultas')
        .update({ leido: true })
        .eq('id', item.id);

      if (error) console.error('Error al marcar leído automáticamente:', error);
    }
  };

  const handleDeleteConsulta = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta consulta?')) return;

    const { error } = await supabase.from('consultas').delete().eq('id', id);

    if (!error) {
      setConsultas((prev) => prev.filter((c) => c.id !== id));
      if (selectedConsulta && selectedConsulta.id === id) {
        setSelectedConsulta(null);
      }
    } else {
      alert(`Error al eliminar la consulta: ${error.message}`);
    }
  };

  // ── MANEJO DE FORMULARIO DE PRODUCTOS ──
  const handleCategoryToggle = (catNombre) => {
    setProdForm((prev) => {
      const exists = prev.categoria.includes(catNombre);
      const updatedCats = exists
        ? prev.categoria.filter((c) => c !== catNombre)
        : [...prev.categoria, catNombre];
      return { ...prev, categoria: updatedCats };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetProdForm = () => {
    setEditingProductId(null);
    setProdForm({
      marca: '',
      modelo: '',
      medida: '',
      construccion: 'Radial',
      categoria: [],
      aplicacion: '',
      codigo: '',
      imagen: ''
    });
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEditProduct = (prod) => {
    setEditingProductId(prod.id);
    let catsArray = Array.isArray(prod.categoria)
      ? prod.categoria
      : prod.categoria ? [prod.categoria] : [];

    setProdForm({
      marca: prod.marca || '',
      modelo: prod.modelo || '',
      medida: prod.medida || '',
      construccion: prod.construccion || 'Radial',
      categoria: catsArray,
      aplicacion: prod.aplicacion || '',
      codigo: prod.codigo || '',
      imagen: prod.imagen || ''
    });
    setImageFile(null);
    setImagePreview(prod.imagen || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!prodForm.marca || !prodForm.modelo || !prodForm.medida || prodForm.categoria.length === 0) {
      setStatusMsg({ type: 'err', text: 'Por favor completa Marca, Modelo, Medida y selecciona al menos 1 Categoría.' });
      return;
    }

    try {
      setUploading(true);
      let imageUrl = prodForm.imagen;

      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile, 'productos');
      }

      const slugStr = `${prodForm.marca} ${prodForm.modelo} ${prodForm.medida}`;
      const baseSlug = typeof generateSlug === 'function'
        ? generateSlug(slugStr)
        : slugStr.toLowerCase().trim().replace(/[\s/]+/g, '-');

      const slug = await ensureUniqueSlug(supabase, baseSlug, editingProductId || null);

      const payload = { ...prodForm, imagen: imageUrl, slug };

      if (editingProductId) {
        const { data, error } = await supabase
          .from('productos')
          .update(payload)
          .eq('id', editingProductId)
          .select();

        if (error) throw error;
        setStatusMsg({ type: 'ok', text: '¡Producto actualizado correctamente!' });
        setProductos(productos.map((p) => (p.id === editingProductId ? data[0] : p)));
        resetProdForm();
      } else {
        const { data, error } = await supabase.from('productos').insert([payload]).select();
        if (error) throw error;
        setStatusMsg({ type: 'ok', text: '¡Producto creado exitosamente!' });
        setProductos([data[0], ...productos]);
        resetProdForm();
      }
    } catch (err) {
      const isDuplicate = err.code === '23505' || /duplicate key value/i.test(err.message || '');
      setStatusMsg({
        type: 'err',
        text: isDuplicate
          ? 'Ya existe un producto con esos mismos datos (Marca, Modelo y Medida). Revisá el listado, puede que ya esté cargado.'
          : `Error: ${err.message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      setProductos(productos.filter((p) => p.id !== id));
      if (editingProductId === id) resetProdForm();
    }
  };

  // ── GESTIÓN DE CATEGORÍAS ──
  const handleCatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCatImageFile(file);
      setCatImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditCatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCatImageFile(file);
      setEditCatImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    try {
      setUploading(true);
      let imageUrl = '';

      if (catImageFile) {
        imageUrl = await uploadImageToSupabase(catImageFile, 'categorias');
      }

      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre: nuevaCategoria.trim(), imagen: imageUrl }])
        .select();

      if (error) throw error;

      setCategorias([...categorias, data[0]]);
      setNuevaCategoria('');
      setCatImageFile(null);
      setCatImagePreview('');
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    } catch (err) {
      alert(`Error al crear categoría: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatNombre.trim()) return;

    try {
      setUploading(true);
      let imageUrl = editingCatImagen;

      if (editCatImageFile) {
        imageUrl = await uploadImageToSupabase(editCatImageFile, 'categorias');
      }

      const { data, error } = await supabase
        .from('categorias')
        .update({ nombre: editingCatNombre.trim(), imagen: imageUrl })
        .eq('id', id)
        .select();

      if (error) throw error;

      setCategorias(categorias.map((c) => (c.id === id ? data[0] : c)));
      setEditingCatId(null);
      setEditingCatNombre('');
      setEditingCatImagen('');
      setEditCatImageFile(null);
      setEditCatImagePreview('');
    } catch (err) {
      alert(`Error al actualizar categoría: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`¿Deseas eliminar la categoría "${cat.nombre}"?`)) return;
    const { error } = await supabase.from('categorias').delete().eq('id', cat.id);
    if (!error) {
      setCategorias(categorias.filter((c) => c.id !== cat.id));
    }
  };

  // 1. Cargando estado de verificación inicial
  if (authChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#111', color: '#fff' }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  // 2. VISTA DE FORMULARIO DE LOGIN (Si no hay sesión activa)
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#111', color: '#fff', padding: '20px' }}>
        <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid #333' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={`${import.meta.env.BASE_URL}img-neumaticos/logo.png`} alt="Aires Neumáticos" style={{ maxHeight: '60px', marginBottom: '10px' }} />
            <h2 style={{ fontSize: '20px', margin: 0 }}>Iniciar Sesión Admin</h2>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Aires Neumáticos</p>
          </div>

          {loginError && (
            <div style={{ background: '#e63946', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Correo Electrónico</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Contraseña</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn || (loginLockedUntil > Date.now())}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                background: '#e63946',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              {loggingIn ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>
              ← Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. VISTA DEL PANEL DE ADMINISTRACIÓN
  const sinLeerCount = consultas.filter((c) => !c.leido).length;

  return (
    <div className="admin-wrap">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/" className="admin-brand" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <img src={`${import.meta.env.BASE_URL}img-neumaticos/logo.png`} alt="Aires Neumáticos" />
            <div>
              <span className="admin-title">Panel de Administración</span>
              <span className="admin-sub">Aires Neumáticos</span>
            </div>
          </Link>

          <div className="admin-header-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-action edit" onClick={loadData} disabled={loading}>
              {loading ? 'Cargando...' : 'Recargar Datos'}
            </button>

            <button className="btn-action del" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-main">
        {/* NAVEGACIÓN PESTAÑAS */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'consultas' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            Consultas{' '}
            <span
              className="count-badge"
              style={{ background: sinLeerCount > 0 ? '#e63946' : '' }}
            >
              {consultas.length} {sinLeerCount > 0 && `(${sinLeerCount} nuevas)`}
            </span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            Productos <span className="count-badge">{productos.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'categorias' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorias')}
          >
            Categorías <span className="count-badge">{categorias.length}</span>
          </button>
        </div>

        {/* PESTAÑA CONSULTAS */}
        {activeTab === 'consultas' && (
          <div>
            <div className="admin-toolbar">
              <h2>Consultas Recibidas</h2>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Mensaje</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty">
                        {loading ? 'Cargando consultas...' : 'No hay consultas registradas.'}
                      </td>
                    </tr>
                  ) : (
                    consultas.map((item) => (
                      <tr
                        key={item.id}
                        className="row-clickable"
                        onClick={() => handleOpenConsulta(item)}
                        style={{
                          background: !item.leido ? 'rgba(230, 57, 70, 0.08)' : 'transparent'
                        }}
                      >
                        <td>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              background: item.leido ? '#2a9d8f' : '#e63946',
                              color: '#fff'
                            }}
                          >
                            {item.leido ? 'Leído' : 'Nuevo'}
                          </span>
                        </td>
                        <td>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString('es-AR')
                            : item.fecha}
                        </td>
                        <td><strong>{item.nombre}</strong></td>
                        <td>{item.email}</td>
                        <td>{item.telefono || '-'}</td>
                        <td className="cell-msg">{item.mensaje}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="row-actions">
                            <button
                              className="btn-action edit"
                              onClick={() => handleOpenConsulta(item)}
                            >
                              Ver
                            </button>
                            <button
                              className="btn-action edit"
                              onClick={(e) => toggleLeidoConsulta(item, e)}
                            >
                              {item.leido ? 'Marcar No Leído' : 'Marcar Leído'}
                            </button>
                            <button
                              className="btn-action del"
                              onClick={(e) => handleDeleteConsulta(item.id, e)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA PRODUCTOS */}
        {activeTab === 'productos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-card form-card-light">
              <h3>{editingProductId ? 'Editar Neumático' : 'Agregar Nuevo Neumático'}</h3>
              {statusMsg.text && (
                <div className={`form-status ${statusMsg.type}`}>{statusMsg.text}</div>
              )}

              <form onSubmit={handleSaveProduct} className="prod-form">
                <div className="form-grid">
                  <div className="field">
                    <label>Marca*</label>
                    <input
                      type="text"
                      placeholder="Ej: Michelin, Fate..."
                      value={prodForm.marca}
                      onChange={(e) => setProdForm({ ...prodForm, marca: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Modelo*</label>
                    <input
                      type="text"
                      placeholder="Ej: MachXBib"
                      value={prodForm.modelo}
                      onChange={(e) => setProdForm({ ...prodForm, modelo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Medida*</label>
                    <input
                      type="text"
                      placeholder="Ej: 710/70 R38"
                      value={prodForm.medida}
                      onChange={(e) => setProdForm({ ...prodForm, medida: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field field-full">
                    <label>
                      Categorías* <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Haz clic para seleccionar/deseleccionar)</span>
                    </label>
                    <div className="categories-chips-grid">
                      {categorias.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          No hay categorías registradas. Crea una en la pestaña 'Categorías'.
                        </span>
                      ) : (
                        categorias.map((c) => {
                          const isSelected = prodForm.categoria.includes(c.nombre);
                          return (
                            <button
                              type="button"
                              key={c.id || c.nombre}
                              className={`chip-item ${isSelected ? 'active' : ''}`}
                              onClick={() => handleCategoryToggle(c.nombre)}
                            >
                              <span className="chip-check">{isSelected ? '✓' : '+'}</span>
                              <span>{c.nombre}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label>Construcción</label>
                    <input
                      type="text"
                      placeholder="Ej: Radial / Diagonal"
                      value={prodForm.construccion}
                      onChange={(e) => setProdForm({ ...prodForm, construccion: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Aplicación</label>
                    <input
                      type="text"
                      placeholder="Ej: Tractor / Cosechadora"
                      value={prodForm.aplicacion}
                      onChange={(e) => setProdForm({ ...prodForm, aplicacion: e.target.value })}
                    />
                  </div>
                  <div className="field field-full">
                    <label>Imagen del Producto</label>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                    {imagePreview && (
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          style={{ maxHeight: '100px', borderRadius: '6px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    className="btn-action edit"
                    disabled={uploading}
                    style={{ padding: '10px 20px' }}
                  >
                    {uploading
                      ? 'Guardando...'
                      : editingProductId
                      ? 'Actualizar Producto'
                      : '+ Guardar Producto'}
                  </button>
                  {editingProductId && (
                    <button type="button" className="btn-action del" onClick={resetProdForm}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Marca/Modelo</th>
                    <th>Medida</th>
                    <th>Categorías</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => {
                    const catList = Array.isArray(p.categoria)
                      ? p.categoria
                      : [p.categoria].filter(Boolean);
                    return (
                      <tr key={p.id}>
                        <td>
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt=""
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td><strong>{p.marca}</strong> {p.modelo}</td>
                        <td>{p.medida}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {catList.map((c) => (
                              <span
                                key={c}
                                style={{
                                  background: 'var(--bg-input)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-action edit" onClick={() => handleStartEditProduct(p)}>
                              Editar
                            </button>
                            <button className="btn-action del" onClick={() => handleDeleteProduct(p.id)}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-card">
              <h3>Crear Nueva Categoría</h3>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Ej: Pulverizadora"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      borderRadius: '6px'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
                    <input
                      ref={catFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCatFileChange}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                  <button type="submit" className="btn-action edit" disabled={uploading} style={{ padding: '10px 20px', height: 'fit-content' }}>
                    {uploading ? 'Guardando...' : '+ Agregar'}
                  </button>
                </div>

                {catImagePreview && (
                  <div>
                    <img
                      src={catImagePreview}
                      alt="Vista previa categoría"
                      style={{ maxHeight: '80px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre de Categoría</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((c) => (
                    <tr key={c.id || c.nombre}>
                      <td>{c.id || '-'}</td>
                      <td>
                        {editingCatId === c.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditCatFileChange}
                            />
                            {(editCatImagePreview || editingCatImagen) && (
                              <img
                                src={editCatImagePreview || editingCatImagen}
                                alt=""
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                          </div>
                        ) : c.imagen ? (
                          <img
                            src={c.imagen}
                            alt={c.nombre}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {editingCatId === c.id ? (
                          <input
                            type="text"
                            value={editingCatNombre}
                            onChange={(e) => setEditingCatNombre(e.target.value)}
                            style={{
                              padding: '4px 8px',
                              background: 'var(--bg-input)',
                              color: '#fff',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        ) : (
                          <strong>{c.nombre}</strong>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          {editingCatId === c.id ? (
                            <>
                              <button className="btn-action edit" disabled={uploading} onClick={() => handleUpdateCategory(c.id)}>
                                {uploading ? '...' : 'Guardar'}
                              </button>
                              <button
                                className="btn-action del"
                                onClick={() => {
                                  setEditingCatId(null);
                                  setEditingCatNombre('');
                                  setEditingCatImagen('');
                                  setEditCatImageFile(null);
                                  setEditCatImagePreview('');
                                }}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              {c.id && (
                                <button
                                  className="btn-action edit"
                                  onClick={() => {
                                    setEditingCatId(c.id);
                                    setEditingCatNombre(c.nombre);
                                    setEditingCatImagen(c.imagen || '');
                                    setEditCatImageFile(null);
                                    setEditCatImagePreview('');
                                  }}
                                >
                                  Editar
                                </button>
                              )}
                              {c.id && (
                                <button className="btn-action del" onClick={() => handleDeleteCategory(c)}>
                                  Eliminar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETALLE DE CONSULTA */}
      {selectedConsulta && (
        <div className="modal-overlay" onClick={() => setSelectedConsulta(null)}>
          <div className="modal-card modal-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <div className="modal-title-group">
                <span className={`status-pill ${selectedConsulta.leido ? 'read' : 'unread'}`}>
                  {selectedConsulta.leido ? 'Atendida / Leída' : 'Nueva Consulta'}
                </span>
                <h3>Consulta #{selectedConsulta.id}</h3>
              </div>
              <button
                className="btn-close-pro"
                onClick={() => setSelectedConsulta(null)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-pro">
              <div className="contact-cards-grid">
                <div className="info-card">
                  <span className="info-label">CLIENTE</span>
                  <span className="info-value name">{selectedConsulta.nombre}</span>
                </div>

                <div className="info-card">
                  <span className="info-label">FECHA DE RECEPCIÓN</span>
                  <span className="info-value">
                    {selectedConsulta.created_at
                      ? new Date(selectedConsulta.created_at).toLocaleString('es-AR', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      : selectedConsulta.fecha || 'Sin fecha'}
                  </span>
                </div>

                <div className="info-card">
                  <span className="info-label">CORREO ELECTRÓNICO</span>
                  <a href={`mailto:${selectedConsulta.email}`} className="info-link">
                    ✉ {selectedConsulta.email}
                  </a>
                </div>

                <div className="info-card">
                  <span className="info-label">TELÉFONO / WHATSAPP</span>
                  {selectedConsulta.telefono ? (
                    <a
                      href={`https://wa.me/${selectedConsulta.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-link"
                    >
                      💬 {selectedConsulta.telefono}
                    </a>
                  ) : (
                    <span className="info-value muted">No registrado</span>
                  )}
                </div>
              </div>

              <div className="message-container">
                <span className="info-label">CONTENIDO DEL MENSAJE</span>
                <div className="message-quote-box">
                  <p>{selectedConsulta.mensaje}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer-pro">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary-pro"
                  onClick={() => toggleLeidoConsulta(selectedConsulta)}
                >
                  {selectedConsulta.leido ? 'Marcar No Leído' : 'Marcar Leído'}
                </button>

                <button
                  type="button"
                  className="btn-action del"
                  style={{ padding: '8px 16px', borderRadius: '6px' }}
                  onClick={(e) => handleDeleteConsulta(selectedConsulta.id, e)}
                >
                  Eliminar
                </button>
              </div>

              <a
                href={`mailto:${selectedConsulta.email}?subject=Consulta%20Aires%20Neum%C3%A1ticos`}
                className="btn-primary-pro"
              >
                ✉ Responder Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}