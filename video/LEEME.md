# Video de presentación de Pulso

Genera `pulso-presentacion.mp4` (1920×1080, ~2:47) con narración neuronal (es-AR-ElenaNeural) y subtítulos.

1. `npm install`
2. Levantar la app en producción en :3005 (`npm --prefix ../web run build && npm --prefix ../web run start -- -p 3005`)
3. `npm run voz` — narración por escena desde `guion.json` (usa el servicio de voces de Microsoft Edge)
4. `npm run grabar` — graba cada escena (screencast de Edge) a `build/clips`
5. `npm run montar` — fundidos, audio, subtítulos → `pulso-presentacion.mp4` y `.srt`

Para cambiar el texto, editá `guion.json` y volvé a correr los tres pasos (se pueden pasar ids de escena para rehacer solo algunas).
