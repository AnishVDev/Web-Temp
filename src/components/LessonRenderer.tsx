"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Info, KeyRound, XCircle, Zap } from "lucide-react";
import Image from "next/image";
import type { Block, Lesson, Scenario } from "@/content/types";
import TeachableMachine from "./interactives/TeachableMachine";
import NetworkViz from "./interactives/NetworkViz";
import TokenPredictor from "./interactives/TokenPredictor";
import PromptBuilder from "./interactives/PromptBuilder";
import ScenarioDeck from "./interactives/ScenarioDeck";
import HallucinationHunt from "./interactives/HallucinationHunt";

const LIST_ICONS = {
  check: { icon: CheckCircle2, color: "#2E7D0F", bg: "#C6F32E" },
  x: { icon: XCircle, color: "#B42318", bg: "#FF6B4A" },
  arrow: { icon: ArrowRight, color: "#171321", bg: "#43D9FF" },
  bolt: { icon: Zap, color: "#171321", bg: "#FFD645" },
};

function KeyTerm({ term, def }: { term: string; def: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="cursor-help border-b-2 border-dashed border-vio font-semibold text-ink transition-colors hover:bg-vio/10"
        aria-expanded={open}
      >
        {term}
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border-2 border-ink bg-ink p-3 font-mono text-[11px] leading-snug text-paper shadow-[4px_4px_0_#17132140]">
          {def}
          <span className="absolute left-1/2 top-full -ml-1.5 size-3 rotate-45 border-b-2 border-r-2 border-ink bg-ink" />
        </span>
      )}
    </span>
  );
}

function InteractiveMount({ id, scenarios }: { id: string; scenarios?: Scenario[] }) {
  switch (id) {
    case "teachable-machine":
      return <TeachableMachine />;
    case "network-viz":
      return <NetworkViz />;
    case "token-predictor":
      return <TokenPredictor />;
    case "prompt-builder":
      return <PromptBuilder />;
    case "scenario-deck":
      return scenarios ? (
        <ScenarioDeck scenarios={scenarios} accent="#7B5CFF" label="Rescue the chat" />
      ) : null;
    case "hallucination-hunt":
      return <HallucinationHunt />;
    default:
      return null;
  }
}

