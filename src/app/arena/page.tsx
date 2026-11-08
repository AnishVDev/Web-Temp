import type { Metadata } from "next";
import ArenaLobby from "@/components/arena/ArenaLobby";

export const metadata: Metadata = { title: "Arena — NEURO//HIGH" };

export default function ArenaPage() {
  return <ArenaLobby />;
}
