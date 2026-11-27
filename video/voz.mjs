// Genera la narración de cada escena con la voz neuronal es-AR-ElenaNeural
// y guarda la duración y los cortes por oración (para subtítulos).
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const VOICE = "es-AR-ElenaNeural";
const guion = JSON.parse(readFileSync("guion.json", "utf8"));
mkdirSync("build/audio", { recursive: true });

function duration(file) {
  let out = "";
  try {
    execFileSync(ffmpegPath, ["-hide_banner", "-i", file], { stdio: "pipe" });
  } catch (e) {
    out = String(e.stderr);
  }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

const only = process.argv.slice(2);
const result = [];
for (const e of guion.escenas) {
  const dir = join("build/audio", e.id);
  mkdirSync(dir, { recursive: true });
  if (!only.length || only.includes(e.id) || !existsSync(join(dir, "audio.mp3"))) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { sentenceBoundaryEnabled: true });
    await tts.toFile(dir, e.texto, { rate: "-4%", pitch: "+0Hz" });
    tts.close();
  }
  const dur = duration(join(dir, "audio.mp3"));
  let sentences = [];
  const meta = join(dir, "metadata.json");
  if (existsSync(meta)) {
    const raw = JSON.parse(readFileSync(meta, "utf8"));
    const items = (raw.Metadata ?? raw).flatMap((x) => x.Metadata ?? [x]);
    sentences = items
      .filter((x) => x.Type === "SentenceBoundary")
      .map((x) => ({ start: x.Data.Offset / 1e7, end: (x.Data.Offset + x.Data.Duration) / 1e7, text: x.Data.text.Text }));
  }
  result.push({ id: e.id, dur, sentences });
  console.log(`${e.id}  ${dur.toFixed(2)} s  ${sentences.length} oraciones`);
}
writeFileSync("build/audio/tiempos.json", JSON.stringify(result, null, 2));
console.log("Total:", result.reduce((s, r) => s + r.dur, 0).toFixed(1), "s");
