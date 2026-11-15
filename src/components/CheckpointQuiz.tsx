"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Banknote, CheckCircle2, Flame, RotateCcw, ShieldQuestion, XCircle } from "lucide-react";
import type { Lesson } from "@/content/types";
import { useProgress } from "./ProgressProvider";
import { comboBonus } from "@/lib/gamification";

const CONF_COLORS = ["#7B5CFF", "#FF6B4A", "#43D9FF", "#C6F32E", "#FFD645", "#FF8BD1"];

export default function CheckpointQuiz({ lesson }: { lesson: Lesson }) {
  const { complete, isCompleted, completion } = useProgress();
  const qs = lesson.quiz;
  const isBoss = lesson.kind === "boss";

  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState<boolean[]>(() => qs.map(() => false));
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [passed, setPassed] = useState(false);
  const [banked, setBanked] = useState(false);
  const refire = useRef(false);

  const alreadyDone = isCompleted(lesson.slug);
  const prev = completion(lesson.slug);

  const bonus = useMemo(() => comboBonus(maxCombo), [maxCombo]);
  const totalXp = lesson.xp + bonus;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);

    const right = i === qs[qIdx].answer;

    if (right) {
      setSolved((s) => {
        const n = [...s];
        n[qIdx] = true;
        return n;
      });

      setCombo((c) => {
        const n = c + 1;
        setMaxCombo((m) => Math.max(m, n));
        return n;
      });
    } else {
      setCombo(0);
      setMisses((m) => m + 1);
    }
  };

  const next = () => {
    setPicked(null);

    const findNext = (from: number): number => {
      for (let i = from; i < qs.length; i++) {
        if (!solved[i]) return i;
      }

      for (let i = 0; i < from; i++) {
        if (!solved[i]) return i;
      }

      return -1;
    };

    if (solved.every(Boolean)) {
      finish();
      return;
    }

    const nx = findNext(qIdx + 1);
    if (nx === -1) finish();
    else setQIdx(nx);
  };

  const finish = () => {
    setPassed(true);
    if (refire.current) return;
    refire.current = true;

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.7 },
      colors: CONF_COLORS,
      disableForReducedMotion: true,
    });

    setTimeout(
      () =>
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 },
          colors: CONF_COLORS,
          disableForReducedMotion: true,
        }),
      250,
    );

    setTimeout(
      () =>
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 },
          colors: CONF_COLORS,
          disableForReducedMotion: true,
        }),
      400,
    );
  };

  const reset = () => {
    setQIdx(0);
    setPicked(null);
    setSolved(qs.map(() => false));
    setCombo(0);
    setMaxCombo(0);
    setMisses(0);
    setPassed(false);
    setBanked(false);
    refire.current = false;
  };

  const q = qs[qIdx];
  const answeredRight = picked !== null && picked === q.answer;

  if (passed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sticker-lg overflow-hidden bg-ink p-6 text-center text-paper sm:p-8"
      >
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-sun">
          {isBoss ? "Boss defeated" : "Checkpoint cleared"}
        </p>

        <p className="mt-3 font-display text-5xl font-extrabold text-lime sm:text-6xl">
          +{totalXp} XP
        </p>

        {/* Results stay on one line */}
        <div className="mx-auto mt-4 w-full overflow-x-auto">
          <div className="flex w-max min-w-full items-center justify-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-normal text-paper/60 sm:gap-6 sm:text-xs sm:tracking-wider">
            <span>Base {lesson.xp} XP</span>

            <span className="flex items-center gap-1">
              <Flame className="size-3.5 shrink-0 text-coral sm:size-4" />
              Combo +{bonus} XP
            </span>

            <span>
              {misses === 0
                ? "Flawless"
                : `${misses} mistake${misses > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2.5 sm:flex-row sm:justify-center">
          {!banked && (
            <button
              onClick={async () => {
                await complete(lesson, {
                  correct: qs.length,
                  total: qs.length,
                  maxCombo,
                  attempts: 1 + misses,
                });
                setBanked(true);
              }}
              className="btn btn-primary"
            >
              <Banknote className="size-4" />
              {alreadyDone ? "Replay banked (0 XP)" : "Bank the XP"}
            </button>
          )}

          <button
            onClick={reset}
            className="btn !border-paper bg-transparent text-paper !shadow-[3px_3px_0_rgba(255,246,233,0.35)]"
          >
            <RotateCcw className="size-4" /> Re-run it
          </button>
        </div>

        {banked && (
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-lime">
            ✓ Logged to your neural build, scroll down to continue
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="sticker-lg overflow-hidden bg-white">
      {/* quiz header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-ink px-4 py-3 text-paper">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          <ShieldQuestion className="size-4 text-sun" />
          {isBoss ? "Boss fight" : "Checkpoint"} · Q{qIdx + 1}/{qs.length}
        </span>

        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
          <span
            className={`flex items-center gap-1 ${
              combo >= 2 ? "text-coral" : "text-paper/40"
            }`}
          >
            <Flame className="size-4" />
            combo ×{combo}
          </span>

          {alreadyDone && (
            <span className="chip !border-paper/40 bg-transparent text-paper/60">
              replaying · best {prev?.maxCombo ?? 0} combo
            </span>
          )}
        </div>
      </div>

      {/* progress pips */}
      <div className="flex gap-1 border-b-2 border-ink bg-paper px-4 py-2">
        {qs.map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full border border-ink/30 ${
              solved[i] ? "bg-lime" : i === qIdx ? "bg-sun" : "bg-white"
            }`}
          />
        ))}
      </div>

      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.16 }}
          >
            <p className="font-display text-lg font-bold leading-snug text-ink sm:text-xl">
              {q.q}
            </p>

            <div className="mt-4 grid gap-2.5">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const isAnswer = i === q.answer;
                const revealed = picked !== null;

                let cls =
                  "border-ink/25 bg-white hover:border-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#171321]";

                if (revealed && isAnswer) {
                  cls = "border-ink bg-lime/35 shadow-[3px_3px_0_#171321]";
                } else if (revealed && isPicked) {
                  cls = "border-ink bg-coral/25";
                } else if (revealed) {
                  cls = "border-ink/15 bg-white opacity-55";
                }

                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={picked !== null}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left text-sm font-medium leading-snug text-ink transition-all ${cls}`}
                  >
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-paper font-mono text-[11px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>

                    <span className="flex-1">{opt}</span>

                    {revealed && isAnswer && (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2E7D0F]" />
                    )}

                    {revealed && isPicked && !isAnswer && (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-[#B42318]" />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 flex flex-col gap-3 rounded-xl border-2 border-ink p-4 sm:flex-row sm:items-center ${
                    answeredRight ? "bg-lime/20" : "bg-coral/15"
                  }`}
                >
                  <p className="flex-1 text-sm leading-relaxed text-ink/85">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                      {answeredRight ? "Correct - " : "Not quite - "}
                    </span>
                    {q.explain}
                  </p>

                  <button onClick={next} className="btn btn-violet shrink-0 !py-2">
                    {answeredRight && solved.every(Boolean) ? "Finish" : "Next"}{" "}
                    <ArrowRight className="size-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
