import type { Metadata } from "next";
import { ReportsWorkspace } from "./_components/workspace";

export const metadata: Metadata = { title: "Reportes" };

export default function ReportesPage() {
  return <ReportsWorkspace />;
}
