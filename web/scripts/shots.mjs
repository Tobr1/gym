// Capturas desktop + mobile de las pantallas prioritarias.
// Uso: node scripts/shots.mjs [ruta1 ruta2 ...]   (requiere `npm run dev` en :3000)
// PROFILES=desktop,tablet,mobile para elegir tamaños (por defecto desktop,mobile). FULL=0 captura solo el viewport.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ALL = [
  "/", "/login",
  "/admin", "/admin/socios", "/admin/socios/1042", "/admin/socios/1042/pagos", "/admin/socios/1042/evolucion",
  "/admin/acceso", "/admin/rutinas", "/admin/clases", "/admin/caja", "/admin/crm", "/admin/reportes", "/admin/configuracion",
  "/app", "/app/stats", "/app/clases", "/app/rutina", "/app/perfil",
  "/superadmin", "/superadmin/gimnasios", "/superadmin/gimnasios/T-0184", "/superadmin/suscripciones",
];
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const full = process.env.FULL !== "0";
mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "msedge" });
try {
const ALL_PROFILES = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 },
  { name: "tablet", viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1.5 },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];
const wanted = (process.env.PROFILES ?? "desktop,mobile").split(",");
const profiles = ALL_PROFILES.filter((p) => wanted.includes(p.name));
for (const p of profiles) {
  const ctx = await browser.newContext({ ...p, colorScheme: "dark", locale: "es-AR" });
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: "load" });
    if (full) {
      // recorre la página para disparar imágenes lazy
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    await page.waitForTimeout(2600); // animaciones de entrada + contadores
    const file = `screenshots/${p.name}${r === "/" ? "-landing" : r.replaceAll("/", "-")}.png`;
    await page.screenshot({ path: file, fullPage: full });
    console.log("✓", file);
  }
  await ctx.close();
}
} finally {
  await browser.close();
}
