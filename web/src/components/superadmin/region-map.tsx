/** Mapa de puntos de Sudamérica con clientes activos. SVG generado, sin dependencias. */

const OUTLINE: [number, number][] = [
  [-77, 8.5], [-72, 12], [-63, 10.7], [-60, 8.5], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5], [-35, -9],
  [-39, -15], [-41, -22], [-48, -26], [-53, -33.7], [-58, -34.5], [-57, -38], [-62, -39], [-65, -42],
  [-67, -46], [-66, -48], [-69, -51], [-68.5, -54.8], [-71.5, -53.5], [-74, -50], [-75, -46], [-73.5, -40],
  [-73.5, -37], [-71.5, -30], [-70.3, -18.5], [-76, -14], [-81, -6], [-80, -2], [-80, 1], [-78, 2.5], [-77.5, 7],
];

const X = (lon: number) => ((lon + 82) * 100) / 48;
const Y = (lat: number) => (13 - lat) * 1.75;
const POLY = OUTLINE.map(([lo, la]) => [X(lo), Y(la)] as const);

function inside(x: number, y: number) {
  let c = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, yi] = POLY[i];
    const [xj, yj] = POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const DOTS: [number, number][] = [];
for (let y = 0; y < 124; y += 2.4) for (let x = 0; x < 100; x += 2.4) if (inside(x, y)) DOTS.push([x, y]);

const PINS = [
  { name: "Buenos Aires", lon: -58.4, lat: -34.6, n: 118, big: true },
  { name: "Córdoba", lon: -64.2, lat: -31.4, n: 36 },
  { name: "Tucumán", lon: -65.2, lat: -26.8, n: 19 },
  { name: "Mendoza", lon: -68.8, lat: -32.9, n: 17 },
  { name: "Rosario", lon: -60.6, lat: -32.9, n: 22 },
  { name: "Montevideo", lon: -56.2, lat: -34.9, n: 41, big: true },
  { name: "Santiago", lon: -70.6, lat: -33.4, n: 38, big: true },
  { name: "Asunción", lon: -57.6, lat: -25.3, n: 14 },
  { name: "Lima", lon: -77, lat: -12, n: 9 },
];

export function RegionMap({ className }: { className?: string }) {
  return (
    <svg viewBox="-4 -4 108 128" className={className} aria-label="Mapa de clientes por región">
      <defs>
        <radialGradient id="pin-glow">
          <stop offset="0" stopColor="#B5F54A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#B5F54A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.62} fill="rgb(255 255 255 / 0.16)" />
      ))}
      {PINS.map((p) => {
        const x = X(p.lon);
        const y = Y(p.lat);
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r={p.big ? 9 : 5.5} fill="url(#pin-glow)" />
            <circle cx={x} cy={y} r={p.big ? 2.3 : 1.6} fill="#B5F54A">
              <animate attributeName="r" values={p.big ? "2.3;2.9;2.3" : "1.6;2;1.6"} dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={p.big ? 3.6 : 2.6} fill="none" stroke="#0B1018" strokeWidth="0.8" />
          </g>
        );
      })}
    </svg>
  );
}
