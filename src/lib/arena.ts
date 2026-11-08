// ─── Arena engine: matchmaking, XP math, items, bot brain, question drawing ───

import { RANKS, rankIndex } from "@/lib/gamification";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { ARENA_BANK, type ArenaQuestion } from "@/content/arena-bank";
import {
  matchProfile,
  pickMatchQuestions,
  type MatchKind,
  type MatchProfile,
} from "@/lib/arena-difficulty";

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
  label: MatchKind;
  profile: MatchProfile;
};

/** Shot clock depends on your current rank, match difficulty, and streak. */
export function questionClock(streak: number, userRankIdx = 0, kind: MatchKind = "even"): number {
  return matchProfile(userRankIdx, kind, streak).clock;
}

const SPARRING_NAMES: Record<MatchKind, string[]> = {
  easier: ["ByteScout", "LoopLearner", "TokenBuddy", "DataSprout"],
  even: ["VectorAce", "PromptCraft", "NodeRunner", "SynthSpark"],
  harder: ["TensorTitan", "ApexGradient", "DeepLayer", "ZeroShotPro"],
};

/** Find a valid [minXp, maxXp] range for a given rank index using rankIndex(). */
function rankXpBounds(targetRank: number): [number, number] {
  let hi = 100;
  while (rankIndex(hi) <= targetRank && hi < 1_000_000) hi *= 2;

  let l = 0;
  let r = hi;
  while (l < r) {
    const m = (l + r) >> 1;
    if (rankIndex(m) >= targetRank) r = m;
    else l = m + 1;
  }
  const minXp = l;

  l = minXp;
  r = hi;
  while (l < r) {
    const m = (l + r) >> 1;
    if (rankIndex(m) > targetRank) r = m;
    else l = m + 1;
  }
  const maxXp = l > minXp && rankIndex(l) > targetRank ? l - 1 : minXp + 400;
  return [minXp, maxXp];
}

function buildOpponent(
  id: string,
  name: string,
  xp: number,
  rankIdx: number,
  profile: MatchProfile,
): Opponent {
  return {
    id,
    name,
    xp,
    rankIdx,
    accuracy: Number(profile.botAccuracy.toFixed(2)),
    speed: clamp(1 - profile.botAnswerAt, 0.2, 0.85),
    label: profile.kind,
    profile,
  };
}

/**
 * Always returns up to 3 opponents:
 *  - easier: 1 rank below you (or lower XP at rank 0)
 *  - even:   your current rank
 *  - harder: 1 rank above you (or higher XP at top rank)
 */
export function findOpponents(board: LeaderboardEntry[], yourXp: number, streak: number): Opponent[] {
  const userRankIdx = rankIndex(yourXp);
  const topRank = Math.max(0, RANKS.length - 1);
  const usedIds = new Set<string>();
  const usedNames = new Set(board.map((e) => e.name));
  const candidates = board.filter((e) => !e.isYou && e.xp >= 0);

  const pickRandomTop = (list: LeaderboardEntry[], cap = 5) => {
    const slice = list.slice(0, Math.min(cap, list.length));
    return slice[Math.floor(Math.random() * slice.length)];
  };

  return (["easier", "even", "harder"] as const).map((kind) => {
    const profile = matchProfile(userRankIdx, kind, streak);
    const targetRank = profile.opponentRankIdx;

    let pool = candidates.filter((e) => !usedIds.has(e.id) && rankIndex(e.xp) === targetRank);

    if (kind === "easier") {
      if (userRankIdx === 0) {
        const below = pool.filter((e) => e.xp <= yourXp);
        if (below.length) pool = below;
      }
      // Prefer opponents near the upper/middle of the lower rank (or lowest XP at rank 0)
      pool.sort((a, b) => (userRankIdx === 0 ? a.xp - b.xp : Math.abs(a.xp - yourXp) - Math.abs(b.xp - yourXp)));
    } else if (kind === "even") {
      pool.sort((a, b) => Math.abs(a.xp - yourXp) - Math.abs(b.xp - yourXp));
    } else {
      if (userRankIdx === topRank) {
        const above = pool.filter((e) => e.xp >= yourXp);
        if (above.length) pool = above;
      }
      pool.sort((a, b) => (userRankIdx === topRank ? b.xp - a.xp : Math.abs(a.xp - yourXp) - Math.abs(b.xp - yourXp)));
    }

    if (pool.length > 0) {
      const chosen = pickRandomTop(pool);
      usedIds.add(chosen.id);
      return buildOpponent(chosen.id, chosen.name, chosen.xp, targetRank, profile);
    }

    // Fallback sparring bot in the exact target rank if no leaderboard bot sits in that rank
    const [minXp, maxXp] = rankXpBounds(targetRank);
    let botXp = Math.round(minXp + (maxXp - minXp) * (0.25 + Math.random() * 0.5));
    if (kind === "easier" && userRankIdx === 0) {
      botXp = Math.max(0, Math.min(yourXp, Math.round(yourXp * 0.7)));
    } else if (kind === "harder" && userRankIdx === topRank) {
      botXp = Math.max(minXp, yourXp + 80);
    }

    const names = SPARRING_NAMES[kind].filter((n) => !usedNames.has(n));
    const name = names.length
      ? names[Math.floor(Math.random() * names.length)]
      : `${SPARRING_NAMES[kind][0]}-${Math.floor(10 + Math.random() * 89)}`;
    usedNames.add(name);
    const id = `sparring-${kind}-${targetRank}`;
    usedIds.add(id);

    return buildOpponent(id, name, botXp, targetRank, profile);
  });
}

/* ── XP math (win = 50–200, loss = −15 to −60) ──────────────────── */

export function battleXp(yourXp: number, opp: Opponent, won: boolean, yourHp: number, streak: number): number {
  const profile = opp.profile ?? matchProfile(rankIndex(yourXp), opp.label, streak);
  const diff = opp.xp - yourXp;
  if (won) {
    const raw = (95 + clamp(diff / 15, -25, 35) + 7 * Math.min(streak, 6) + Math.round(yourHp / 6)) * profile.xpWinMult;
    return clamp(Math.round(raw), BATTLE_XP_MIN, BATTLE_XP_MAX);
  }
  const rawLoss = (38 - clamp(diff / 25, -15, 15)) * profile.xpLossMult;
  return -clamp(Math.round(rawLoss), 15, 60);
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

/** Share of tier 1 / 2 / 3 questions, by rank, match difficulty, and streak. */
export function tierWeights(streak: number, userRankIdx = 0, kind: MatchKind = "even"): [number, number, number] {
  const w = matchProfile(userRankIdx, kind, streak).tierWeights;
  return [w[1], w[2], w[3]];
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

/** Draw `n` questions from lessons the learner has cleared, scaled by rank & match difficulty. */
export function drawQuestions(
  completedSlugs: string[],
  streak: number,
  n: number,
  userRankIdx = 0,
  kind: MatchKind = "even",
): ArenaQuestion[] {
  const done = new Set(completedSlugs);
  let pool = ARENA_BANK.filter((q) => done.has(q.lesson));
  if (pool.length < 12) pool = ARENA_BANK.filter((q) => FALLBACK_LESSONS.includes(q.lesson));

  const profile = matchProfile(userRankIdx, kind, streak);
  return pickMatchQuestions(pool, profile, n).map(shuffleOptions);
}

export function poolSize(completedSlugs: string[]): number {
  const done = new Set(completedSlugs);
  const n = ARENA_BANK.filter((q) => done.has(q.lesson)).length;
  return n >= 12 ? n : ARENA_BANK.filter((q) => FALLBACK_LESSONS.includes(q.lesson)).length;
}
