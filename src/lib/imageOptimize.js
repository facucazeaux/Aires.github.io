const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const QUALITY = 0.85;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

/** Comprime y redimensiona antes de subir. GIF se deja sin cambios. */
export async function optimizeImageFile(file) {
  if (file.type === "image/gif") return file;
  if (file.size < 200_000 && file.type === "image/webp") return file;

  const img = await loadImage(file);
  let { width, height } = img;
  const ratio = Math.min(1, MAX_WIDTH / width, MAX_HEIGHT / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const mime = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Error al optimizar la imagen."))),
      mime,
      QUALITY
    );
  });

  const ext = mime === "image/png" ? "png" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
  return new File([blob], `${baseName}.${ext}`, { type: mime, lastModified: Date.now() });
}
