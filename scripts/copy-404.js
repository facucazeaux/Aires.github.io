import { copyFileSync } from "node:fs";

// GitHub Pages: sirve 404.html para rutas SPA (/catalogo, /admin, etc.)
copyFileSync("dist/index.html", "dist/404.html");
console.log("✓ dist/404.html creado para SPA routing");
