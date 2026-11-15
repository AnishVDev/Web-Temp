// ─── Gamification engine: ranks, badges, XP math (shared client/server) ─────

export type Rank = {
  name: string;
  minXp: number;
  tagline: string;
  /** Background color of the rank's icon tile */
  color: string;
  /** Color of the built-in fallback icon drawn on the tile */
  iconColor: string;
  /** Custom artwork path — files live in /public/images/ranks/ */
  image: string;
};

/**
 * Flip to true once all eight rank images exist in /public/images/ranks/.
 * While false, each rank uses its own built-in icon instead.
 */
export const USE_RANK_IMAGES = false;

export const RANKS: Rank[] = [
  { name: "Newcomer", minXp: 0, tagline: "Everyone starts somewhere. Glad you're here.", color: "#EEE8FF", iconColor: "#171321", image: "/images/ranks/newcomer.png" },
  { name: "Explorer", minXp: 150, tagline: "You've started asking how this stuff actually works.", color: "#43D9FF", iconColor: "#171321", image: "/images/ranks/explorer.png" },
  { name: "Apprentice", minXp: 420, tagline: "Less \"what even is AI?\", more \"oh, I can use this.\"", color: "#C6F32E", iconColor: "#171321", image: "/images/ranks/apprentice.png" },
  { name: "Practitioner", minXp: 760, tagline: "You're getting real work done with it now.", color: "#FFD645", iconColor: "#171321", image: "/images/ranks/practitioner.png" },
  { name: "Specialist", minXp: 1150, tagline: "You know where AI shines and where it'll let you down.", color: "#FF8BD1", iconColor: "#171321", image: "/images/ranks/specialist.png" },
  { name: "Strategist", minXp: 1600, tagline: "You decide where AI belongs, not just how to use it.", color: "#FF6B4A", iconColor: "#171321", image: "/images/ranks/strategist.png" },
  { name: "Expert", minXp: 2150, tagline: "The person people turn to when AI gets confusing.", color: "#7B5CFF", iconColor: "#FFFFFF", image: "/images/ranks/expert.png" },
  { name: "Master", minXp: 2800, tagline: "You use it well, question it often, and keep people first.", color: "#171321", iconColor: "#FFD645", image: "/images/ranks/master.png" },
];

export function rankFor(xp: number): Rank {
  let r = RANKS[0];
  for (const rank of RANKS) if (xp >= rank.minXp) r = rank;
  return r;
}

export function nextRank(xp: number): Rank | null {
  for (const rank of RANKS) if (xp < rank.minXp) return rank;
  return null;
}

export function rankIndex(xp: number): number {
  let i = 0;
  RANKS.forEach((r, idx) => {
    if (xp >= r.minXp) i = idx;
  });
  return i;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export type BadgeId =
  | "first-contact"
  | "flawless"
  | "hot-streak"
  | "promptsmith"
  | "hallucination-hunter"
  | "data-whisperer"
  | "kit-master"
  | "team-human"
  | "triple-threat";

export type Badge = {
  id: BadgeId;
  name: string;
  flavor: string;
  how: string;
  color: string;
};

export const BADGES: Badge[] = [
  { id: "first-contact", name: "First Steps", flavor: "Lesson one, done. The hardest part is behind you.", how: "Finish your very first lesson.", color: "#7B5CFF" },
  { id: "flawless", name: "Nailed It", flavor: "Not a single miss. A little smugness is allowed.", how: "Get every checkpoint question right with zero misses.", color: "#43D9FF" },
  { id: "hot-streak", name: "On a Roll", flavor: "Five boss answers in a row, and you didn't even flinch.", how: "Answer 5 boss questions correctly in a row.", color: "#FF6B4A" },
  { id: "promptsmith", name: "Prompt Pro", flavor: "Clear ask, great answer. The Forge approved.", how: "Build a prompt that scores 90 or higher.", color: "#C6F32E" },
  { id: "hallucination-hunter", name: "Hallucination Hunter", flavor: "You spotted every made-up fact and never cried wolf.", how: "Flag all five fakes in the Source Check lab without flagging a real one.", color: "#FFD645" },
  { id: "data-whisperer", name: "Under the Hood", flavor: "You've seen how the machine actually thinks. Mostly.", how: "Complete every mission in Module 01.", color: "#7B5CFF" },
  { id: "kit-master", name: "Toolbox Ready", flavor: "You know which tool to grab, and when to put it down.", how: "Complete every mission in Module 02.", color: "#43D9FF" },
  { id: "team-human", name: "Good Judgment", flavor: "AI drafts, you decide. You know where the line is.", how: "Complete every mission in Module 03.", color: "#FF6B4A" },
  { id: "triple-threat", name: "Graduate", flavor: "All three modules done. You've earned the bragging rights.", how: "Complete all three modules.", color: "#FF8BD1" },
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);

// ─── XP math ─────────────────────────────────────────────────────────────────

/** Combo bonus: +12 XP per combo step, capped at 5 steps (+60). */
export function comboBonus(maxCombo: number): number {
  return Math.min(Math.max(maxCombo, 0), 5) * 12;
}

export function lessonXp(base: number, maxCombo: number): number {
  return base + comboBonus(maxCombo);
}

// ─── Codename generator ──────────────────────────────────────────────────────

const CODE_ADJ = [
  "Neon", "Quantum", "Turbo", "Pixel", "Hyper", "Glitch", "Astro", "Cyber",
  "Voltage", "Midnight", "Solar", "Static", "Cosmic", "Rogue", "Chrome", "Vivid",
];
const CODE_NOUN = [
  "Falcon", "Badger", "Lynx", "Otter", "Cobra", "Raven", "Fox", "Mantis",
  "Kraken", "Comet", "Viper", "Panda", "Wolf", "Hawk", "Gecko", "Orca",
];

export function randomCodename(): string {
  const a = CODE_ADJ[Math.floor(Math.random() * CODE_ADJ.length)];
  const n = CODE_NOUN[Math.floor(Math.random() * CODE_NOUN.length)];
  return `${a} ${n}`;
}

// ─── Streak math ─────────────────────────────────────────────────────────────

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function bumpStreak(lastDate: string, current: number): { days: number; date: string } {
  const today = todayKey();
  if (lastDate === today) return { days: Math.max(current, 1), date: today };
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  if (lastDate === yesterday) return { days: current + 1, date: today };
  return { days: 1, date: today };
}
