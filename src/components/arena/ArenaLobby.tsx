"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, RefreshCw, Shield, Swords, Trophy, Zap } from "lucide-react";
import RankIcon from "@/components/RankIcon";
import { useProgress } from "@/components/ProgressProvider";
import { RANKS } from "@/lib/gamification";
import { buildLeaderboard } from "@/lib/leaderboard";
import {
  BATTLE_XP_MAX,
  BATTLE_XP_MIN,
  battleXp,
  emptyArenaStats,
  findOpponents,
  poolSize,
  questionClock,
  type Opponent,
} from "@/lib/arena";
import BattleScreen from "./BattleScreen";

const LABEL_COPY = {
  easier: { text: "Easier match", color: "#C6F32E" },
  even: { text: "Even match", color: "#FFD645" },
  harder: { text: "Tougher match", color: "#FF6B4A" },
} as const;

export default function ArenaLobby() {
  const { state, loading } = useProgress();
  const [cands, setCands] = useState<Opponent[]>([]);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [battleKey, setBattleKey] = useState(0);

  const arena = state?.arena ?? emptyArenaStats();
  const xp = state?.learner.xp ?? 0;
  const completed = useMemo(() => Object.keys(state?.completed ?? {}), [state?.completed]);
  const locked = poolSize(completed) === 0;

  const board = useMemo(
    () =>
      state
        ? buildLeaderboard(
            state.leaderboardSeed ?? 1,
            { name: state.learner.codename, xp, badges: state.badges.length },
            state.botXpDeltas,
          )
        : [],
    [state, xp],
  );

  const search = () => setCands(findOpponents(board, xp, arena.streak));

  if (opponent) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
        <BattleScreen
          key={battleKey}
          opponent={opponent}
          streak={arena.streak}
          onExit={() => {
            setOpponent(null);
            setCands([]);
            setBattleKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      {/* intro */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-vio">
          <Swords className="-my-0.5 size-5 shrink-0" aria-hidden="true" /> Arena
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Head-to-head practice
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
          Pick an opponent from the leaderboard and work through a round of questions together. Answer correctly
          to earn Charge, then use it on moves that help you pull ahead. A win earns you XP. A loss takes some
          away, so choose matches you feel ready for.
        </p>
      </motion.div>

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Win streak <Flame className="-my-0.5 size-9 shrink-0 text-coral" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{arena.streak}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            Best: {arena.bestStreak} · {questionClock(arena.streak)} seconds per question
          </p>
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Record <Trophy className="-my-0.5 size-9 shrink-0 text-sun" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {arena.wins}
            <span className="text-ink/30">–{arena.losses}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">Wins and losses</p>
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Your XP <Zap className="-my-0.5 size-9 shrink-0 text-vio" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{xp.toLocaleString()}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            A win earns {BATTLE_XP_MIN}–{BATTLE_XP_MAX} XP
          </p>
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Questions ready <Shield className="-my-0.5 size-9 shrink-0 text-aqua-deep" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{poolSize(completed)}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            {locked
              ? "Unlocks after your first lesson"
              : `From ${completed.length} lesson${completed.length === 1 ? "" : "s"} you've finished`}
          </p>
        </div>
      </div>

      {/* matchmaking */}
      <section className="sticker-lg mt-8 overflow-hidden bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-paper p-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-coral">Matchmaking</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
              {cands.length ? "Choose an opponent" : "Find a match"}
            </h2>
          </div>
          <button onClick={search} disabled={loading || locked} className="btn btn-violet !py-2.5 !text-xs">
            {cands.length ? (
              <>
                <RefreshCw className="size-4" aria-hidden="true" /> Show new matches
              </>
            ) : (
              <>
                <Swords className="size-4" aria-hidden="true" /> Find a match
              </>
            )}
          </button>
        </header>

        <div className="p-4 sm:p-5">
          {locked ? (
            <div className="py-6 text-center">
              <p className="font-display text-xl font-extrabold text-ink">The arena opens after your first lesson</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60">
                Arena questions come from lessons you&apos;ve finished, so you&apos;ll always be reviewing what
                you&apos;ve learned. Finish one lesson to unlock matches.
              </p>
              <Link href="/learn/foundations" className="btn btn-primary mt-5 !py-3 !text-xs">
                Start Module 01 <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : cands.length === 0 ? (
            <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-ink/55">
              We&apos;ll look for learners with XP close to yours. The longer your win streak, the tougher the
              matches get, and the bigger the rewards.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {cands.map((o) => {
                const win = battleXp(xp, o, true, 55, arena.streak);
                const loss = battleXp(xp, o, false, 0, arena.streak);
                const label = LABEL_COPY[o.label];
                return (
                  <div key={o.id} className="sticker relative flex flex-col bg-paper p-4 pt-6">
                    <span
                      className="chip absolute -top-3 left-4 text-ink"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text}
                    </span>

                    <div className="flex items-center gap-3">
                      <RankIcon rank={RANKS[o.rankIdx]} size={44} />
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg font-extrabold leading-tight text-ink">{o.name}</p>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                          {RANKS[o.rankIdx].name} · {o.xp.toLocaleString()} XP
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="rounded-lg border-2 border-ink bg-lime/40 p-2">
                        <p className="text-[9px] uppercase tracking-wider text-ink/60">If you win</p>
                        <p className="font-bold text-ink">about +{win} XP</p>
                      </div>
                      <div className="rounded-lg border-2 border-ink bg-coral/25 p-2">
                        <p className="text-[9px] uppercase tracking-wider text-ink/60">If you lose</p>
                        <p className="font-bold text-ink">{loss} XP</p>
                      </div>
                    </div>

                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      Accuracy: {Math.round(o.accuracy * 100)}%
                    </p>

                    <button onClick={() => setOpponent(o)} className="btn btn-primary mt-4 w-full !py-2.5 !text-xs">
                      <Swords className="size-4" aria-hidden="true" /> Start battle
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* rules + history */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="sticker-lg bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-vio">How a battle works</p>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed text-ink/75">
            <li>
              <strong className="text-ink">Answer the question.</strong> You get one question per turn. A correct
              answer earns Charge, and answering quickly earns a bonus.
            </li>
            <li>
              <strong className="text-ink">Spend your Charge.</strong> In the shop, you can use it to attack, heal,
              put up a shield, or slow your opponent down.
            </li>
            <li>
              <strong className="text-ink">Your opponent takes a turn.</strong> They answer questions too, and they
              may use items. Higher-ranked players tend to do both more often.
            </li>
            <li>
              <strong className="text-ink">Finish the battle.</strong> Reduce your opponent to 0 HP to win outright.
              If neither side gets there, the player with more HP after 10 rounds wins.
            </li>
          </ol>
          <p className="mt-4 rounded-xl border-2 border-ink/15 bg-paper p-3 text-xs leading-relaxed text-ink/65">
            Questions only come from lessons you&apos;ve finished. Want more to practice?{" "}
            <Link
              href="/dashboard"
              className="font-bold text-ink underline decoration-lime decoration-2 underline-offset-2"
            >
              Check your dashboard
            </Link>{" "}
            to see which lessons are still open.
          </p>
        </section>

        <section className="sticker-lg bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-coral">Recent battles</p>
          {arena.history.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-ink/55">
              No battles yet. Your first match will show up here.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {arena.history.slice(0, 8).map((h) => (
                <li
                  key={h.at}
                  className="flex items-center justify-between rounded-lg border-2 border-ink/15 px-3 py-2 text-sm"
                >
                  <span className="truncate font-display font-bold text-ink">
                    {h.won ? "Win" : "Loss"} · {h.opponentName}
                  </span>
                  <span className={`font-mono text-xs font-bold ${h.won ? "text-[#2E7D0F]" : "text-[#B42318]"}`}>
                    {h.xpDelta > 0 ? "+" : ""}
                    {h.xpDelta} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
