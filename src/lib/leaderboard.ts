// ─── Simulated leaderboard ──────────────────────────────────────────────────
// 499 simulated players + the real learner = 500 entries.
// • Usernames are fixed for everyone (generated once from a constant seed).
// • XP and placement come from the learner's leaderboardSeed, so the board
//   stays the same across refreshes and reshuffles only when progress resets.
// • Players are spread across every rank, so there are always people at the
//   top, bottom, and in between.

import { MAX_XP } from "@/content";
import { BADGES, RANKS, rankFor, rankIndex, type Rank } from "@/lib/gamification";

export const LEADERBOARD_SIZE = 500;
const BOT_COUNT = LEADERBOARD_SIZE - 1;
const NAME_SEED = 90210; // constant → usernames never change

/** Highest XP a simulated player can have (a "perfect run"). */
const TOP_XP = Math.max(MAX_XP, RANKS[RANKS.length - 1].minXp + 250);

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  badges: number;
  isYou: boolean;
  position: number;
  rank: Rank;
  rankIdx: number;
};

export type BoardRow =
  | { kind: "entry"; entry: LeaderboardEntry }
  | { kind: "gap"; key: string; hidden: number };

type Bot = { id: string; name: string; xp: number; badges: number };
type Rng = () => number;

// ─── Seeded random numbers ───────────────────────────────────────────────────

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Called by ProgressProvider when a fresh save is created or progress is reset. */
export function newLeaderboardSeed(): number {
  return Math.floor(Math.random() * 2147483646) + 1;
}

// ─── Usernames (fixed for everyone) ──────────────────────────────────────────

const HANDPICKED = [
  "brookeyy", "notjustin", "kenzie.w", "lowkeylucas", "jaydenthegoat", "mattyice",
  "ricebowl22", "not_a_robot", "quizwhiz", "mathlete.maya", "bio.nerd", "studymode",
  "sleepdeprived", "lateforclass", "coffeeandcalc", "josh.exe", "ctrl_alt_defeat",
  "bytebrooke", "pixelpusher", "lilnugget", "bigmikeyy", "tacotuesday", "frootloop",
  "pancake.queen", "volleyballvee", "hoopdreams23", "goalie_gabe", "drumline.dev",
  "bandkid4life", "theaterkidtess", "artsy.aria", "chemlab.chris", "physicsphil",
  "calc.cat", "apush_survivor", "stargazer.sky", "moonlight_mia", "sunflowerzoe",
  "oceaneyes.em", "forest.finn", "rainyday.ruby", "snowday.sam", "frog.enjoyer",
  "duckduckgoose", "certified.nerd", "wifi.warrior", "promptpilot", "tokentheo",
  "gradient.grace", "neuralnina", "debugdiego", "loopylogan", "bitbybit", "justvibing",
  "nap.queen", "lemonade.lily", "matcha.mei", "boba.ben", "dumpling.kenji",
  "hotcheeto.hugo", "gummybear.gia", "mintychip", "pb_and_jada", "choco.chloe",
  "trackstar.tay", "swimteam.sophie", "robotics.rohan", "debate.devin", "chesswiz.omar",
  "lofi.luna", "anime.andre", "kpop.kayla", "ramen.ryan", "bagel.bri", "cozy.carter",
  "quiet.quinn", "sk8r.sam", "ok.avery", "yesitsnoah", "benchwarmer.ben",
];

const FIRST = [
  "maya", "jake", "sofia", "liam", "ava", "noah", "emma", "ethan", "olivia", "lucas",
  "mia", "aiden", "chloe", "mason", "zoe", "caleb", "lily", "owen", "grace", "jayden",
  "harper", "eli", "nora", "logan", "ella", "carter", "riley", "isaac", "aria", "dylan",
  "layla", "gavin", "ruby", "miles", "hazel", "leo", "stella", "kai", "maddie", "tyler",
  "brooke", "diego", "priya", "omar", "mei", "jamal", "aaliyah", "nico", "sana", "mateo",
  "kenji", "amara", "rohan", "yara", "andre", "lena", "marcus", "jada", "theo", "camila",
  "jordan", "sam", "alex", "quinn", "avery", "sky", "malik", "nina", "ben", "tessa",
  "javi", "ana", "ryan", "kayla", "finn", "ivy", "hugo", "elena", "devin", "luna",
];

const LAST = [
  "reyes", "patel", "nguyen", "kim", "garcia", "smith", "chen", "lopez", "brooks", "rivera",
  "walker", "ali", "park", "singh", "murphy", "cruz", "bennett", "ortiz", "hayes", "diaz",
  "tran", "price", "flores", "morgan", "shah", "bell", "ramos", "ward", "khan", "foster",
];

