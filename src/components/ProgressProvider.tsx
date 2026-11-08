"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Award, BrainCircuit, Cpu, Crown, Flame, HeartHandshake, SearchCheck, Sparkles, Target, Wand2, Wrench, Zap } from "lucide-react";
import { BADGES, lessonXp, randomCodename, rankFor, type Badge, type Rank } from "@/lib/gamification";
import { newLeaderboardSeed } from "@/lib/leaderboard";
import { emptyArenaStats, type ArenaStats, type BattleRecord } from "@/lib/arena";
import { lessonsOf } from "@/content";
import type { Lesson } from "@/content/types";

export type CompletionInfo = {
  correct: number;
  total: number;
  maxCombo: number;
  attempts: number;
  at: string;
};

export type LearnerState = {
  learner: { codename: string; xp: number; streak: number };
  completed: Record<string, CompletionInfo>;
  badges: string[];
  /** Seeds the simulated leaderboard. A new one is created on every reset. */
  leaderboardSeed?: number;
  /** XP changes applied to simulated players from arena battles (bot id → delta). */
  botXpDeltas: Record<string, number>;
  /** Arena win/loss/streak record and battle history. */
  arena: ArenaStats;
};

type QuizResult = { correct: number; total: number; maxCombo: number; attempts: number };

type ToastPayload =
  | { kind: "xp"; xp: number; title: string }
  | { kind: "badge"; badge: Badge }
  | { kind: "info"; title: string; text: string };

type Toast = ToastPayload & { id: number };

type Ctx = {
  state: LearnerState | null;
  loading: boolean;
  isCompleted: (slug: string) => boolean;
  completion: (slug: string) => CompletionInfo | undefined;
  /** Complete a lesson after passing its checkpoint. */
  complete: (lesson: Lesson, result: QuizResult, hints?: string[]) => Promise<void>;
  /** Fire badge hints from interactives (no lesson completion). */
  pingBadges: (hints: string[]) => Promise<void>;
  /** Record the outcome of an arena battle (updates your XP, the bot's XP, and arena stats). */
  recordBattle: (r: Omit<BattleRecord, "at">) => Promise<void>;
  rename: (codename: string) => Promise<boolean>;
  reset: () => Promise<void>;
};

const ProgressCtx = createContext<Ctx | null>(null);

export function useProgress(): Ctx {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}

export const BADGE_ICONS: Record<string, typeof Sparkles> = {
  "first-contact": Sparkles,
  flawless: Target,
  "hot-streak": Flame,
  promptsmith: Wand2,
  "hallucination-hunter": SearchCheck,
  "data-whisperer": BrainCircuit,
  "kit-master": Wrench,
  "team-human": HeartHandshake,
  "triple-threat": Crown,
};

export function BadgeIcon({ id, className }: { id: string; className?: string }) {
  const Icon = BADGE_ICONS[id] ?? Award;
  return <Icon className={className} aria-hidden />;
}

let toastId = 0;

/* ── Local storage layer (replaces /api/progress) ──────────────────── */

const STORAGE_KEY = "neurohigh-progress-v1";

type SavedState = LearnerState & { lastActiveDate: string | null };

function dayKey(d = new Date()) {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function freshState(): SavedState {
  return {
    learner: { codename: randomCodename(), xp: 0, streak: 1 },
    completed: {},
    badges: [],
    leaderboardSeed: newLeaderboardSeed(),
    botXpDeltas: {},
    arena: emptyArenaStats(),
    lastActiveDate: null,
  };
}

function loadSaved(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const fresh = freshState();
      return {
        ...fresh,
        ...parsed,
        learner: { ...fresh.learner, ...(parsed.learner ?? {}) },
        botXpDeltas: parsed.botXpDeltas ?? {},
        arena: { ...fresh.arena, ...(parsed.arena ?? {}) },
      };
    }
  } catch {
    /* corrupted: start fresh */
  }
  return freshState();
}

function persist(s: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage blocked or full */
  }
}

function localStreak(last: string | null, days: number) {
  const today = dayKey();
  if (last === today) return { days, date: today };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return { days: last === dayKey(yesterday) ? days + 1 : 1, date: today };
}

const MODULE_BADGES = {
  foundations: "data-whisperer",
  toolkit: "kit-master",
  ethics: "team-human",
} as const;

