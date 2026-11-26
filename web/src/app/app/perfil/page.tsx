import type { Metadata } from "next";
import { MemberProfile } from "./member-profile";

export const metadata: Metadata = { title: "Mi perfil" };

export default function MemberProfilePage() {
  return <MemberProfile />;
}
