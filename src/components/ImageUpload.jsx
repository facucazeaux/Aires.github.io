import { useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, resolveImageUrl, validateImageFile } from "../lib/storage";
import { BASE } from "../data/productos";

export default function ImageUpload({ label, value, folder, onChange, onFileChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setPreview(value ? resolveImageUrl(value, BASE) : "");
    setFileName("");
    setErr("");
  }, [value]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyFile(file);
  };

  const applyFile = (file) => {
    try {
      validateImageFile(file);
      setErr("");
      setFileName(file.name);
      onFileChange?.(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } catch (error) {
      setErr(error.message);
      setFileName("");
      onFileChange?.(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const clearNewFile = () => {
    onFileChange?.(null);
    setFileName("");
    setErr("");
    setPreview(value ? resolveImageUrl(value, BASE) : "");
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = () => {
    onChange("");
    onFileChange?.(null);
    setFileName("");
    setPreview("");
    setErr("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="field field-full image-upload">
      <label>{label}</label>
      <div
        className="image-upload-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {preview ? (
          <div className="image-upload-preview">
            <img src={preview} alt="Vista previa" />
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 16l-5-5-4 4-2-2-5 5" />
            </svg>
            <span>Arrastrá una foto o hacé clic para elegir</span>
            <span className="image-upload-hint">JPG, PNG, WebP o GIF · máx. {MAX_IMAGE_BYTES / (1024 * 1024)} MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFile}
          className="image-upload-input"
        />
      </div>
      <div className="image-upload-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
          {preview ? "Cambiar foto" : "Elegir foto"}
        </button>
        {fileName && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearNewFile}>
            Descartar selección
          </button>
        )}
        {(preview || value) && (
          <button type="button" className="btn btn-ghost btn-sm image-upload-remove" onClick={removeImage}>
            Quitar imagen
          </button>
        )}
      </div>
      {fileName && <p className="image-upload-name">{fileName}</p>}
      {err && <p className="form-status err">{err}</p>}
    </div>
  );
}
