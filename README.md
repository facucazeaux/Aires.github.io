# Aires Neumáticos — React + Vite

Sitio web para Aires Neumáticos, convertido a React con Vite.

## Estructura del proyecto

```
aires-neumaticos/
├── public/
│   └── img-neumaticos/        ← Copiá acá tus imágenes
├── src/
│   ├── components/
│   │   ├── Header.jsx / .css
│   │   └── Footer.jsx / .css
│   ├── data/
│   │   └── productos.js       ← Editá acá tus productos y número de WhatsApp
│   ├── pages/
│   │   ├── Home.jsx / .css
│   │   └── Catalogo.jsx / .css
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm run dev

# 3. Build para producción
npm run build

# 4. Previsualizar build
npm run preview
```

## Cómo agregar productos

Abrí `src/data/productos.js` y agregá objetos al array `productos`:

```js
{
  id: "TR-03",                       // Código único
  categoria: "Tractor",              // "Tractor" | "Cosechadora" | "Implemento"
  marca: "BKT",
  modelo: "Agrimax RT 657",
  medida: "420/85R28",
  construccion: "Radial",
  aplicacion: "Tracción / Mixto",
  indiceCarga: "144A8",
  velocidad: "A8",
  profundidad: "38 mm",
  imagen: "/img-neumaticos/tu-imagen.jpg",  // Ruta desde /public
}
```

## Imágenes

Copiá tus imágenes a la carpeta `public/img-neumaticos/` y referencialas
con rutas absolutas: `/img-neumaticos/nombre.jpg`.

## Cambiar número de WhatsApp

En `src/data/productos.js`, primera línea:

```js
export const WHATSAPP = "5492983603968"; // Sin + ni espacios
```

## Tecnologías

- React 18
- React Router v6 (SPA con rutas / y /catalogo)
- Vite 5
- CSS puro con variables (sin Tailwind ni librerías externas)
