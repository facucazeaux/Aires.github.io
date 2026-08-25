import { supabase } from "../supabase";
import { resolveImageUrl } from "./storage";

export async function fetchCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden")
    .order("nombre");
  if (error) throw error;
  return data || [];
}

export function categoriaToHomeItem(c, base = "") {
  return {
    title: c.nombre,
    desc: c.descripcion || "",
    tag: c.nombre,
    img: resolveImageUrl(c.imagen, base),
  };
}

// ── Normaliza y limpia cualquier formato de categoría (array, JSON-string, string suelto) ──
export function getCategoriasArray(catData) {
  if (!catData) return [];

  if (Array.isArray(catData)) {
    return catData.map((c) => String(c).replace(/[\[\]"']/g, "").trim()).filter(Boolean);
  }

  if (typeof catData === "string") {
    try {
      const parsed = JSON.parse(catData);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => String(c).replace(/[\[\]"']/g, "").trim()).filter(Boolean);
      }
    } catch {
      // No es JSON válido, seguimos a limpiar el string directamente
    }
    return [catData.replace(/[\[\]"']/g, "").trim()].filter(Boolean);
  }

  return [String(catData)];
}

// Texto limpio de categoría(s) para mostrar, ej: "Tractor, Implemento"
export function formatCategoria(catData) {
  return getCategoriasArray(catData).join(", ");
}

// Normaliza el separador de "Aplicación" para que siempre use " / "
// (algunos productos vienen con ";" en vez de "/")
export function formatAplicacion(aplicacion) {
  if (!aplicacion) return "";
  return String(aplicacion)
    .split(/[;/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" / ");
}
