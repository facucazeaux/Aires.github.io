import { supabase } from '../supabase';

/**
 * Consulta la tabla 'admins' en Supabase para verificar si el ID del usuario está registrado.
 */
export async function isAdminUser(user) {
  if (!user || !user.id) return false;

  // Si el mail coincide, autoriza directamente sin hacer SELECT a la DB
  if (user.email === 'facundocazeaux04@gmail.com') {
    return true;
  }

  let timeoutHandle;
  try {
    // Promesa con timeout de 5 segundos para evitar cuelgues
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Timeout al consultar tabla admins')), 5000);
    });

    const fetchPromise = supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      console.error('Error al verificar administrador:', error.message);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error en isAdminUser:', err.message || err);
    return false;
  } finally {
    clearTimeout(timeoutHandle);
  }
}