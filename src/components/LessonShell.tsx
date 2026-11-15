"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Clock3, Skull, Zap } from "lucide-react";
import type { Lesson, Module } from "@/content/types";
import { lessonPath, nextLesson, prevLesson } from "@/content";
import { useProgress } from "./ProgressProvider";
import LessonRenderer from "./LessonRenderer";
import CheckpointQuiz from "./CheckpointQuiz";
import ScenarioDeck from "./interactives/ScenarioDeck";
import { lessonsOf } from "@/content";

export default function LessonShell({ lesson, mod }: { lesson: Lesson; mod: Module }) {
  const { isCompleted } = useProgress();
  const done = isCompleted(lesson.slug);
  const next = nextLesson(lesson);
  const prev = prevLesson(lesson);
  const isBoss = lesson.kind === "boss";
  const moduleLessons = lessonsOf(mod.slug);
  const doneInModule = moduleLessons.filter((l) => isCompleted(l.slug)).length;

  const hasScenarioBlock = lesson.blocks.some((b) => b.type === "interactive" && b.id === "scenario-deck");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      {/* breadcrumb */}
      <nav className="flex items-center justify-between gap-3" aria-label="Breadcrumb">
        <Link
          href={`/learn/${mod.slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink"
        >
          <ChevronLeft className="size-4" /> {mod.codename} - {mod.title}
        </Link>
        <div className="flex items-center gap-1.5" aria-label={`Lesson ${lesson.index + 1} of ${moduleLessons.length}`}>
          {moduleLessons.map((l) => (
            <span
              key={l.slug}
              className="h-2 w-5 rounded-full border border-ink/40"
              style={{
                backgroundColor: l.slug === lesson.slug ? mod.color : isCompleted(l.slug) ? "#C6F32E" : "#fff",
              }}
            />
          ))}
        </div>
      </nav>

      {/* hero */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-6"
      >
        {done && (
          <motion.div
            initial={{ scale: 0, rotate: 12 }}
            animate={{ scale: 1, rotate: 6 }}
            className="absolute -top-4 right-0 z-10 chip bg-lime text-ink"
          >
            <CheckCircle2 className="size-3.5" /> Cleared
          </motion.div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip text-white" style={{ backgroundColor: mod.color }}>
            {isBoss ? <Skull className="size-3.5" /> : null}
            {isBoss ? "Boss fight" : `Mission 0${lesson.index + 1}`}
          </span>
          <span className="chip bg-white text-ink/70">
            <Clock3 className="size-3.5" /> {lesson.minutes} min
          </span>
          <span className="chip bg-sun text-ink">
            <Zap className="size-3.5" /> {lesson.xp} XP {isBoss ? "+ combos" : "+ combo bonus"}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">{lesson.subtitle}</p>
        <p className="mt-4 max-w-[62ch] rounded-2xl border-2 border-ink bg-white p-4 text-[15px] leading-relaxed text-ink/80 shadow-[4px_4px_0_#171321]">
          {lesson.hook}
        </p>
      </motion.header>

      {/* body */}
      <div className="mt-10">
        <LessonRenderer lesson={lesson} />
      </div>

      {/* scenario deck (ethics style — when not already mounted as a block) */}
      {lesson.scenarios && !hasScenarioBlock && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10"
        >
          <div className="sticker-lg overflow-hidden bg-white">
            <div className="flex items-center gap-2 border-b-2 border-ink bg-ink px-4 py-3 text-paper">
              <span className="size-2.5 animate-pulse rounded-full bg-coral" />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]">Lab: The Integrity Court</p>
            </div>
            <p className="border-b-2 border-ink bg-paper px-4 py-3 text-sm leading-relaxed text-ink/75">
              Four real-feeling situations, two moves each. There&apos;s no teacher watching, the only judge here is
              future-you. Choose well.
            </p>
            <div className="p-3 sm:p-4">
              <ScenarioDeck scenarios={lesson.scenarios} accent={mod.color} label="Integrity court" />
            </div>
          </div>
        </motion.section>
      )}

      {/* checkpoint */}
      <section className="mt-12" aria-label="Checkpoint quiz">
        <p className="mb-3 text-center font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-ink/50">
          ── {isBoss ? "Final exam of this module" : "Prove it"} ──
        </p>
        <CheckpointQuiz lesson={lesson} />
        <p className="mt-3 text-center text-xs text-ink/55">
          Wrong answers cost nothing and reset your combo. Correct answers must all land to clear, retries are free, that&apos;s training.
        </p>
      </section>

      {/* prev / next */}
      <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
        {prev ? (
          <Link
            href={lessonPath(prev)}
            className="sticker group flex items-center gap-3 bg-white p-4 transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="size-5 shrink-0 text-ink/40 transition-transform group-hover:-translate-x-1" />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-ink/45">Previous</span>
              <span className="block font-display text-sm font-bold text-ink">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={lessonPath(next)}
            className="sticker group flex items-center justify-end gap-3 p-4 text-right transition-transform hover:-translate-y-0.5 sm:text-right"
            style={{ backgroundColor: "#C6F32E" }}
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-ink/60">Up next</span>
              <span className="block font-display text-sm font-bold text-ink">{next.title}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="sticker group flex items-center justify-end gap-3 p-4 text-right transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: "#FF8BD1" }}
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-ink/60">You finished everything</span>
              <span className="block font-display text-sm font-bold text-ink">Inspect your full build</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </nav>
    </div>
  );
}
