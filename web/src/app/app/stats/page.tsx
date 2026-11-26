import type { Metadata } from "next";
import { MemberStats } from "./member-stats";

export const metadata: Metadata = { title: "Mi progreso" };

export default function MemberStatsPage() {
  return <MemberStats />;
}
