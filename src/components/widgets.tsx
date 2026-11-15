"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Pencil } from "lucide-react";
import { BADGES, nextRank, rankFor, rankIndex, RANKS } from "@/lib/gamification";
import { BadgeIcon, useProgress } from "./ProgressProvider";

export function XpBar({ tall = false }: { tall?: boolean }) {
  const { state } = useProgress();
  const xp = state?.learner.xp ?? 0;
  const rank = rankFor(xp);
  const next = nextRank(xp);
  const pct = next ? Math.min(100, Math.round(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)) : 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-xl font-extrabold tracking-tight text-ink">
          {rank.name}
          <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">
            rank {rankIndex(xp) + 1}/8
          </span>
        </p>
        <p className="font-mono text-xs text-ink/60">
          {next ? (
            <>
              <span className="font-bold text-ink">{xp.toLocaleString()}</span> / {next.minXp.toLocaleString()} XP
            </>
          ) : (
            <span className="font-bold text-ink">{xp.toLocaleString()} XP - MAX RANK</span>
          )}
        </p>
      </div>
      <div className={`mt-2 rounded-full border-2 border-ink bg-white ${tall ? "h-6" : "h-4"} p-[3px]`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 16 }}
          className="h-full rounded-full bg-gradient-to-r from-vio via-blush to-sun"
        />
      </div>
      {next && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink/50">
          {next.minXp - xp} XP to {next.name}
        </p>
      )}
    </div>
  );
}

export function RankLadder() {
  const { state } = useProgress();
  const xp = state?.learner.xp ?? 0;
  const idx = rankIndex(xp);

  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {RANKS.map((r, i) => {
        const reached = xp >= r.minXp;
        const current = i === idx;
        return (
          <li
            key={r.name}
            className={`relative rounded-xl border-2 p-3.5 transition-all ${
              current
                ? "border-ink bg-sun shadow-[4px_4px_0_#171321]"
                : reached
                  ? "border-ink bg-lime/30"
                  : "border-ink/20 bg-white opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                L{i + 1} · {r.minXp} XP
              </span>
              {reached ? (
                <Check className="size-4 text-[#2E7D0F]" strokeWidth={3} />
              ) : (
                <Lock className="size-3.5 text-ink/35" />
              )}
            </div>
            <p className="mt-1 font-display text-base font-extrabold tracking-tight text-ink">{r.name}</p>
            <p className="text-[11px] leading-snug text-ink/60">{r.tagline}</p>
            {current && (
              <span className="absolute -top-2.5 right-3 chip !py-0.5 bg-vio !text-[9px] text-white">You are here</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function BadgeShelf() {
  const { state } = useProgress();
  const owned = new Set(state?.badges ?? []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {BADGES.map((b) => {
        const has = owned.has(b.id);
        return (
          <div
            key={b.id}
            className={`group relative rounded-xl border-2 p-3.5 transition-all ${
              has
                ? "border-ink bg-white shadow-[4px_4px_0_#171321] hover:-translate-y-1"
                : "border-dashed border-ink/30 bg-white/50"
            }`}
          >
            <span
              className={`grid size-10 place-items-center rounded-lg border-2 ${
                has ? "border-ink" : "border-ink/25 bg-ink/5"
              }`}
              style={has ? { backgroundColor: b.color } : undefined}
            >
              {has ? (
                <BadgeIcon id={b.id} className="size-5 text-ink" />
              ) : (
                <Lock className="size-4 text-ink/30" />
              )}
            </span>
            <p className={`mt-2 font-display text-sm font-extrabold leading-tight ${has ? "text-ink" : "text-ink/40"}`}>
              {b.name}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink/55">{has ? b.flavor : b.how}</p>
          </div>
        );
      })}
    </div>
  );
}

export function CodenameEditor() {
  const { state, rename } = useProgress();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const codename = state?.learner.codename ?? "····";

  const submit = async () => {
    if (await rename(value)) setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(codename);
          setEditing(true);
        }}
        className="group inline-flex items-baseline gap-2 text-left"
        title="Rename your agent handle"
      >
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {codename}
        </h1>
        <Pencil className="size-4 self-center text-ink/40 transition-colors group-hover:text-ink" />
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        maxLength={24}
        autoFocus
        className="sticker-sm w-56 bg-white px-3 py-2 font-display text-2xl font-extrabold text-ink focus:outline-none"
        aria-label="Agent codename"
      />
      <button onClick={submit} className="btn btn-primary !py-2.5">Save</button>
      <button onClick={() => setEditing(false)} className="btn btn-ghost !py-2.5">Cancel</button>
    </div>
  );
}
