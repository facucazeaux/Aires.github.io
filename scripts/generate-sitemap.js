import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const vars = {};
  if (!existsSync(".env")) return vars;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

const env = loadEnv();
const SITE_URL = (env.VITE_SITE_URL || "https://facucazeaux.github.io/Aires.github.io").replace(/\/$/, "");

const staticPaths = ["/", "/catalogo"];

async function productPaths() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data } = await supabase.from("productos").select("slug, categoria").not("slug", "is", null);
  const paths = new Set(staticPaths);
  for (const p of data || []) {
    if (p.slug) paths.add(`/producto/${p.slug}`);
    if (p.categoria) paths.add(`/catalogo/${encodeURIComponent(p.categoria)}`);
  }
  return [...paths];
}

const paths = await productPaths();
const urls = paths.map((p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync("dist/sitemap.xml", xml);
console.log(`✓ sitemap.xml generado (${paths.length} URLs)`);
