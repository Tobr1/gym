import type { Metadata } from "next";
import { WorkoutPlayer } from "./workout-player";

export const metadata: Metadata = { title: "Rutina de hoy" };

export default function MemberRoutinePage() {
  return <WorkoutPlayer />;
}