function earnedBadges(completed: LearnerState["completed"], hints: string[]): string[] {
  const earned = new Set<string>();
  const slugs = Object.keys(completed);
  if (slugs.length >= 1) earned.add("first-contact");
  if (slugs.some((s) => completed[s].correct === completed[s].total && completed[s].attempts === 1))
    earned.add("flawless");
  if (slugs.some((s) => completed[s].maxCombo >= 5)) earned.add("hot-streak");

  let allModules = true;
  for (const mod of ["foundations", "toolkit", "ethics"] as const) {
    if (lessonsOf(mod).every((l) => completed[l.slug])) earned.add(MODULE_BADGES[mod]);
    else allModules = false;
  }
  if (allModules) earned.add("triple-threat");

  for (const h of hints) if (BADGES.some((b) => b.id === h)) earned.add(h);
  return Array.from(earned);
}

const toBadges = (ids: string[]) =>
  ids.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean) as Badge[];

/* ── Provider ──────────────────────────────────────────────────────── */

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rankUp, setRankUp] = useState<Rank | null>(null);

  const pushToast = useCallback((t: ToastPayload) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-3), { ...t, id } as Toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  // Load saved progress after mount (localStorage doesn't exist during SSR), sync across tabs
  useEffect(() => {
    const s = loadSaved();
    persist(s);
    setState(s);
    setLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(loadSaved());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleAwarded = useCallback(
    (awarded: { xp: number; badges: Badge[]; rankUp: Rank | null; already?: boolean }) => {
      if (awarded.xp > 0) {
        pushToast({ kind: "xp", xp: awarded.xp, title: "XP banked" });
      }
      awarded.badges.forEach((b, i) => {
        window.setTimeout(() => pushToast({ kind: "badge", badge: b }), 450 + i * 400);
      });
      if (awarded.rankUp) {
        window.setTimeout(() => setRankUp(awarded.rankUp), 900 + awarded.badges.length * 400);
      }
    },
    [pushToast],
  );

  const complete = useCallback(
    async (lesson: Lesson, result: QuizResult, hints: string[] = []) => {
      if (result.correct < result.total) return;

      const before = loadSaved();
      const already = !!before.completed[lesson.slug];
      let next: SavedState = before;
      let gained = 0;

      // First clear awards XP; replays give 0 (same rule as the old API)
      if (!already) {
        gained = lessonXp(lesson.xp, result.maxCombo);
        const streak = localStreak(before.lastActiveDate, before.learner.streak);
        next = {
          ...before,
          learner: { ...before.learner, xp: before.learner.xp + gained, streak: streak.days },
          lastActiveDate: streak.date,
          completed: {
            ...before.completed,
            [lesson.slug]: { ...result, at: new Date().toISOString() },
          },
        };
      }

      const newBadges = earnedBadges(next.completed, hints).filter((b) => !next.badges.includes(b));
      next = { ...next, badges: [...next.badges, ...newBadges] };

      persist(next);
      setState(next);

      const oldRank = rankFor(before.learner.xp);
      const newRank = rankFor(next.learner.xp);
      handleAwarded({
        xp: gained,
        already,
        badges: toBadges(newBadges),
        rankUp: newRank.minXp !== oldRank.minXp ? newRank : null,
      });
    },
    [handleAwarded],
  );

  const pingBadges = useCallback(
    async (hints: string[]) => {
      const s = loadSaved();
      const newBadges = earnedBadges(s.completed, hints).filter((b) => !s.badges.includes(b));
      if (newBadges.length === 0) return;
      const next = { ...s, badges: [...s.badges, ...newBadges] };
      persist(next);
      setState(next);
      handleAwarded({ xp: 0, badges: toBadges(newBadges), rankUp: null });
    },
    [handleAwarded],
  );

  const recordBattle = useCallback(
    async (r: Omit<BattleRecord, "at">) => {
      const before = loadSaved();
      const arena = before.arena ?? emptyArenaStats();
      const xp = Math.max(0, before.learner.xp + r.xpDelta);
      const streak = r.won ? arena.streak + 1 : 0;
      const prevDelta = before.botXpDeltas?.[r.opponentId] ?? 0;

      const next: SavedState = {
        ...before,
        learner: { ...before.learner, xp },
        botXpDeltas: { ...(before.botXpDeltas ?? {}), [r.opponentId]: prevDelta + r.opponentDelta },
        arena: {
          wins: arena.wins + (r.won ? 1 : 0),
          losses: arena.losses + (r.won ? 0 : 1),
          streak,
          bestStreak: Math.max(arena.bestStreak, streak),
          history: [{ ...r, at: new Date().toISOString() }, ...(arena.history ?? [])].slice(0, 12),
        },
      };
      persist(next);
      setState(next);

      if (r.won) {
        pushToast({ kind: "xp", xp: r.xpDelta, title: `Defeated ${r.opponentName}` });
      } else {
        pushToast({ kind: "info", title: `${r.xpDelta} XP`, text: `Lost to ${r.opponentName}. Streak reset.` });
      }

      const oldRank = rankFor(before.learner.xp);
      const newRank = rankFor(xp);
      if (newRank.minXp > oldRank.minXp) window.setTimeout(() => setRankUp(newRank), 900);
    },
    [pushToast],
  );

  const rename = useCallback(async (codename: string) => {
    const clean = codename.trim().slice(0, 24);
    if (clean.length < 2) return false;
    const s = loadSaved();
    const next = { ...s, learner: { ...s.learner, codename: clean } };
    persist(next);
    setState(next);
    return true;
  }, []);

  const reset = useCallback(async () => {
    const fresh = freshState(); // includes a new leaderboardSeed → board reshuffles
    persist(fresh);
    setState(fresh);
  }, []);

  const isCompleted = useCallback((slug: string) => !!state?.completed[slug], [state]);
  const completion = useCallback((slug: string) => state?.completed[slug], [state]);

  return (
    <ProgressCtx.Provider
      value={{ state, loading, isCompleted, completion, complete, pingBadges, recordBattle, rename, reset }}
    >
      {children}

      {/* ── Toast stack ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,340px)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 120, opacity: 0, rotate: 2 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="sticker pointer-events-auto flex items-center gap-3 bg-white p-3.5"
              role="status"
            >
              {t.kind === "xp" && (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-sun">
                    <Zap className="size-5 text-ink" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-display text-xl font-extrabold leading-none text-ink">+{t.xp} XP</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink/60">{t.title}</p>
                  </div>
                </>
              )}
              {t.kind === "badge" && (
                <>
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink"
                    style={{ backgroundColor: t.badge.color }}
                  >
                    <BadgeIcon id={t.badge.id} className="size-5 text-ink" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink/50">Badge unlocked</p>
                    <p className="font-display text-base font-extrabold leading-tight text-ink">{t.badge.name}</p>
                    <p className="text-[11px] leading-snug text-ink/60">{t.badge.flavor}</p>
                  </div>
                </>
              )}
              {t.kind === "info" && (
                <div>
                  <p className="font-display text-base font-extrabold text-ink">{t.title}</p>
                  <p className="text-[11px] text-ink/60">{t.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Rank-up ceremony ────────────────────────────────────── */}
      <AnimatePresence>
        {rankUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-5 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Rank up"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -4, y: 40 }}
              animate={{ scale: 1, rotate: -1.5, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="sticker-lg relative w-full max-w-md bg-paper p-8 pt-16 text-center"
            >
              <motion.div
                initial={{ y: -30, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 14 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2"
              >
                <Image
                  src="/img/nova-gold.png"
                  alt="NOVA celebrating with a trophy"
                  width={130}
                  height={130}
                  className="rounded-full border-[3px] border-ink shadow-[4px_4px_0_#171321]"
                  priority
                />
              </motion.div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-coral">Rank up</p>
              <h2 className="mt-1 font-display text-5xl font-extrabold uppercase leading-none tracking-tight text-ink">
                {rankUp.name}
              </h2>
              <p className="mt-3 text-sm text-ink/70">{rankUp.tagline}</p>
              <div className="mx-auto mt-5 h-1.5 w-40 rounded-full bg-gradient-to-r from-vio via-blush to-sun" />
              <button
                onClick={() => setRankUp(null)}
                className="btn btn-primary mx-auto mt-6"
                autoFocus
              >
                <Cpu className="size-4" aria-hidden /> Systems upgraded
              </button>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink/40">
                keep climbing — singularity awaits
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProgressCtx.Provider>
  );
}
