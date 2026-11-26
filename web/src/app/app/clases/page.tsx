import type { Metadata } from "next";
import { ClassBooking } from "./class-booking";

export const metadata: Metadata = { title: "Clases" };

export default function MemberClassesPage() {
  return <ClassBooking />;
}