const HOBBIES = [
  "hoops", "soccer", "volley", "swim", "band", "art", "chess", "track", "skate", "guitar",
  "drums", "theater", "robotics", "debate", "tennis", "cheer", "golf", "piano", "film", "lax",
];

const VERBS = [
  "codes", "plays", "draws", "reads", "writes", "bakes", "skates", "sings", "runs",
  "builds", "games", "edits", "films", "studies",
];

const ADJ = [
  "sleepy", "sunny", "lucky", "cozy", "sneaky", "fuzzy", "chill", "frosty", "spicy", "tiny",
  "mighty", "quiet", "lazy", "happy", "crispy", "salty", "bouncy", "cloudy", "golden", "dizzy",
];

const NOUNS = [
  "panda", "otter", "waffle", "pickle", "noodle", "cactus", "penguin", "taco", "mango", "bagel",
  "koala", "toast", "moose", "llama", "dino", "bean", "frog", "duck", "boba", "matcha",
  "nugget", "sushi", "pancake", "tater", "muffin",
];

function pick<T>(arr: readonly T[], r: Rng): T {
  return arr[Math.floor(r() * arr.length)];
}
const gradYear = (r: Rng) => String(7 + Math.floor(r() * 5)).padStart(2, "0"); // 07–11
const smallNum = (r: Rng) => String(1 + Math.floor(r() * 99));

// Repeated patterns show up more often, like they would on a real platform.
const PATTERNS: Array<(r: Rng) => string> = [
  (r) => `${pick(FIRST, r)}${gradYear(r)}`,
  (r) => `${pick(FIRST, r)}${gradYear(r)}`,
  (r) => `${pick(FIRST, r)}_${pick(LAST, r)[0]}`,
  (r) => `${pick(FIRST, r)}.${pick(LAST, r)}`,
  (r) => `${pick(FIRST, r)}.${pick(LAST, r)}`,
  (r) => `${pick(FIRST, r)}${pick(VERBS, r)}`,
  (r) => `its${pick(FIRST, r)}`,
  (r) => `real${pick(FIRST, r)}`,
  (r) => `${pick(ADJ, r)}${pick(NOUNS, r)}${smallNum(r)}`,
  (r) => `${pick(ADJ, r)}${pick(NOUNS, r)}`,
  (r) => `${pick(ADJ, r)}_${pick(NOUNS, r)}`,
  (r) => `${pick(FIRST, r)}_${pick(HOBBIES, r)}`,
  (r) => `${pick(HOBBIES, r)}${pick(FIRST, r)}`,
  (r) => `${pick(FIRST, r)}${pick(LAST, r)[0]}${smallNum(r)}`,
  (r) => {
    const f = pick(FIRST, r);
    return `${f}${f[f.length - 1]}${r() < 0.5 ? "" : "_"}`;
  },
  (r) => `${pick(NOUNS, r)}.${pick(FIRST, r)}`,
  (r) => `${pick(FIRST, r)}.${pick(HOBBIES, r)}${smallNum(r)}`,
  (r) => `x${pick(FIRST, r)}x`,
];

let NAMES: string[] | null = null;

function allNames(): string[] {
  if (NAMES) return NAMES;
  const rng = mulberry32(NAME_SEED);
  const names = new Set<string>(HANDPICKED);
  let guard = 0;
  while (names.size < BOT_COUNT && guard < 50000) {
    guard++;
    const name = pick(PATTERNS, rng)(rng);
    if (name.length >= 4 && name.length <= 18) names.add(name);
  }
  NAMES = Array.from(names).slice(0, BOT_COUNT);
  return NAMES;
}

// ─── Simulated players (depend on the seed) ──────────────────────────────────

/** Share of players in each rank, Bootloader → Singularity. Jittered per seed. */
const BASE_WEIGHTS = [0.18, 0.16, 0.15, 0.14, 0.12, 0.1, 0.08, 0.07];
const MIN_PER_RANK = 6;

function estimateBadges(xp: number, rng: Rng): number {
  if (xp === 0) return 0;
  if (xp >= TOP_XP) return BADGES.length;
  const est = 1 + Math.round((xp / TOP_XP) * (BADGES.length - 1));
  const jitter = Math.floor(rng() * 3) - 1;
  return Math.min(BADGES.length, Math.max(1, est + jitter));
}

