"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Award, Flame, LayoutDashboard, RotateCcw, Target, Trash2 } from "lucide-react";
import NeuralMap from "@/components/NeuralMap";
import ModuleCard from "@/components/ModuleCard";
import StartCta from "@/components/StartCta";
import { BadgeShelf, CodenameEditor, RankLadder, XpBar } from "@/components/widgets";
import { ALL_LESSON_LIST, MODULES, TOTAL_LESSONS } from "@/content";
import { BADGES } from "@/lib/gamification";
import { useProgress } from "@/components/ProgressProvider";

const PROGRESS_PURPLE = "#C4A7F5";

export default function DashboardClient() {
  const { state, loading, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const done = Object.keys(state?.completed ?? {}).length;
  const badges = state?.badges.length ?? 0;
  const streak = state?.learner.streak ?? 1;
  const nextUp = ALL_LESSON_LIST.find((l) => !state?.completed[l.slug]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      {/* header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-vio">
          <LayoutDashboard className="-my-0.5 size-5 shrink-0" /> Mission control
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {loading ? (
            <div className="h-12 w-72 animate-pulse rounded-xl border-2 border-ink/10 bg-white" />
          ) : (
            <CodenameEditor />
          )}
          <span className="chip bg-white text-ink/60">agent on record</span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
          Keep track of your codename, XP, badges, and your progress across the neural
          network map. Everything here updates as you complete missions and challenges.
        </p>
      </motion.div>

      {/* stat row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.06 }}
        className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
      >
        <div className="sticker xp-card-wrapper bg-white p-5 lg:col-span-1">
          <XpBar tall />
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Missions cleared <Target className="-my-0.5 size-9 shrink-0 text-vio" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {done}<span className="text-ink/30">/{TOTAL_LESSONS}</span>
          </p>
          <div className="mt-1 h-2.5 rounded-full border border-ink/40 bg-paper p-[1.5px]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(done / TOTAL_LESSONS) * 100}%`,
                backgroundColor: PROGRESS_PURPLE,
              }}
            />
          </div>
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Badges <Award className="-my-0.5 size-9 shrink-0 text-sun" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {badges}<span className="text-ink/30">/{BADGES.length}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            {badges === 0 ? "the shelf is hungry" : badges >= BADGES.length ? "complete set. ridiculous." : "keep hunting"}
          </p>
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Day streak <Flame className="-my-0.5 size-9 shrink-0 text-coral" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {streak}<span className="text-lg text-ink/30"> day{streak === 1 ? "" : "s"}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            finish a lesson today to grow it
          </p>
        </div>
      </motion.div>

      {/* neural map */}
      <div className="mt-8">
        <NeuralMap />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Badge shelf</h2>
          <div className="mt-4">
            <BadgeShelf />
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Rank ladder</h2>
          <div className="mt-4">
            <RankLadder />
          </div>
        </section>
      </div>

      {/* danger zone */}
      <div className="mt-14 border-t-2 border-dashed border-ink/25 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink/45">
            Danger zone - wipe your build and start fresh
          </p>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn btn-ghost !py-2 !text-[10px] text-ink/60">
              <RotateCcw className="-my-0.5 size-4 shrink-0" /> Reset progress
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await reset();
                  setConfirmReset(false);
                }}
                className="btn btn-coral !py-2 !text-[10px]"
              >
                <Trash2 className="-my-0.5 size-4 shrink-0" /> Yes, wipe it
              </button>
              <button onClick={() => setConfirmReset(false)} className="btn btn-ghost !py-2 !text-[10px]">
                Keep my build
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keep the XP bar fill solid light purple */}
      <style>{`
        .xp-card-wrapper [style*="width"],
        .xp-card-wrapper [role="progressbar"] > div,
        .xp-card-wrapper .bar-fill {
          background-color: ${PROGRESS_PURPLE} !important;
          background-image: none !important;
        }
      `}</style>
    </div>
  );
}
