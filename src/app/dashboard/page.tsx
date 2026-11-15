import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Mission Control - NEURO//HIGH",
  description: "Your XP, badges, ranks, and the neural network you're building lesson by lesson.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
