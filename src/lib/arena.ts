// ─── Arena engine: matchmaking, XP math, items, bot brain, question drawing ───

import { rankIndex } from "@/lib/gamification";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { ARENA_BANK, type ArenaQuestion } from "@/content/arena-bank";

export const MAX_HP = 100;
export const MAX_ROUNDS = 10;
export const SHOP_SECONDS = 10;
export const BATTLE_XP_MIN = 50;
export const BATTLE_XP_MAX = 200;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ── Persistent stats ───────────────────────────────────────────── */

export type BattleRecord = {
  opponentId: string;
  opponentName: string;
  won: boolean;
  xpDelta: number;
  opponentDelta: number;
  at: string;
};

export type ArenaStats = {
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  history: BattleRecord[];
};

export const emptyArenaStats = (): ArenaStats => ({
  wins: 0,
  losses: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
});

/* ── Opponents ──────────────────────────────────────────────────── */

export type Opponent = {
  id: string;
  name: string;
  xp: number;
  rankIdx: number;
  /** probability the bot answers a question correctly (0–1) */
  accuracy: number;
  /** probability the bot earns the speed bonus (0–1) */
  speed: number;
  label: "easier" | "even" | "harder";
};

/** Shot clock shrinks as your win streak grows. */
export function questionClock(streak: number): number {
  return Math.max(10, 18 - streak);
}

function toOpponent(e: LeaderboardEntry, yourXp: number, streak: number): Opponent {
  const rankIdx = rankIndex(e.xp);
  const diff = e.xp - yourXp;
  return {
    id: e.id,
    name: e.name,
    xp: e.xp,
    rankIdx,
    accuracy: clamp(0.5 + rankIdx * 0.05 + streak * 0.03, 0.5, 0.92),
    speed: clamp(0.25 + rankIdx * 0.06 + streak * 0.04, 0.25, 0.85),
    label: diff < -80 ? "easier" : diff > 80 ? "harder" : "even",
  };
}

/**
 * Three opponents near your XP. The target shifts upward with your streak,
 * so a long streak pulls in stronger players.
 */
export function findOpponents(board: LeaderboardEntry[], yourXp: number, streak: number): Opponent[] {
  const target = yourXp + streak * 70;
  const pool = board
    .filter((e) => !e.isYou && e.xp > 0)
    .sort((a, b) => Math.abs(a.xp - target) - Math.abs(b.xp - target))
    .slice(0, 18)
    .sort((a, b) => a.xp - b.xp);
  if (pool.length === 0) return [];
  const jitter = () => Math.floor(Math.random() * 3) - 1;
  const at = (f: number) => pool[clamp(Math.round(f * (pool.length - 1)) + jitter(), 0, pool.length - 1)];
  const picks = [at(0.15), at(0.5), at(0.88)];
  const seen = new Set<string>();
  return picks
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .map((p) => toOpponent(p, yourXp, streak));
}

/* ── XP math (win = 50–200, loss = −15 to −60) ──────────────────── */

export function battleXp(yourXp: number, opp: Opponent, won: boolean, yourHp: number, streak: number): number {
  const diff = opp.xp - yourXp;
  if (won) {
    const raw = 95 + clamp(diff / 10, -45, 60) + 8 * Math.min(streak, 6) + Math.round(yourHp / 5);
    return clamp(Math.round(raw), BATTLE_XP_MIN, BATTLE_XP_MAX);
  }
  // Losing to someone stronger costs little; losing to someone weaker costs more.
  return -clamp(Math.round(40 - diff / 15), 15, 60);
}

/** How much the simulated opponent's XP changes on the leaderboard. */
export function opponentDelta(yourDelta: number, won: boolean): number {
  return won ? -Math.round(Math.abs(yourDelta) * 0.4) : Math.min(40, Math.round(Math.abs(yourDelta) * 0.8));
}

/* ── Items ──────────────────────────────────────────────────────── */

export type ItemId = "strike" | "blast" | "repair" | "firewall" | "jam";
export type Item = { id: ItemId; name: string; cost: number; desc: string; color: string };

export const ITEMS: Item[] = [
  { id: "strike", name: "Pulse Strike", cost: 3, desc: "Deal 15 damage", color: "#FF6B4A" },
  { id: "blast", name: "Overclock Blast", cost: 6, desc: "Deal 35 damage", color: "#7B5CFF" },
  { id: "repair", name: "Nano Repair", cost: 4, desc: "Heal 20 HP", color: "#C6F32E" },
  { id: "firewall", name: "Firewall", cost: 3, desc: "Block the next hit", color: "#43D9FF" },
  { id: "jam", name: "Time Jam", cost: 4, desc: "Opponent −30% accuracy next turn", color: "#FFD645" },
];

export const itemById = (id: ItemId) => ITEMS.find((i) => i.id === id)!;
export const ITEM_DAMAGE: Record<ItemId, number> = { strike: 15, blast: 35, repair: 0, firewall: 0, jam: 0 };

/** Simple shop brain for the simulated player. Returns null to bank charge. */
export function botChoose(charge: number, hp: number, enemyShielded: boolean, enemyHp: number): ItemId | null {
  if (hp <= 35 && charge >= 4) return "repair";
  if (enemyShielded && charge >= 3 && charge < 6) return "firewall";
  if (charge >= 6) return enemyHp <= 15 ? "strike" : "blast";
  if (charge >= 4 && Math.random() < 0.3) return "jam";
  if (charge >= 3) return "strike";
  return null;
}

/* ── Question drawing ───────────────────────────────────────────── */

/** Share of tier 1 / 2 / 3 questions, by win streak. */
export function tierWeights(streak: number): [number, number, number] {
  if (streak <= 1) return [0.6, 0.3, 0.1];
  if (streak <= 3) return [0.35, 0.45, 0.2];
  return [0.15, 0.45, 0.4];
}

const FALLBACK_LESSONS = ["not-magic", "learning-from-data"];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q: ArenaQuestion): ArenaQuestion {
  const idx = shuffle(q.options.map((_, i) => i));
  return { ...q, options: idx.map((i) => q.options[i]), answer: idx.indexOf(q.answer) };
}

/** Draw `n` questions from lessons the learner has cleared, weighted by tier. */
export function drawQuestions(completedSlugs: string[], streak: number, n: number): ArenaQuestion[] {
  const done = new Set(completedSlugs);
  let pool = ARENA_BANK.filter((q) => done.has(q.lesson));
  if (pool.length < 12) pool = ARENA_BANK.filter((q) => FALLBACK_LESSONS.includes(q.lesson));

  const byTier: Record<1 | 2 | 3, ArenaQuestion[]> = { 1: [], 2: [], 3: [] };
  for (const q of shuffle(pool)) byTier[q.tier].push(q);

  const w = tierWeights(streak);
  const out: ArenaQuestion[] = [];
  while (out.length < n && (byTier[1].length || byTier[2].length || byTier[3].length)) {
    const r = Math.random();
    let tier: 1 | 2 | 3 = r < w[0] ? 1 : r < w[0] + w[1] ? 2 : 3;
    if (!byTier[tier].length) tier = ([1, 2, 3] as const).find((t) => byTier[t].length)!;
    out.push(shuffleOptions(byTier[tier].pop()!));
  }
  return out;
}

export function poolSize(completedSlugs: string[]): number {
  const done = new Set(completedSlugs);
  const n = ARENA_BANK.filter((q) => done.has(q.lesson)).length;
  return n >= 12 ? n : ARENA_BANK.filter((q) => FALLBACK_LESSONS.includes(q.lesson)).length;
}
