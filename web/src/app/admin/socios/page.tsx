import type { Metadata } from "next";
import { Directory } from "./_list/directory";

export const metadata: Metadata = { title: "Socios" };

/* Directorio de socios: la pantalla más usada del panel. Buscar, filtrar y actuar en segundos. */
export default function SociosPage() {
  return <Directory />;
}
