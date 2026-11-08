"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, House, LayoutDashboard, Menu, Rocket, Swords, Trophy, X, Zap } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { rankFor } from "@/lib/gamification";
import SettingsMenu from "./SettingsMenu";

const LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/#modules", label: "Modules", icon: Rocket },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Header() {
  const pathname = usePathname();
  const { state } = useProgress();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const xp = state?.learner.xp ?? 0;
  const rank = rankFor(xp);
  const inArena = pathname.startsWith("/arena");

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      {/* 3 columns: logo | centered nav | right cluster. The 1fr sides keep the nav in the middle. */}
      <div className="grid h-[68px] w-full grid-cols-[1fr_auto] items-center gap-3 px-3 sm:px-5 md:grid-cols-[1fr_auto_1fr]">
        {/* LEFT: logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 justify-self-start" aria-label="NEURO//HIGH home">
          <Image
            src="/img/logo-icon.png"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            priority
            unoptimized
            className="size-9 shrink-0 object-contain transition-transform group-hover:-rotate-6"
          />
          <Image
            src="/img/logo-name.png"
            alt="NEURO//HIGH"
            width={168}
            height={26}
            priority
            unoptimized
            className="hidden h-[22px] w-auto shrink-0 object-contain min-[420px]:block"
          />
        </Link>

        {/* MIDDLE: nav, centered in the grid */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href.replace("/#modules", "/learn"));
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: XP, Arena, Settings */}
        <div className="flex shrink-0 items-center gap-2 justify-self-end sm:gap-2.5 md:col-start-3">
          {state && (
            <Link
              href="/dashboard"
              className="chip hidden shrink-0 bg-sun !px-4 !py-2 !text-xs text-ink transition-transform hover:-rotate-2 sm:inline-flex"
              title={`Rank: ${rank.name}`}
            >
              <Zap className="size-4" strokeWidth={2.8} />
              {xp.toLocaleString()} XP
              {state.learner.streak > 1 && (
                <span className="flex items-center gap-0.5 border-l-2 border-ink/20 pl-1.5">
                  <Flame className="size-4 text-coral" strokeWidth={2.6} />
                  {state.learner.streak}
                </span>
              )}
            </Link>
          )}

          <Link
            href="/arena"
            aria-current={inArena ? "page" : undefined}
            className={`group relative inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-gradient-to-r from-[#FF6B4A] via-[#FF8A3D] to-[#FFD645] px-3.5 py-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[#171321] shadow-[3px_3px_0_#171321,0_0_18px_rgba(255,107,74,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171321,0_0_26px_rgba(255,107,74,0.6)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#171321] sm:px-4 sm:py-2.5 sm:text-[13px] ${
              inArena ? "ring-4 ring-ink/20" : ""
            }`}
          >
            <Swords className="size-4 shrink-0 transition-transform group-hover:-rotate-12 sm:size-[18px]" strokeWidth={2.6} />
            <span>Arena</span>
            <Swords className="size-4 shrink-0 -scale-x-100 transition-transform group-hover:rotate-12 sm:size-[18px]" strokeWidth={2.6} />
            <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-white shadow-[2px_2px_0_#171321]">
              <Flame className="size-3.5 text-coral" strokeWidth={2.6} fill="currentColor" />
            </span>
          </Link>

          <SettingsMenu />

          <button
            className="btn btn-ghost !px-3 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-ink bg-cream md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 p-3">
              <Link
                href="/arena"
                className="flex items-center gap-2 rounded-lg border-2 border-ink bg-gradient-to-r from-coral to-sun px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider text-[#171321] shadow-[3px_3px_0_#171321]"
              >
                <Swords className="size-4" /> Arena
              </Link>
              {LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider text-ink hover:bg-ink/5"
                >
                  <l.icon className="size-4" /> {l.label}
                </Link>
              ))}
              {state && (
                <div className="mt-1 flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink/60">
                  <Zap className="size-4 text-vio" /> {xp} XP — Rank: {rank.name}
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
