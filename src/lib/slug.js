export function generateSlug(...parts) {
  const raw = parts.filter(Boolean).join("-");
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "producto";
}

export function productSlug(p) {
  return p.slug || generateSlug(p.marca, p.modelo, p.codigo);
}

export function productPath(p) {
  return `/producto/${encodeURIComponent(productSlug(p))}`;
}

export async function ensureUniqueSlug(supabase, slug, excludeId = null) {
  let candidate = slug;
  let n = 1;
  for (;;) {
    let q = supabase.from("productos").select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
    candidate = `${slug}-${++n}`;
  }
}
