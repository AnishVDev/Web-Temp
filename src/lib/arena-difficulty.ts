import type { ArenaQuestion } from "@/content/arena-bank";
import { RANKS } from "@/lib/gamification";

export type MatchKind = "easier" | "even" | "harder";

export const KIND_OFFSET: Record<MatchKind, -1 | 0 | 1> = {
  easier: -1,
  even: 0,
  harder: 1,
};

export type TierWeights = { 1: number; 2: number; 3: number };

export type MatchProfile = {
  kind: MatchKind;
  /** the player's current rank index */
  userRankIdx: number;
  /** rank the opponent should be drawn from (always a valid RANKS index) */
  opponentRankIdx: number;
  /** 0 = easiest possible match in the game, 1 = hardest */
  difficulty: number;
  /** seconds per question */
  clock: number;
  /** probability of serving a recall / apply / analyze question */
  tierWeights: TierWeights;
  /** chance the bot answers correctly */
  botAccuracy: number;
  /** when the bot answers, as a fraction of the clock (lower = faster) */
  botAnswerAt: number;
  /** chance per turn that the bot uses an item */
  botItemRate: number;
  /** XP multipliers applied on top of the base battle XP */
  xpWinMult: number;
  xpLossMult: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── tuning knobs ─────────────────────────────────────────── */
const CLOCK_EASIEST = 30; // seconds: easier match at the lowest rank
const CLOCK_HARDEST = 10; // seconds: harder match at the top rank
const CLOCK_FLOOR = 7; // never go below this, even with a long streak
const STREAK_CLOCK_CUT_MAX = 3; // a streak can shave at most this many seconds

const BOT_ACC_EASIEST = 0.5;
const BOT_ACC_HARDEST = 0.9;

/**
 * Build the full difficulty profile for a match.
 * Difficulty comes from the *effective* rank (your rank ± 1), so:
 *  - an easier match is exactly one rank below you, a harder one exactly one above
 *  - a harder match at a low rank is still easier than a harder match at a high rank
 */
export function matchProfile(userRankIdx: number, kind: MatchKind, streak = 0): MatchProfile {
  const top = Math.max(1, RANKS.length - 1);
  const user = clamp(userRankIdx, 0, top);
  const effective = user + KIND_OFFSET[kind]; // ranges from -1 to top + 1

  // map [-1, top + 1] → [0, 1]
  const t = clamp((effective + 1) / (top + 2), 0, 1);

  const streakCut = Math.min(STREAK_CLOCK_CUT_MAX, Math.floor(streak / 2));
  const clock = Math.max(CLOCK_FLOOR, Math.round(lerp(CLOCK_EASIEST, CLOCK_HARDEST, t)) - streakCut);

  // tier mix: low difficulty = mostly recall, high difficulty = mostly analyze
  const w1 = lerp(0.7, 0.1, t);
  const w3 = lerp(0.05, 0.6, t);
  const w2 = Math.max(0, 1 - w1 - w3);

  return {
    kind,
    userRankIdx: user,
    opponentRankIdx: clamp(effective, 0, top),
    difficulty: t,
    clock,
    tierWeights: { 1: w1, 2: w2, 3: w3 },
    botAccuracy: lerp(BOT_ACC_EASIEST, BOT_ACC_HARDEST, t),
    botAnswerAt: lerp(0.75, 0.35, t),
    botItemRate: lerp(0.15, 0.6, t),
    xpWinMult: kind === "easier" ? 0.6 : kind === "harder" ? 1.5 : 1,
    xpLossMult: kind === "easier" ? 1.3 : kind === "harder" ? 0.7 : 1,
  };
}

/** All three match profiles for the player's current rank. */
export function matchProfiles(userRankIdx: number, streak = 0): Record<MatchKind, MatchProfile> {
  return {
    easier: matchProfile(userRankIdx, "easier", streak),
    even: matchProfile(userRankIdx, "even", streak),
    harder: matchProfile(userRankIdx, "harder", streak),
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` questions from the unlocked pool using the profile's tier weights.
 * If a tier is empty, its weight is shared among the tiers that still have questions.
 * Questions only repeat when the whole pool has been used.
 */
export function pickMatchQuestions(
  pool: ArenaQuestion[],
  profile: MatchProfile,
  count: number,
  rng: () => number = Math.random,
): ArenaQuestion[] {
  if (pool.length === 0) return [];

  const fresh = (): Record<1 | 2 | 3, ArenaQuestion[]> => ({
    1: shuffle(pool.filter((q) => q.tier === 1), rng),
    2: shuffle(pool.filter((q) => q.tier === 2), rng),
    3: shuffle(pool.filter((q) => q.tier === 3), rng),
  });

  let buckets = fresh();
  const picked: ArenaQuestion[] = [];

  while (picked.length < count) {
    const tiers = ([1, 2, 3] as const).filter((t) => buckets[t].length > 0);
    if (tiers.length === 0) {
      buckets = fresh(); // pool exhausted, allow repeats
      continue;
    }
    const total = tiers.reduce((s, t) => s + profile.tierWeights[t], 0);
    let roll = rng() * (total || 1);
    let chosen = tiers[tiers.length - 1];
    for (const t of tiers) {
      roll -= total ? profile.tierWeights[t] : 1 / tiers.length;
      if (roll <= 0) {
        chosen = t;
        break;
      }
    }
    picked.push(buckets[chosen].pop()!);
  }

  return picked;
}

/** Short UI description of the question mix, e.g. "Mostly recall". */
export function describeMix(w: TierWeights): string {
  if (w[1] >= 0.5) return "Mostly recall";
  if (w[3] >= 0.45) return "Mostly analysis";
  return "Mixed questions";
}
