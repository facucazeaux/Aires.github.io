import { supabase } from '../supabase';

/**
 * Consulta la tabla 'admins' en Supabase para verificar si el ID del usuario está registrado.
 */
export async function isAdminUser(user) {
  if (!user || !user.id) return false;

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error al verificar administrador:', error);
      return false;
    }

    // Devuelve true si la fila existe en la tabla
    return !!data;
  } catch (err) {
    console.error('Error en isAdminUser:', err);
    return false;
  }
}