function generateBots(seed: number): Bot[] {
  const rng = mulberry32(seed);
  const names = allNames();

  // 1. How many players land in each rank
  const jittered = BASE_WEIGHTS.map((w) => w * (0.7 + rng() * 0.6));
  const weightSum = jittered.reduce((s, w) => s + w, 0);
  const counts = jittered.map((w) =>
    Math.max(MIN_PER_RANK, Math.round((w / weightSum) * BOT_COUNT)),
  );
  let diff = BOT_COUNT - counts.reduce((s, c) => s + c, 0);
  while (diff !== 0) {
    const i = Math.floor(rng() * counts.length);
    if (diff > 0) {
      counts[i]++;
      diff--;
    } else if (counts[i] > MIN_PER_RANK) {
      counts[i]--;
      diff++;
    }
  }

  // 2. XP within each rank's range
  const xps: number[] = [];
  counts.forEach((count, tier) => {
    const lo = tier === 0 ? 40 : RANKS[tier].minXp;
    const hi = tier < RANKS.length - 1 ? RANKS[tier + 1].minXp - 1 : TOP_XP;
    for (let k = 0; k < count; k++) {
      if (tier === 0 && rng() < 0.3) {
        xps.push(0); // signed up, hasn't finished a lesson yet
        continue;
      }
      // Singularity is skewed so only a few players sit near the max
      const t = tier === RANKS.length - 1 ? Math.pow(rng(), 1.8) : rng();
      xps.push(Math.round(lo + t * (hi - lo)));
    }
  });

  // 3. One to three players with a perfect run
  xps.sort((a, b) => b - a);
  const perfect = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < perfect; i++) xps[i] = TOP_XP;

  // 4. Shuffle which name gets which score
  const order = names.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return xps
    .map((xp, i) => {
      const ni = order[i % order.length];
      return { id: `p${ni}`, name: names[ni], xp, badges: estimateBadges(xp, rng) };
    })
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
}

const botCache = new Map<number, Bot[]>();

function botsFor(seed: number): Bot[] {
  const cached = botCache.get(seed);
  if (cached) return cached;
  if (botCache.size > 4) botCache.clear();
  const bots = generateBots(seed);
  botCache.set(seed, bots);
  return bots;
}

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Full 500-entry board, sorted, with the learner inserted by XP (ties go to the learner). */
/** Full 500-entry board, sorted, with the learner inserted by XP (ties go to the learner).
 *  `deltas` are XP changes to simulated players from arena battles. */
export function buildLeaderboard(seed: number, you: { name: string; xp: number; badges: number }, deltas: Record<string, number> = {}): LeaderboardEntry[] {
  let bots = botsFor(seed);
  if (Object.keys(deltas).length) {
    bots = bots
      .map((b) => (deltas[b.id] ? { ...b, xp: Math.max(0, b.xp + deltas[b.id]) } : b))
      .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  }

  let at = bots.findIndex((b) => b.xp <= you.xp);
  if (at === -1) at = bots.length;

  const me: Bot = { id: "you", name: you.name, xp: you.xp, badges: you.badges };
  const merged = [...bots.slice(0, at), me, ...bots.slice(at)];

  return merged.map((e, i) => ({
    ...e,
    isYou: e.id === "you",
    position: i + 1,
    rank: rankFor(e.xp),
    rankIdx: rankIndex(e.xp),
  }));
}

/** A fixed-size window centered on the learner (shifts at the top and bottom edges). */
export function windowAround(list: LeaderboardEntry[], radius = 2): LeaderboardEntry[] {
  const you = list.findIndex((e) => e.isYou);
  if (you === -1) return [];
  const size = Math.min(list.length, radius * 2 + 1);
  const start = Math.max(0, Math.min(you - radius, list.length - size));
  return list.slice(start, start + size);
}

/** Top players, players around the learner, and the bottom few, with "…" gaps between. */
export function condensedRows(
  list: LeaderboardEntry[],
  { top = 10, radius = 4, bottom = 3 } = {},
): BoardRow[] {
  const you = list.findIndex((e) => e.isYou);
  const keep = new Set<number>();
  for (let i = 0; i < Math.min(top, list.length); i++) keep.add(i);
  for (let i = you - radius; i <= you + radius; i++) if (i >= 0 && i < list.length) keep.add(i);
  for (let i = Math.max(0, list.length - bottom); i < list.length; i++) keep.add(i);

  const sorted = Array.from(keep).sort((a, b) => a - b);
  const rows: BoardRow[] = [];
  let prev = -1;
  for (const i of sorted) {
    const skipped = i - prev - 1;
    if (skipped === 1) rows.push({ kind: "entry", entry: list[prev + 1] });
    else if (skipped > 1) rows.push({ kind: "gap", key: `gap-${prev}-${i}`, hidden: skipped });
    rows.push({ kind: "entry", entry: list[i] });
    prev = i;
  }
  return rows;
}

export function topPercent(position: number, total = LEADERBOARD_SIZE): number {
  return Math.max(1, Math.ceil((position / total) * 100));
}

/** The player directly above the learner and how much XP it takes to pass them. */
export function chaseTarget(list: LeaderboardEntry[], you: LeaderboardEntry | undefined) {
  if (!you || you.position <= 1) return null;
  const above = list[you.position - 2];
  return { name: above.name, xpNeeded: above.xp - you.xp };
}
