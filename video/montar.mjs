// Une las escenas con fundidos, pone la narración en su lugar y quema los subtítulos.
// Salida: pulso-presentacion.mp4 (+ pulso-presentacion.srt)
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const LEAD = 0.5;
const TAIL = 0.7;
const T = 0.4; // duración del fundido entre escenas
const OUT = "pulso-presentacion";

const guion = JSON.parse(readFileSync("guion.json", "utf8"));
const tiempos = Object.fromEntries(JSON.parse(readFileSync("build/audio/tiempos.json", "utf8")).map((t) => [t.id, t]));
const scenes = guion.escenas.map((e) => ({ ...e, ...tiempos[e.id], D: LEAD + tiempos[e.id].dur + TAIL }));

// inicio de cada escena en la línea de tiempo final (los fundidos se solapan T segundos)
let acc = 0;
scenes.forEach((s, i) => {
  s.start = i === 0 ? 0 : acc - T;
  acc = s.start + s.D;
});
const total = acc;

// ── subtítulos: cada oración se parte en bloques cortos, con tiempo proporcional a su largo
// Bloques parejos de hasta `max` caracteres (una o dos líneas); corta preferentemente en una
// coma o dos puntos cercanos al punto ideal, si no en el espacio más cercano.
function chunks(text, max = 80) {
  const t = text.trim();
  const k = Math.ceil(t.length / max);
  if (k <= 1) return [t];
  const out = [];
  let from = 0;
  for (let i = 1; i < k; i++) {
    const ideal = from + (t.length - from) / (k - i + 1);
    let best = -1;
    let bestScore = Infinity;
    for (let j = from + 10; j < t.length - 10; j++) {
      if (t[j] !== " ") continue;
      const punct = /[,:;]/.test(t[j - 1]);
      const score = Math.abs(j - ideal) - (punct ? 14 : 0);
      if (j - from <= max && score < bestScore) {
        bestScore = score;
        best = j;
      }
    }
    out.push(t.slice(from, best).trim());
    from = best + 1;
  }
  out.push(t.slice(from).trim());
  return out;
}
const cues = [];
for (const s of scenes) {
  const sentences = s.sentences.length ? s.sentences : [{ start: 0, end: s.dur, text: s.texto }];
  for (const se of sentences) {
    const parts = chunks(se.text);
    const len = parts.reduce((n, p) => n + p.length, 0);
    let t = s.start + LEAD + se.start;
    const span = se.end - se.start;
    for (const p of parts) {
      const d = (span * p.length) / len;
      cues.push({ a: t, b: t + d - 0.04, text: p });
      t += d;
    }
  }
}
const ts = (x, sep) => {
  const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), sec = x % 60;
  return sep === "srt"
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0").replace(".", ",")}`
    : `${h}:${String(m).padStart(2, "0")}:${sec.toFixed(2).padStart(5, "0")}`;
};
writeFileSync(`${OUT}.srt`, cues.map((c, i) => `${i + 1}\n${ts(c.a, "srt")} --> ${ts(c.b, "srt")}\n${c.text}\n`).join("\n"));
const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Voz,Segoe UI Semibold,44,&H00FFFFFF,&H00FFFFFF,&H3818100B,&H00000000,0,0,0,0,100,100,0,0,3,16,0,2,160,160,62,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${cues.map((c) => `Dialogue: 0,${ts(c.a)},${ts(c.b)},Voz,,0,0,0,,{\\fad(120,120)}${c.text}`).join("\n")}
`;
writeFileSync("build/subs.ass", ass);

// ── filtros
const args = ["-y", "-hide_banner", "-loglevel", "error", "-stats"];
scenes.forEach((s) => args.push("-i", `build/clips/${s.id}.mp4`));
scenes.forEach((s) => args.push("-i", `build/audio/${s.id}/audio.mp3`));
const n = scenes.length;
const f = [];
let prev = "[0:v]";
for (let i = 1; i < n; i++) {
  const label = i === n - 1 ? "[vx]" : `[v${i}]`;
  f.push(`${prev}[${i}:v]xfade=transition=fade:duration=${T}:offset=${scenes[i].start.toFixed(3)}${label}`);
  prev = label;
}
f.push(`[vx]subtitles=build/subs.ass,fade=t=in:st=0:d=0.5,fade=t=out:st=${(total - 1.2).toFixed(3)}:d=1.2[vout]`);
scenes.forEach((s, i) => {
  const ms = Math.round((s.start + LEAD) * 1000);
  f.push(`[${n + i}:a]aresample=48000,adelay=${ms}|${ms}[a${i}]`);
});
f.push(`${scenes.map((_, i) => `[a${i}]`).join("")}amix=inputs=${n}:normalize=0,apad,atrim=0:${total.toFixed(3)},afade=t=out:st=${(total - 1).toFixed(3)}:d=1,loudnorm=I=-16:TP=-1.5:LRA=11[aout]`);
args.push(
  "-filter_complex", f.join(";"),
  "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
  "-movflags", "+faststart", "-t", total.toFixed(3),
  `${OUT}.mp4`,
);
execFileSync(ffmpegPath, args, { stdio: "inherit" });
console.log(`\n${OUT}.mp4 · ${total.toFixed(1)} s · ${cues.length} subtítulos`);
