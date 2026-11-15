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
  { name: "Rookie", minXp: 0, tagline: "Day one. Time to see how this actually works.", color: "#EEE8FF", iconColor: "#171321", image: "/images/ranks/rookie.png" },
  { name: "Explorer", minXp: 150, tagline: "Getting your bearings and asking smarter questions.", color: "#43D9FF", iconColor: "#171321", image: "/images/ranks/explorer.png" },
  { name: "Tinkerer", minXp: 420, tagline: "Testing ideas, tweaking prompts, and learning by doing.", color: "#C6F32E", iconColor: "#171321", image: "/images/ranks/tinkerer.png" },
  { name: "Power User", minXp: 760, tagline: "Less guesswork, way better results. You've got the hang of this.", color: "#FFD645", iconColor: "#171321", image: "/images/ranks/power-user.png" },
  { name: "Builder", minXp: 1150, tagline: "Turning rough ideas and workflows into real, useful work.", color: "#FF8BD1", iconColor: "#171321", image: "/images/ranks/builder.png" },
  { name: "Strategist", minXp: 1600, tagline: "You know when to lean on AI and when to step in yourself.", color: "#FF6B4A", iconColor: "#171321", image: "/images/ranks/strategist.png" },
  { name: "Mentor", minXp: 2150, tagline: "The go-to person when someone's prompt goes sideways.", color: "#7B5CFF", iconColor: "#FFFFFF", image: "/images/ranks/mentor.png" },
  { name: "Master", minXp: 2800, tagline: "You know this tech inside and out, and your own brain still calls the shots.", color: "#171321", iconColor: "#FFD645", image: "/images/ranks/master.png" },
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
  { id: "first-contact", name: "Off and Running", flavor: "One lesson down. You're officially on your way.", how: "Finish your very first lesson.", color: "#7B5CFF" },
  { id: "flawless", name: "Clean Sweep", flavor: "Not a single miss. You nailed that checkpoint on the first try.", how: "Get every checkpoint question right with zero mistakes.", color: "#43D9FF" },
  { id: "hot-streak", name: "Hot Streak", flavor: "Five right answers in a row under pressure. Didn't even blink.", how: "Answer 5 boss fight questions correctly in a row.", color: "#FF6B4A" },
  { id: "promptsmith", name: "Prompt Pro", flavor: "Clear, specific, and on target. You know how to ask for what you want.", how: "Write a prompt in the Prompt Forge that scores 90 or higher.", color: "#C6F32E" },
  { id: "hallucination-hunter", name: "Reality Check", flavor: "AI tried to bluff you with made-up facts, and you caught every single one.", how: "Flag all five fake facts in the Source Check lab without flagging a real one.", color: "#FFD645" },
  { id: "data-whisperer", name: "Under the Hood", flavor: "You looked past the hype and learned what makes AI tick.", how: "Complete every mission in Module 01: Inside the Machine.", color: "#7B5CFF" },
  { id: "kit-master", name: "Well Equipped", flavor: "You've explored the toolkit and know what to reach for.", how: "Complete every mission in Module 02: The Toolkit.", color: "#43D9FF" },
  { id: "team-human", name: "Team Human", flavor: "Smart tech still needs human judgment. You keep people front and center.", how: "Complete every mission in Module 03: Human in the Loop.", color: "#FF6B4A" },
  { id: "triple-threat", name: "The Full Picture", flavor: "All three modules done and dusted. You've got the skills and instincts to match.", how: "Complete every mission across all three modules.", color: "#FF8BD1" },
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
