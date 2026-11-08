import Image from "next/image";
import Link from "next/link";
import { Bot, BrainCircuit, Compass, Gamepad2, GraduationCap, Trophy, Wrench } from "lucide-react";
import NeuralCanvas from "@/components/NeuralCanvas";
import Marquee from "@/components/Marquee";
import ModuleCard from "@/components/ModuleCard";
import StartCta from "@/components/StartCta";
import { LeaderboardPreview } from "@/components/Leaderboard";
import { MODULES, MAX_XP, TOTAL_LESSONS } from "@/content";

const PILLARS = [
  {
    icon: BrainCircuit,
    color: "#7B5CFF",
    num: "01",
    title: "Understand the basics",
    text: "Learn the core ideas behind AI: data, patterns, and prediction. Once you can explain how these systems work, it's easier to judge what they can and can't do.",
  },
  {
    icon: Wrench,
    color: "#0EA8CC",
    num: "02",
    title: "Use it effectively",
    text: "Learn how to write clear prompts, improve results over several attempts, check answers for accuracy, and use AI to support your studying without replacing your own thinking.",
  },
  {
    icon: Compass,
    color: "#F0503C",
    num: "03",
    title: "Use it responsibly",
    text: "Think through questions about academic integrity, bias, deepfakes, and personal data. AI can produce writing and images that look convincing even when they're wrong, so knowing how to evaluate them matters.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section>
        <NeuralCanvas className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:pb-20 lg:pt-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-sun text-ink">AI literacy · grades 9-12</span>
              <span className="chip bg-white text-ink/70">free · no account needed</span>
            </div>
            <h1 className="mt-5 font-display text-[clamp(2.9rem,7.5vw,5.6rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
              AI is built on
              <br />
              <span className="text-outline">math</span>
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">you can learn.</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-[0.45em] -rotate-1 bg-lime" aria-hidden />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink/75">
              In this course, you'll learn how AI systems work, how to use them
              effectively, and how to use them responsibly. Every lesson includes a
              hands-on activity and a short quiz. As you finish lessons,{" "}
              <strong className="text-ink">
                you earn XP, unlock badges, and move up the ranks.
              </strong>
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <StartCta className="btn btn-primary !px-7 !py-3.5 !text-sm" />
              <Link href="#modules" className="btn btn-ghost !px-7 !py-3.5 !text-sm">
                Browse the modules
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {[
                [`${TOTAL_LESSONS}`, "lessons + 3 module challenges"],
                [`${MAX_XP.toLocaleString()}`, "XP available from lessons"],
                ["9", "badges to earn"],
                ["~90", "estimated minutes"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-extrabold text-ink">{v}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/55">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NOVA */}
          <div className="relative mx-auto w-fit">
            <div className="absolute -left-6 top-2 z-10 hidden max-w-[190px] -rotate-3 rounded-2xl border-2 border-ink bg-white p-3 font-mono text-[11px] font-bold leading-snug text-ink shadow-[3px_3px_0_#171321] sm:block lg:-left-8">
              Your first lesson takes about 6 minutes. Ready when you are.
              <span className="absolute -right-1.5 top-8 size-3 rotate-45 border-b-2 border-r-2 border-ink bg-white" />
            </div>
            <Image
              src="/img/nova-bot.png"
              alt="NOVA, your course guide, waving hello"
              width={360}
              height={360}
              priority
              className="animate-float w-56 rounded-[2rem] border-[3px] border-ink bg-white shadow-[8px_8px_0_#171321] sm:w-64 lg:w-[360px]"
            />
            <p className="mt-4 rotate-1 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink/45">
              NOVA · your course guide
            </p>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ─── PILLARS ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-coral">What you'll learn</p>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
          Three skills for using AI well
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/70">
          Many adults are still figuring out how AI works and how to use it. This course covers the
          technology, practical methods for using it, and the ethical questions that come with it.
        </p>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.num} className="sticker-lg group relative bg-white p-6 pt-8 transition-transform hover:-translate-y-1.5">
              <span
                className="absolute -top-4 left-5 grid size-11 place-items-center rounded-xl border-2 border-ink shadow-[3px_3px_0_#171321]"
                style={{ backgroundColor: p.color }}
              >
                <p.icon className="size-5 text-white" strokeWidth={2.3} />
              </span>
              <p className="absolute right-5 top-4 font-display text-4xl font-extrabold text-ink/10">{p.num}</p>
              <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MODULES ──────────────────────────────────────────── */}
      <section className="border-y-2 border-ink bg-white py-16 lg:py-20">
        <div id="modules" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-vio">The curriculum</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Three modules, each with practice
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink/65">
              Each lesson includes a hands-on activity and a short quiz. Every module ends with a
              challenge that reviews what you learned. Complete the modules in order, since each one
              builds on the last.
            </p>
          </div>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {MODULES.map((m, i) => (
              <ModuleCard key={m.slug} mod={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE GAME ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-aqua-deep">How progress works</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-ink sm:text-5xl">
              Your progress <span className="text-vio">builds</span> a neural network
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
              Instead of a standard progress bar, your progress is shown as a neural network. Each
              lesson you complete activates a neuron, and finishing a module lights up a full layer.
              When you complete the course, the whole network is active, showing the concepts you've
              learned. You can see your full network on your dashboard.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                [Gamepad2, "Streaks earn bonus XP", "Answer several questions correctly in a row during a challenge to multiply your points."],
                [Bot, "Badges as you go", "You earn badges by finishing activities and quizzes. NOVA lets you know as soon as you earn one."],
                [GraduationCap, "Ranks show your growth", "Earn XP to move up eight ranks, from Bootloader to Singularity."],
                [Trophy, "See where you stand", "Your XP places you on a simulated leaderboard of 500 players. Reset your progress and the board reshuffles."],
              ].map(([Icon, t, d]) => (
                <li key={String(t)} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-sun shadow-[2.5px_2.5px_0_#171321]">
                    <Icon className="size-4.5 text-ink" strokeWidth={2.4} />
                  </span>
                  <span>
                    <strong className="block font-display text-sm font-extrabold text-ink">{String(t)}</strong>
                    <span className="block text-[13px] leading-relaxed text-ink/65">{String(d)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <StartCta className="btn btn-violet !px-6 !py-3 !text-xs" small />
              <Link href="/dashboard" className="btn btn-ghost !px-6 !py-3 !text-xs">
                View your dashboard
              </Link>
            </div>
          </div>
          <LeaderboardPreview />
        </div>
      </section>

      {/* ─── PLEDGE STRIP ─────────────────────────────────────── */}
      <section className="border-t-2 border-ink bg-vio px-4 py-14 text-center text-white sm:px-6">
        <p className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          “AI tools produce answers by predicting what is likely to come next. Understanding how they
          work helps you decide how much to trust them and keep <span className="text-sun">control</span> of
          how you use them.”
        </p>
        <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
          the neuro//high approach
        </p>
      </section>
    </>
  );
}
