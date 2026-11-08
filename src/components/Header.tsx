"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, House, LayoutDashboard, Menu, Rocket, Trophy, X, Zap } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { rankFor } from "@/lib/gamification";
import ArenaButton from "./ArenaButton";
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

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="NEURO//HIGH home">
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
            className="h-[22px] w-auto shrink-0 object-contain"
          />
        </Link>

        {/* nav (centered in the space between logo and XP) */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Primary">
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

        {/* XP chip (stays right of the nav) */}
        <div className="hidden flex-1 justify-end lg:flex">
          {state && (
            <Link
              href="/dashboard"
              className="chip bg-sun !py-1.5 text-ink transition-transform hover:-rotate-2"
              title={`Rank: ${rank.name}`}
            >
              <Zap className="size-3.5" strokeWidth={2.6} />
              {xp.toLocaleString()} XP
              {state.learner.streak > 1 && (
                <span className="flex items-center gap-0.5 border-l-2 border-ink/20 pl-1.5">
                  <Flame className="size-3.5 text-coral" strokeWidth={2.6} />
                  {state.learner.streak}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* right group: Arena, Settings, mobile menu */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0">
          <ArenaButton />
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
