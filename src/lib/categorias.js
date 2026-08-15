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
