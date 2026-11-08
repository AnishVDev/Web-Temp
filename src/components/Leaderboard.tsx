"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Crown,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { BADGES, RANKS } from "@/lib/gamification";
import {
  LEADERBOARD_SIZE,
  buildLeaderboard,
  chaseTarget,
  condensedRows,
  topPercent,
  windowAround,
  type BoardRow,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { useProgress } from "./ProgressProvider";
import RankIcon from "./RankIcon";

const PODIUM = ["#FFD645", "#43D9FF", "#FF8BD1"];

const DOT_GRID = {
  backgroundColor: "#fffaf0",
  backgroundImage: "radial-gradient(rgba(23,19,33,0.12) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
};

/* ── Shared data hook ─────────────────────────────────────────────── */

function useBoard() {
  const { state, loading } = useProgress();
  const ready = !loading && state !== null;

  const seed = state?.leaderboardSeed ?? 1;
  const name = state?.learner.codename ?? "You";
  const xp = state?.learner.xp ?? 0;
  const badges = state?.badges.length ?? 0;

  const deltas = state?.botXpDeltas;

  const list = useMemo(
    () => (ready ? buildLeaderboard(seed, { name, xp, badges }, deltas) : []),
    [ready, seed, name, xp, badges, deltas],
  );

  return { list, you, ready };
}

/* ── Pieces ───────────────────────────────────────────────────────── */

function PositionTag({ position }: { position: number }) {
  const podium = PODIUM[position - 1];
  return (
    <span
      className={`grid h-8 w-11 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${
        podium ? "border-2 border-ink text-ink shadow-[2px_2px_0_#171321]" : "text-ink/55"
      }`}
      style={podium ? { backgroundColor: podium } : undefined}
    >
      {position === 1 ? (
        <span className="flex items-center gap-0.5">
          <Crown className="size-3" strokeWidth={2.6} aria-hidden="true" />1
        </span>
      ) : (
        `#${position}`
      )}
    </span>
  );
}

function EntryRow({ entry, full = false }: { entry: LeaderboardEntry; full?: boolean }) {
  return (
    <li
      id={entry.isYou && full ? "leaderboard-you" : undefined}
      aria-current={entry.isYou ? "true" : undefined}
      className={[
        "flex items-center gap-3 rounded-xl border-2 px-2.5 sm:px-3",
        full ? "h-[60px]" : "h-14",
        entry.isYou
          ? "border-ink bg-[#fff4c2] shadow-[3px_3px_0_#171321]"
          : "border-transparent bg-white/80",
      ].join(" ")}
    >
      <PositionTag position={entry.position} />
      <RankIcon rank={entry.rank} size={full ? 38 : 34} />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-display text-sm font-extrabold text-ink sm:text-[15px]">
            {entry.name}
          </p>
          {entry.isYou && (
            <span className="chip shrink-0 !py-0.5 bg-vio !text-[9px] text-white">You</span>
          )}
        </div>
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
          {entry.rank.name}
        </p>
      </div>

      {full && (
        <p className="hidden w-16 shrink-0 text-center font-mono text-xs font-bold text-ink/60 sm:block">
          {entry.badges}/{BADGES.length}
        </p>
      )}

      <p className="w-20 shrink-0 text-right font-display text-base font-extrabold tabular-nums text-ink">
        {entry.xp.toLocaleString()}
        <span className="ml-1 font-mono text-[9px] font-bold text-ink/45">XP</span>
      </p>
    </li>
  );
}

function GapRow({ hidden, onExpand }: { hidden: number; onExpand: () => void }) {
  return (
    <li className="flex items-center gap-3 py-1" aria-label={`${hidden} players hidden`}>
      <span className="h-0 flex-1 border-t-2 border-dashed border-ink/20" />
      <button
        onClick={onExpand}
        className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45 transition-colors hover:text-ink"
      >
        ··· {hidden} more ···
      </button>
      <span className="h-0 flex-1 border-t-2 border-dashed border-ink/20" />
    </li>
  );
}

function SkeletonRows({ count, tall = false }: { count: number; tall?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className={`${tall ? "h-[60px]" : "h-14"} animate-pulse rounded-xl border-2 border-ink/10 bg-white`}
        />
      ))}
    </>
  );
}

