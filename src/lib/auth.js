/** Solo usuarios con app_metadata.role = 'admin' (configurado en Supabase). */
export function isAdminUser(user) {
  return user?.app_metadata?.role === "admin";
}
