"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, RefreshCw, Shield, Swords, Trophy, Zap } from "lucide-react";
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

const LABEL_COLOR = { easier: "#C6F32E", even: "#FFD645", harder: "#FF6B4A" } as const;

export default function ArenaLobby() {
  const { state, loading } = useProgress();
  const [cands, setCands] = useState<Opponent[]>([]);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [battleKey, setBattleKey] = useState(0);

  const arena = state?.arena ?? emptyArenaStats();
  const xp = state?.learner.xp ?? 0;
  const completed = useMemo(() => Object.keys(state?.completed ?? {}), [state?.completed]);

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-vio">
          <Swords className="-my-0.5 size-5 shrink-0" /> The Arena
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Battle for XP
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
          Face players from the leaderboard in a timed question duel. Correct answers earn Charge, Charge buys
          attacks and shields. Win to take XP from your rival — lose and they take it from you.
        </p>
      </motion.div>

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Win streak <Flame className="-my-0.5 size-9 shrink-0 text-coral" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{arena.streak}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            best {arena.bestStreak} · {questionClock(arena.streak)}s shot clock
          </p>
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Record <Trophy className="-my-0.5 size-9 shrink-0 text-sun" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {arena.wins}
            <span className="text-ink/30">–{arena.losses}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">wins – losses</p>
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Your XP <Zap className="-my-0.5 size-9 shrink-0 text-vio" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{xp.toLocaleString()}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            battles pay {BATTLE_XP_MIN}–{BATTLE_XP_MAX} XP
          </p>
        </div>
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Question pool <Shield className="-my-0.5 size-9 shrink-0 text-aqua-deep" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">{poolSize(completed)}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            {completed.length === 0
              ? "starter set · clear missions to grow it"
              : `from ${completed.length} cleared mission${completed.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {/* matchmaking */}
      <section className="sticker-lg mt-8 overflow-hidden bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-paper p-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-coral">Matchmaking</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
              {cands.length ? "Pick your opponent" : "Find an opponent"}
            </h2>
          </div>
          <button onClick={search} disabled={loading} className="btn btn-violet !py-2.5 !text-xs">
            {cands.length ? (
              <>
                <RefreshCw className="size-4" /> Reroll
              </>
            ) : (
              <>
                <Swords className="size-4" /> Search
              </>
            )}
          </button>
        </header>

        <div className="p-4 sm:p-5">
          {cands.length === 0 ? (
            <p className="text-center text-sm text-ink/55">
              Opponents are matched near your XP. The longer your streak, the stronger they get — and the more XP
              they&apos;re worth.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {cands.map((o) => {
                const win = battleXp(xp, o, true, 55, arena.streak);
                const loss = battleXp(xp, o, false, 0, arena.streak);
                return (
                  <div key={o.id} className="sticker relative flex flex-col bg-paper p-4 pt-6">
                    <span className="chip absolute -top-3 left-4 text-ink" style={{ backgroundColor: LABEL_COLOR[o.label] }}>
                      {o.label} match
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
                        <p className="text-[9px] uppercase tracking-wider text-ink/60">Win</p>
                        <p className="font-bold text-ink">≈ +{win} XP</p>
                      </div>
                      <div className="rounded-lg border-2 border-ink bg-coral/25 p-2">
                        <p className="text-[9px] uppercase tracking-wider text-ink/60">Lose</p>
                        <p className="font-bold text-ink">{loss} XP</p>
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      threat {Math.round(o.accuracy * 100)}%
                    </p>
                    <button onClick={() => setOpponent(o)} className="btn btn-primary mt-4 w-full !py-2.5 !text-xs">
                      <Swords className="size-4" /> Battle
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
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink/75">
            <li>
              <strong className="text-ink">1 · Answer on the clock.</strong> Each turn you get one question. Correct =
              Charge (harder tier + fast answer = more).
            </li>
            <li>
              <strong className="text-ink">2 · Spend Charge.</strong> Pulse Strike, Overclock Blast, Nano Repair,
              Firewall, Time Jam. Or bank it for a bigger move.
            </li>
            <li>
              <strong className="text-ink">3 · Your rival takes their turn.</strong> Higher-ranked players answer more
              often and hit harder.
            </li>
            <li>
              <strong className="text-ink">4 · First to 0 HP loses</strong> (or most HP after 10 rounds). Beating a
              stronger rival pays more; losing to one costs less.
            </li>
          </ol>
          <p className="mt-3 text-xs text-ink/55">
            Questions only come from missions you&apos;ve cleared.{" "}
            <Link
              href="/dashboard"
              className="font-bold text-ink underline decoration-lime decoration-2 underline-offset-2"
            >
              Clear more
            </Link>{" "}
            to widen the pool.
          </p>
        </section>

        <section className="sticker-lg bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-coral">Recent battles</p>
          {arena.history.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">No battles yet. Your first rival is waiting.</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {arena.history.slice(0, 8).map((h) => (
                <li
                  key={h.at}
                  className="flex items-center justify-between rounded-lg border-2 border-ink/15 px-3 py-2 text-sm"
                >
                  <span className="truncate font-display font-bold text-ink">
                    {h.won ? "W" : "L"} · {h.opponentName}
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
