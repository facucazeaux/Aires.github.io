import { supabase } from "../supabase";

export const STORAGE_BUCKET = "imagenes";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateImageFile(file) {
  if (!file) throw new Error("No se seleccionó ningún archivo.");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usá JPG, PNG, WebP o GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera el límite de 5 MB.");
  }
}

export function resolveImageUrl(url, base = "") {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${base}${url}`;
}

export function getStoragePathFromUrl(url) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

import { optimizeImageFile } from "./imageOptimize";

export async function uploadImage(file, folder) {
  const optimized = await optimizeImageFile(file);
  validateImageFile(optimized);
  const ext = EXT_BY_MIME[optimized.type] || "webp";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, optimized, {
    cacheControl: "3600",
    upsert: false,
    contentType: optimized.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteStoredImage(url) {
  const path = getStoragePathFromUrl(url);
  if (!path) return;
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}
