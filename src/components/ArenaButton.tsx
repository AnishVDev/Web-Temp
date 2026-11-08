"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Swords } from "lucide-react";

export default function ArenaButton() {
  const pathname = usePathname();
  const active = pathname.startsWith("/arena");

  return (
    <Link
      href="/arena"
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex items-center gap-2 rounded-[1.75rem] border-2 border-ink px-4 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-[#171321] shadow-sticker transition-transform hover:-translate-y-0.5 hover:-rotate-1 sm:px-5 ${
        active ? "ring-4 ring-ink/20" : ""
      }`}
      style={{
        background: "linear-gradient(120deg, #FF4D2E 0%, #FF7A3D 45%, #FFD645 100%)",
      }}
    >
      {/* glow in the bottom corner, like embers */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_85%_120%,rgba(255,255,255,0.6),transparent_55%)]"
      />

      <Swords className="relative size-4 shrink-0" strokeWidth={2.6} aria-hidden="true" style={{ transform: "scaleX(-1)" }} />
      <span className="relative">Arena</span>
      <Swords className="relative size-4 shrink-0" strokeWidth={2.6} aria-hidden="true" />

      {/* small flame badge that wiggles on hover */}
      <span
        aria-hidden="true"
        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-white transition-transform group-hover:rotate-12"
      >
        <Flame className="size-3.5 text-coral" strokeWidth={2.6} />
      </span>
    </Link>
  );
}
