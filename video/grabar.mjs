// Graba cada escena con el screencast de Chromium (cuadros JPEG nítidos a 1920×1080)
// y la codifica a MP4 de 30 fps con la duración exacta de su narración (+ márgenes).
// Uso: node grabar.mjs [id-escena ...]   (requiere la app en BASE, por defecto :3005)
import { chromium } from "playwright-core";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";
const LEAD = 0.5; // silencio antes de la voz
const TAIL = 0.7; // aire después de la voz
const guion = JSON.parse(readFileSync("guion.json", "utf8"));
const tiempos = Object.fromEntries(JSON.parse(readFileSync("build/audio/tiempos.json", "utf8")).map((t) => [t.id, t]));

// Movimiento de cámara por escena: cuánto scrollear (px de la vista) y acciones extra.
const PLAN = {
  "01-landing": { scroll: 880 },
  "02-login": { scroll: 0, click: { text: "Soy socio", at: 0.45 } },
  "03-dashboard": { scroll: 520 },
  "04-socios": { scroll: 560 },
  "05-ficha": { scroll: 520 },
  "06-acceso": { scroll: 260 },
  "07-clases": { scroll: 280 },
  "08-rutinas": { scroll: 240 },
  "09-caja": { scroll: 460 },
  "10-crm": { scroll: 160 },
  "11-reportes": { scroll: 720 },
  "12-app": { scroll: 330, wide: true },
  "13-app-clases": { scroll: 720, wide: true },
  "14-superadmin": { scroll: 460 },
  "15-cierre": { scroll: 0 },
};

const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge" });
try {
  for (const e of guion.escenas) {
    if (only.length && !only.includes(e.id)) continue;
    const D = LEAD + tiempos[e.id].dur + TAIL;
    const plan = PLAN[e.id] ?? { scroll: 0 };
    // la app del socio va dentro de un teléfono de 880 px: se usa una vista más amplia para que entre completo
    const W = plan.wide ? 1728 : 1440;
    const page = await browser.newPage({ viewport: { width: W, height: (W * 9) / 16 }, deviceScaleFactor: 1920 / W });

    // 1) precarga: recorre la página para que las imágenes diferidas queden en caché
    await page.goto(BASE + e.ruta, { waitUntil: "load" });
    await page.evaluate(async () => {
      const el = pickScroller();
      for (let y = 0; y < el.scrollHeight; y += 500) {
        el.scrollTop = y;
        await new Promise((r) => setTimeout(r, 120));
      }
      function pickScroller() {
        const doc = document.scrollingElement;
        if (doc.scrollHeight > innerHeight + 20) return doc;
        const all = [...document.querySelectorAll("*")].filter((n) => {
          const s = getComputedStyle(n);
          return /(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 20;
        });
        return all.sort((a, b) => b.clientHeight - a.clientHeight)[0] ?? doc;
      }
    });

    // 2) recarga con todo en caché y espera a que asienten fuentes e imágenes
    await page.goto(BASE + e.ruta, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = [...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight);
      await Promise.race([
        Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r))))),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    });
    await page.waitForTimeout(250);

    // 3) screencast
    const dir = join("build/frames", e.id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const frames = [];
    const cdp = await page.context().newCDPSession(page);
    cdp.on("Page.screencastFrame", async (f) => {
      const file = join(dir, String(frames.length).padStart(5, "0") + ".jpg");
      writeFileSync(file, Buffer.from(f.data, "base64"));
      frames.push({ file: resolve(file), ts: f.metadata.timestamp });
      await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
    const t0 = Date.now();

    // movimiento: quieto al principio, scroll suave en el medio, quieto al final
    const hold = Math.min(2.2, D * 0.22);
    const move = Math.max(1.5, D * 0.55);
    if (plan.click) {
      await page.waitForTimeout(D * plan.click.at * 1000);
      await page.getByRole("button", { name: plan.click.text }).click();
    } else {
      await page.waitForTimeout(hold * 1000);
      if (plan.scroll) {
        await page.evaluate(
          async ({ to, ms }) => {
            const doc = document.scrollingElement;
            let el = doc;
            if (doc.scrollHeight <= innerHeight + 20) {
              const all = [...document.querySelectorAll("*")].filter((n) => {
                const s = getComputedStyle(n);
                return /(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 20;
              });
              el = all.sort((a, b) => b.clientHeight - a.clientHeight)[0] ?? doc;
            }
            const target = Math.min(to, el.scrollHeight - el.clientHeight);
            const from = el.scrollTop;
            const start = performance.now();
            await new Promise((r) => {
              const step = (t) => {
                const p = Math.min(1, (t - start) / ms);
                const k = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                el.scrollTop = from + (target - from) * k;
                if (p < 1) requestAnimationFrame(step);
                else r();
              };
              requestAnimationFrame(step);
            });
          },
          { to: plan.scroll, ms: move * 1000 },
        );
      }
    }
    const left = D * 1000 - (Date.now() - t0);
    if (left > 0) await page.waitForTimeout(left);
    await cdp.send("Page.stopScreencast");
    await page.waitForTimeout(150);
    await page.close();

    // 4) arma la lista con la duración real de cada cuadro y la recorta a D
    const first = frames[0].ts;
    const lines = [];
    for (let i = 0; i < frames.length; i++) {
      const start = frames[i].ts - first;
      if (start >= D) break;
      const end = Math.min(D, i + 1 < frames.length ? frames[i + 1].ts - first : D);
      lines.push(`file '${frames[i].file.replace(/\\/g, "/")}'`, `duration ${Math.max(0.001, end - start).toFixed(4)}`);
    }
    lines.push(lines[lines.length - 2]); // el último cuadro se repite (requisito del demuxer concat)
    writeFileSync(join(dir, "lista.txt"), lines.join("\n"));
    mkdirSync("build/clips", { recursive: true });
    execFileSync(
      ffmpegPath,
      ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "lista.txt"),
        "-vf", "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p", "-t", D.toFixed(3),
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", join("build/clips", e.id + ".mp4")],
      { stdio: "inherit" },
    );
    console.log(`${e.id}  ${D.toFixed(2)} s  ${frames.length} cuadros (${(frames.length / D).toFixed(0)} fps)`);
  }
} finally {
  await browser.close();
}
