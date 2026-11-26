import type { Metadata } from "next";
import { MemberHome } from "./member-home";

// el template del layout no aplica a su propia page: título absoluto para coherencia con /app/stats
export const metadata: Metadata = { title: { absolute: "Inicio · Mi gimnasio" } };

export default function MemberHomePage() {
  return <MemberHome />;
}
