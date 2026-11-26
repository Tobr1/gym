/**
 * Fotografía deportiva con iluminación cinematográfica (Unsplash, licencia libre).
 * Para producción conviene alojarlas en el CDN propio.
 */
const u = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ""}`;

export const PHOTO = {
  heroCurl: (w?: number, h?: number) => u("1581009146145-b5ef050c2e1e", w, h),
  backWoman: (w?: number, h?: number) => u("1574680096145-d05b474e2155", w, h),
  focusWoman: (w?: number, h?: number) => u("1550345332-09e3ac987658", w, h),
  backMan: (w?: number, h?: number) => u("1526506118085-60ce8714f8c5", w, h),
  runners: (w?: number, h?: number) => u("1552674605-db6ffd4facb5", w, h),
  dumbbells: (w?: number, h?: number) => u("1576678927484-cc907957088c", w, h),
  deadlift: (w?: number, h?: number) => u("1517963879433-6ad2b056d712", w, h),
  barbell: (w?: number, h?: number) => u("1517836357463-d25dfeac3438", w, h),
  wrist: (w?: number, h?: number) => u("1549060279-7e168fcee0c2", w, h),
  pullup: (w?: number, h?: number) => u("1541534741688-6078c6bfb5c5", w, h),
  machine: (w?: number, h?: number) => u("1546483875-ad9014c88eba", w, h),
  classRopes: (w?: number, h?: number) => u("1517130038641-a774d04afb3c", w, h),
  shoulder: (w?: number, h?: number) => u("1530822847156-5df684ec5ee1", w, h),
  row: (w?: number, h?: number) => u("1534438327276-14e5300c3a48", w, h),
  coach: (w?: number, h?: number) => u("1571019614242-c5c5dee9f50b", w, h),
  yoga: (w?: number, h?: number) => u("1518611012118-696072aa579a", w, h),
  ropes: (w?: number, h?: number) => u("1599058917212-d750089bc07e", w, h),
  bench: (w?: number, h?: number) => u("1584466977773-e625c37cdd50", w, h),
  pushup: (w?: number, h?: number) => u("1594737625785-a6cbdabd333c", w, h),
  gymFloor: (w?: number, h?: number) => u("1540497077202-7c8a3999166f", w, h),
};

const faces = [
  "1500648767791-00dcc994a43e",
  "1494790108377-be9c29b29330",
  "1438761681033-6461ffad8d80",
  "1472099645785-5658abf4ff4e",
  "1534528741775-53994a69daeb",
  "1544005313-94ddf0286df2",
  "1506794778202-cad84cf45f1d",
  "1517841905240-472988babdf9",
  "1539571696357-5a69c17a67c6",
  "1580489944761-15a19d654956",
  "1599566150163-29194dcaad36",
  "1527980965255-d3b416303d12",
  "1573496359142-b8d87734a5a2",
  "1560250097-0b93528c311a",
  "1531123897727-8f129e1688ce",
];

export const face = (i: number, size = 160) =>
  `https://images.unsplash.com/photo-${faces[i % faces.length]}?auto=format&fit=crop&crop=faces&q=80&w=${size}&h=${size}`;