/* ── Homepage preview ─────────────────────────────────────────────── */

export function LeaderboardPreview() {
  const { list, you, ready } = useBoard();
  const rows = ready ? windowAround(list, 2) : [];
  const chase = chaseTarget(list, you);

  return (
    <section className="sticker-lg overflow-hidden bg-white" aria-label="Leaderboard preview">
      <header className="flex items-start justify-between gap-4 border-b-2 border-ink bg-paper p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-sun text-ink">
              <Trophy className="size-3.5" aria-hidden="true" />
              Leaderboard
            </span>
            <span className="chip bg-white text-ink/60">{LEADERBOARD_SIZE} players</span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Where you stand
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-3xl font-extrabold leading-none text-ink">
            {ready && you ? `#${you.position}` : "—"}
          </p>
          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
            {ready && you ? `Top ${topPercent(you.position)}%` : "Loading"}
          </p>
        </div>
      </header>

      <ol className="space-y-1.5 p-3 sm:p-4" style={DOT_GRID}>
        {ready ? rows.map((e) => <EntryRow key={e.id} entry={e} />) : <SkeletonRows count={5} />}
      </ol>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-paper px-5 py-3.5">
        <p className="max-w-[17rem] text-xs leading-snug text-ink/65">
          {!ready
            ? "Loading your spot…"
            : chase
              ? (
                <>
                  Earn <strong className="text-ink">{chase.xpNeeded.toLocaleString()} XP</strong> to pass{" "}
                  <strong className="text-ink">{chase.name}</strong>.
                </>
              )
              : "You're in first place. Nobody is above you."}
        </p>
        <Link href="/leaderboard" className="btn btn-ghost !px-4 !py-2.5 !text-xs">
          Full leaderboard <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ── Full leaderboard page ────────────────────────────────────────── */

export function LeaderboardFull() {
  const { list, you, ready } = useBoard();
  const [showAll, setShowAll] = useState(false);

  const rows: BoardRow[] = useMemo(() => {
    if (!ready) return [];
    if (showAll) return list.map((entry) => ({ kind: "entry" as const, entry }));
    return condensedRows(list, { top: 10, radius: 4, bottom: 3 });
  }, [ready, list, showAll]);

  const rankCounts = useMemo(() => {
    const counts = RANKS.map(() => 0);
    list.forEach((e) => counts[e.rankIdx]++);
    return counts;
  }, [list]);
  const maxCount = Math.max(1, ...rankCounts);

  const chase = chaseTarget(list, you);

  const findMe = () => {
    document.getElementById("leaderboard-you")?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      {/* header */}
      <div>
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-vio">
          <Trophy className="-my-0.5 size-5 shrink-0" aria-hidden="true" /> Leaderboard
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          See where you stand
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
          You're ranked against {LEADERBOARD_SIZE - 1} players. Your position updates as you earn XP,
          and reseting will restart your ranking. You can change your name on
          your{" "}
          <Link href="/dashboard" className="font-bold text-ink underline decoration-lime decoration-2 underline-offset-2">
            dashboard
          </Link>
          .
        </p>
      </div>

      {/* stat row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Your position <Users className="-my-0.5 size-9 shrink-0 text-vio" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {ready && you ? `#${you.position}` : "—"}
            <span className="text-lg text-ink/30"> / {LEADERBOARD_SIZE}</span>
          </p>
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Percentile <TrendingUp className="-my-0.5 size-9 shrink-0 text-aqua-deep" aria-hidden="true" />
          </p>
          <p className="font-display text-4xl font-extrabold text-ink">
            {ready && you ? `Top ${topPercent(you.position)}%` : "—"}
          </p>
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">Your rank</p>
          {ready && you ? (
            <div className="mt-2 flex items-center gap-3">
              <RankIcon rank={you.rank} size={44} />
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-extrabold leading-tight text-ink">{you.rank.name}</p>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                  {you.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ) : (
            <p className="font-display text-4xl font-extrabold text-ink">—</p>
          )}
        </div>

        <div className="sticker flex flex-col justify-between bg-white p-5">
          <p className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Next target <Target className="-my-0.5 size-9 shrink-0 text-coral" aria-hidden="true" />
          </p>
          {ready && chase ? (
            <>
              <p className="font-display text-4xl font-extrabold text-ink">+{chase.xpNeeded.toLocaleString()}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-ink/50">
                XP to pass {chase.name}
              </p>
            </>
          ) : (
            <p className="font-display text-2xl font-extrabold text-ink">
              {ready ? "You're #1" : "—"}
            </p>
          )}
        </div>
      </div>

      {/* board + breakdown */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* board */}
        <section className="sticker-lg overflow-hidden bg-white" aria-label="Leaderboard">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-paper p-5">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-vio">
                {showAll ? `All ${LEADERBOARD_SIZE} players` : "Top players · around you · bottom"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">Rankings</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {showAll && (
                <button onClick={findMe} className="btn btn-ghost !px-4 !py-2 !text-[10px]">
                  <Crosshair className="size-3.5" aria-hidden="true" /> Find me
                </button>
              )}
              <button
                onClick={() => setShowAll((v) => !v)}
                className="btn btn-ghost !px-4 !py-2 !text-[10px]"
                disabled={!ready}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="size-3.5" aria-hidden="true" /> Condensed view
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" aria-hidden="true" /> Show all {LEADERBOARD_SIZE}
                  </>
                )}
              </button>
            </div>
          </header>

          <div className="p-3 sm:p-4" style={DOT_GRID}>
            <div className="hidden items-center gap-3 px-[14px] pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink/45 sm:flex">
              <span className="w-11">#</span>
              <span className="w-[38px]" />
              <span className="flex-1">Player</span>
              <span className="w-16 text-center">Badges</span>
              <span className="w-20 text-right">XP</span>
            </div>

            <ol className={`space-y-1.5 ${showAll ? "max-h-[70vh] overflow-y-auto pr-1" : ""}`}>
              {ready ? (
                rows.map((row) =>
                  row.kind === "entry" ? (
                    <EntryRow key={row.entry.id} entry={row.entry} full />
                  ) : (
                    <GapRow key={row.key} hidden={row.hidden} onExpand={() => setShowAll(true)} />
                  ),
                )
              ) : (
                <SkeletonRows count={10} tall />
              )}
            </ol>
          </div>
        </section>

        {/* breakdown by rank */}
        <aside className="sticker-lg bg-white p-5" aria-label="Players by rank">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-coral">Players by rank</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
            How the board breaks down
          </h2>

          <ul className="mt-4 space-y-1.5">
            {RANKS.map((r, i) => {
              const mine = you?.rankIdx === i;
              const count = rankCounts[i];
              return (
                <li
                  key={r.name}
                  className={`flex items-center gap-3 rounded-xl border-2 p-2 ${
                    mine ? "border-ink bg-[#fff4c2] shadow-[3px_3px_0_#171321]" : "border-transparent"
                  }`}
                >
                  <RankIcon rank={r} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-display text-sm font-extrabold text-ink">
                        {r.name}
                        {mine && (
                          <span className="chip ml-2 !py-0.5 bg-vio !text-[9px] text-white">You</span>
                        )}
                      </p>
                      <p className="shrink-0 font-mono text-[10px] font-bold text-ink/50">
                        {ready ? count : "…"}
                      </p>
                    </div>
                    <div className="mt-1 h-2 rounded-full border border-ink/30 bg-paper">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: ready ? `${(count / maxCount) * 100}%` : "0%",
                          backgroundColor: r.color,
                          boxShadow: "inset 0 0 0 1px rgba(23,19,33,0.25)",
                        }}
                      />
                    </div>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-ink/40">
                      {r.minXp.toLocaleString()}+ XP
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