export default function LessonRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-10">
      {lesson.blocks.map((block, i) => {
        switch (block.type) {
          case "lead":
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="border-l-4 border-vio pl-5 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl"
              >
                {block.text}
              </motion.p>
            );

          case "text":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
              >
                {block.kicker && (
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-vio">{block.kicker}</p>
                )}
                {block.heading && (
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                    {block.heading}
                  </h2>
                )}
                <div className="prose-block mt-3 max-w-[68ch] text-[15.5px] leading-relaxed text-ink/80">
                  {block.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </motion.section>
            );

          case "list": {
            const { icon: Icon, color, bg } = LIST_ICONS[block.style];
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="sticker bg-white p-5"
              >
                {block.heading && (
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">{block.heading}</h3>
                )}
                <ul className="mt-3 space-y-2.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 rounded-xl bg-paper/70 p-3">
                      <span
                        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink"
                        style={{ backgroundColor: bg }}
                      >
                        <Icon className="size-3.5" style={{ color }} strokeWidth={2.8} />
                      </span>
                      <span className="text-[14.5px] leading-relaxed text-ink/85">
                        {item.title && <strong className="mr-1.5 font-bold text-ink">{item.title} -</strong>}
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            );
          }

          case "steps":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
              >
                {block.heading && (
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{block.heading}</h2>
                )}
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {block.steps.map((step, j) => (
                    <li key={j} className="sticker relative bg-cream p-4 pt-6">
                      <span className="absolute -top-3 left-4 grid size-7 place-items-center rounded-lg border-2 border-ink bg-sun font-mono text-xs font-bold text-ink shadow-[2px_2px_0_#171321]">
                        {j + 1}
                      </span>
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink">{step.title}</p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/75">{step.text}</p>
                    </li>
                  ))}
                </ol>
              </motion.section>
            );

          case "compare":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
              >
                {block.heading && (
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{block.heading}</h2>
                )}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sticker relative bg-white p-4">
                    <span className="chip absolute -top-3 left-4 bg-coral text-ink">{block.weak.label}</span>
                    <p className="pt-2 font-mono text-[13px] leading-relaxed text-ink/75">{block.weak.text}</p>
                  </div>
                  <div className="sticker relative bg-white p-4">
                    <span className="chip absolute -top-3 left-4 bg-lime text-ink">{block.strong.label}</span>
                    <p className="pt-2 font-mono text-[13px] leading-relaxed text-ink/85">{block.strong.text}</p>
                  </div>
                </div>
                {block.note && (
                  <p className="mt-3 max-w-[62ch] text-sm italic text-ink/60">※ {block.note}</p>
                )}
              </motion.section>
            );

          case "callout": {
            const v =
              block.variant === "nova"
                ? { bg: "#EEE8FF", stripe: "#7B5CFF", label: "NOVA", img: true }
                : block.variant === "warn"
                  ? { bg: "#FFD64533", stripe: "#FFD645", label: "WARNING", img: false }
                  : { bg: "#C6F32E2E", stripe: "#C6F32E", label: "KEY", img: false };
            return (
              <motion.aside
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="sticker flex gap-4 p-4 sm:p-5"
                style={{ backgroundColor: v.bg }}
              >
                {v.img ? (
                  <Image
                    src="/img/nova-bot.png"
                    alt="NOVA the robot"
                    width={56}
                    height={56}
                    className="mt-0.5 size-14 shrink-0 rounded-xl border-2 border-ink bg-white object-cover"
                  />
                ) : block.variant === "warn" ? (
                  <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ backgroundColor: v.stripe }}>
                    <AlertTriangle className="size-5 text-ink" />
                  </span>
                ) : (
                  <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink" style={{ backgroundColor: v.stripe }}>
                    <KeyRound className="size-5 text-ink" />
                  </span>
                )}
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">{block.title}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink/85">{block.text}</p>
                </div>
              </motion.aside>
            );
          }

          case "terms":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="sticker bg-white p-5"
              >
                <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink/50">
                  <Info className="size-4" /> Vocab drop: hover any term
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[15px] leading-relaxed text-ink/85">
                  {block.terms.map((t, j) => (
                    <span key={j} className="inline-flex items-baseline gap-1.5">
                      <KeyTerm term={t.term} def={t.def} /> <span className="text-ink/40">·</span>
                    </span>
                  ))}
                </div>
              </motion.section>
            );

          case "stat":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="sticker-lg overflow-hidden bg-ink text-paper"
              >
                <div className="grid sm:grid-cols-3">
                  {block.stats.map((s, j) => (
                    <div key={j} className="border-paper/15 p-5 text-center [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r">
                      <p className="font-display text-4xl font-extrabold text-sun sm:text-5xl">{s.value}</p>
                      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/65">{s.label}</p>
                    </div>
                  ))}
                </div>
                {block.note && (
                  <p className="border-t border-paper/15 bg-paper/5 px-5 py-3 text-center text-xs text-paper/60">{block.note}</p>
                )}
              </motion.section>
            );

          case "quote":
            return (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="relative py-2 pl-6"
              >
                <span className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-gradient-to-b from-vio via-blush to-sun" />
                <p className="font-display text-xl font-bold italic leading-snug text-ink sm:text-2xl">“{block.text}”</p>
                {block.cite && <cite className="mt-2 block font-mono text-xs not-italic uppercase tracking-wider text-ink/50">- {block.cite}</cite>}
              </motion.blockquote>
            );

          case "interactive":
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <div className="sticker-lg overflow-hidden bg-white">
                  <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-ink px-4 py-3 text-paper">
                    <span className="size-2.5 animate-pulse rounded-full bg-lime" />
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">{block.title}</p>
                  </div>
                  <p className="border-b-2 border-ink bg-paper px-4 py-3 text-sm leading-relaxed text-ink/75">
                    {block.caption}
                  </p>
                  <div className="p-3 sm:p-4">
                    <InteractiveMount id={block.id} scenarios={lesson.scenarios} />
                  </div>
                </div>
              </motion.section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
