import type { Metadata } from "next";
import { MemberShell } from "@/components/member/shell";

export const metadata: Metadata = { title: { default: "Mi gimnasio", template: "%s · Mi gimnasio" } };

export default function MemberLayout({ children }: LayoutProps<"/app">) {
  return <MemberShell>{children}</MemberShell>;
}
