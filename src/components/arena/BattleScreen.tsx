"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Clock3, Flame, Heart, Shield, Swords, Zap, ZapOff } from "lucide-react";
import RankIcon from "@/components/RankIcon";
import { useProgress } from "@/components/ProgressProvider";
import { RANKS, rankFor } from "@/lib/gamification";
import {
  ITEMS,
  ITEM_DAMAGE,
  MAX_HP,
  MAX_ROUNDS,
  SHOP_SECONDS,
  battleXp,
  botChoose,
  drawQuestions,
  itemById,
  opponentDelta,
  questionClock,
  type ItemId,
  type Opponent,
} from "@/lib/arena";

type Side = { hp: number; charge: number; shield: boolean; jammed: boolean; correct: number };
type Phase = "intro" | "question" | "reveal" | "shop" | "enemy" | "over";
type Battle = {
  phase: Phase;
  round: number;
  you: Side;
  opp: Side;
  qi: number;
  picked: number | null;
  log: string[];
};

const newSide = (): Side => ({ hp: MAX_HP, charge: 0, shield: false, jammed: false, correct: 0 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const push = (log: string[], line: string) => [...log.slice(-5), line];
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function applyItem(id: ItemId, me: Side, them: Side, meName: string, themName: string) {
  const item = itemById(id);
  const m: Side = { ...me, charge: me.charge - item.cost };
  const t: Side = { ...them };
  let line = `${meName} used ${item.name}!`;
  if (id === "strike" || id === "blast") {
    const dmg = ITEM_DAMAGE[id];
    if (t.shield) {
      t.shield = false;
      line += ` ${themName}'s Firewall absorbed it.`;
    } else {
      t.hp = Math.max(0, t.hp - dmg);
      line += ` −${dmg} HP to ${themName}.`;
    }
  } else if (id === "repair") {
    const healed = Math.min(20, MAX_HP - m.hp);
    m.hp += healed;
    line += ` +${healed} HP.`;
  } else if (id === "firewall") {
    m.shield = true;
    line += " The next hit will be blocked.";
  } else if (id === "jam") {
    t.jammed = true;
    line += ` ${themName}'s next turn is scrambled.`;
  }
  return { me: m, them: t, line };
}

function HpBar({ hp, color }: { hp: number; color: string }) {
  const pct = (hp / MAX_HP) * 100;
  return (
    <div className="h-4 w-full rounded-full border-2 border-ink bg-white p-[2px]">
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="h-full rounded-full"
        style={{ backgroundColor: pct > 50 ? color : pct > 25 ? "#FFD645" : "#FF6B4A" }}
      />
    </div>
  );
}

function Fighter({
  name,
  xp,
  s,
  color,
  align,
  isYou,
}: {
  name: string;
  xp: number;
  s: Side;
  color: string;
  align: "left" | "right";
  isYou?: boolean;
}) {
  const rank = rankFor(xp);
  return (
    <div className={`sticker w-full max-w-xs bg-paper p-3 ${align === "right" ? "ml-auto" : ""}`}>
      <div className="flex items-center gap-2.5">
        <RankIcon rank={rank} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-extrabold text-ink">
            {name} {isYou && <span className="chip ml-1 !py-0 bg-vio !text-[9px] text-white">You</span>}
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink/50">
            {rank.name} · {xp.toLocaleString()} XP
          </p>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-ink/70">
          {s.shield && <Shield className="size-3.5 text-aqua-deep" />}
          {s.jammed && <ZapOff className="size-3.5 text-coral" />}
          <Zap className="size-3.5 text-vio" /> {s.charge}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <HpBar hp={s.hp} color={color} />
        <span className="w-14 shrink-0 text-right font-mono text-[10px] font-bold text-ink">
          {s.hp}/{MAX_HP}
        </span>
      </div>
    </div>
  );
}

export default function BattleScreen({
  opponent,
  streak,
  onExit,
}: {
  opponent: Opponent;
  streak: number;
  onExit: () => void;
}) {
  const { state, recordBattle } = useProgress();
  const you = state?.learner.codename ?? "You";
  const yourXp = state?.learner.xp ?? 0;
  const completed = useMemo(() => Object.keys(state?.completed ?? {}), [state?.completed]);

  const questions = useMemo(() => drawQuestions(completed, streak, MAX_ROUNDS + 4), [completed, streak]);
  const clock = questionClock(streak);

  const [b, setB] = useState<Battle>({
    phase: "intro",
    round: 1,
    you: newSide(),
    opp: newSide(),
    qi: 0,
    picked: null,
    log: [`${opponent.name} challenges you! Answer fast to build Charge.`],
  });
  const [t, setT] = useState(clock);
  const [result, setResult] = useState<{ won: boolean; xp: number } | null>(null);

  const bRef = useRef(b);
  bRef.current = b;
  const tRef = useRef(t);
  tRef.current = t;
  const overRef = useRef(false);

  const q = questions[b.qi % questions.length];

  /* ── finish ───────────────────────────────────────────────── */
  const finish = useCallback(
    (cur: Battle) => {
      if (overRef.current) return;
      overRef.current = true;
      const won =
        cur.opp.hp <= 0 ||
        (cur.you.hp > 0 && (cur.you.hp > cur.opp.hp || (cur.you.hp === cur.opp.hp && cur.you.correct >= cur.opp.correct)));
      const xp = battleXp(yourXp, opponent, won, cur.you.hp, streak);
      setResult({ won, xp });
      setB((s) => ({
        ...s,
        phase: "over",
        log: push(s.log, won ? `${opponent.name} was defeated!` : `${you} was defeated…`),
      }));
      void recordBattle({
        opponentId: opponent.id,
        opponentName: opponent.name,
        won,
        xpDelta: xp,
        opponentDelta: opponentDelta(xp, won),
      });
      if (won) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#7B5CFF", "#C6F32E", "#FFD645", "#FF8BD1"],
          disableForReducedMotion: true,
        });
      }
    },
    [opponent, recordBattle, streak, you, yourXp],
  );
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // KO check
  useEffect(() => {
    if (b.phase !== "over" && (b.you.hp <= 0 || b.opp.hp <= 0)) finish(b);
  }, [b, finish]);

  /* ── intro → first question ──────────────────────────────── */
  useEffect(() => {
    if (b.phase !== "intro") return;
    const id = setTimeout(() => setB((s) => (s.phase === "intro" ? { ...s, phase: "question" } : s)), 1600);
    return () => clearTimeout(id);
  }, [b.phase]);

  /* ── reveal → shop ───────────────────────────────────────── */
  useEffect(() => {
    if (b.phase !== "reveal") return;
    const id = setTimeout(() => setB((s) => (s.phase === "reveal" ? { ...s, phase: "shop" } : s)), 1400);
    return () => clearTimeout(id);
  }, [b.phase]);

  /* ── your answer ──────────────────────────────────────────── */
  const pick = useCallback(
    (i: number | null) => {
      const cur = bRef.current;
      if (cur.phase !== "question" || overRef.current) return;
      const currentQ = questions[cur.qi % questions.length];
      const correct = i !== null && i === currentQ.answer;
      const fast = tRef.current > clock / 2;
      const gain = correct ? currentQ.tier + (fast ? 1 : 0) : 0;
      const line =
        i === null
          ? "Time's up! No Charge earned."
          : correct
            ? `Correct! +${gain} Charge${fast ? " (speed bonus)" : ""}.`
            : "Wrong answer. No Charge earned.";
      setB((s) => ({
        ...s,
        phase: "reveal",
        picked: i,
        you: { ...s.you, charge: s.you.charge + gain, correct: s.you.correct + (correct ? 1 : 0) },
        log: push(s.log, line),
      }));
    },
    [clock, questions],
  );
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const endTurn = useCallback(() => {
    setB((s) => (s.phase === "shop" ? { ...s, phase: "enemy" } : s));
  }, []);
  const endTurnRef = useRef(endTurn);
  endTurnRef.current = endTurn;

  /* ── shot clock ───────────────────────────────────────────── */
  useEffect(() => {
    if (b.phase !== "question" && b.phase !== "shop") return;
    const total = b.phase === "question" ? clock : SHOP_SECONDS;
    setT(total);
    const started = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, total - (Date.now() - started) / 1000);
      setT(left);
      if (left <= 0) {
        clearInterval(id);
        if (bRef.current.phase === "question") pickRef.current(null);
        else if (bRef.current.phase === "shop") endTurnRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [b.phase, b.round, clock]);

  /* ── your shop ────────────────────────────────────────────── */
  const buy = (id: ItemId) => {
    const cur = bRef.current;
    if (cur.phase !== "shop" || cur.you.charge < itemById(id).cost) return;
    const r = applyItem(id, cur.you, cur.opp, you, opponent.name);
    setB((s) => ({ ...s, you: r.me, opp: r.them, log: push(s.log, r.line) }));
  };

  /* ── enemy turn ───────────────────────────────────────────── */
  useEffect(() => {
    if (b.phase !== "enemy") return;
    let alive = true;
    void (async () => {
      await sleep(900);
      if (!alive || overRef.current) return;
      const cur = bRef.current;
      const acc = clamp(opponent.accuracy - (cur.opp.jammed ? 0.3 : 0), 0.05, 0.97);
      const correct = Math.random() < acc;
      const tier = 1 + Math.floor(Math.random() * 3);
      const gain = correct ? tier + (Math.random() < opponent.speed ? 1 : 0) : 0;
      setB((s) => ({
        ...s,
        opp: { ...s.opp, charge: s.opp.charge + gain, jammed: false, correct: s.opp.correct + (correct ? 1 : 0) },
        log: push(s.log, correct ? `${opponent.name} answered correctly. +${gain} Charge.` : `${opponent.name} got it wrong.`),
      }));
      for (let n = 0; n < 2; n++) {
        await sleep(1000);
        if (!alive || overRef.current) return;
        const s = bRef.current;
        const choice = botChoose(s.opp.charge, s.opp.hp, s.you.shield, s.you.hp);
        if (!choice) break;
        const r = applyItem(choice, s.opp, s.you, opponent.name, you);
        setB((st) => ({ ...st, opp: r.me, you: r.them, log: push(st.log, r.line) }));
      }
      await sleep(900);
      if (!alive || overRef.current) return;
      const s = bRef.current;
      if (s.you.hp <= 0 || s.opp.hp <= 0 || s.round >= MAX_ROUNDS) finishRef.current(s);
      else setB((st) => ({ ...st, phase: "question", round: st.round + 1, qi: st.qi + 1, picked: null }));
    })();
    return () => {
      alive = false;
    };
  }, [b.phase, opponent, you]);

  /* ── render ───────────────────────────────────────────────── */
  const clockTotal = b.phase === "shop" ? SHOP_SECONDS : clock;
  const clockPct = (t / clockTotal) * 100;

  return (
    <div className="sticker-lg overflow-hidden bg-ink">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-ink px-4 py-3 text-paper">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          <Swords className="size-4 text-sun" /> Arena · Round {Math.min(b.round, MAX_ROUNDS)}/{MAX_ROUNDS}
        </span>
        <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
          <span className={`flex items-center gap-1 ${streak >= 2 ? "text-coral" : "text-paper/40"}`}>
            <Flame className="size-4" /> streak {streak}
          </span>
          <span className="flex items-center gap-1 text-paper/70">
            <Clock3 className="size-4" /> {clock}s clock
          </span>
        </span>
      </div>

      {/* field */}
      <div className="dotgrid grid gap-4 bg-paper p-4 sm:p-5">
        <Fighter name={opponent.name} xp={opponent.xp} s={b.opp} color="#FF6B4A" align="right" />

        {/* battle log */}
        <div className="sticker bg-white p-3 font-mono text-[12px] leading-relaxed text-ink">
          {b.log.slice(-3).map((l, i, arr) => (
            <p key={`${l}-${i}`} className={i === arr.length - 1 ? "font-bold" : "text-ink/45"}>
              ▸ {l}
            </p>
          ))}
        </div>

        <Fighter name={you} xp={yourXp} s={b.you} color="#7B5CFF" align="left" isYou />
      </div>

      {/* action area */}
      <div className="border-t-2 border-ink bg-white p-4 sm:p-6">
        {(b.phase === "question" || b.phase === "shop") && (
          <div className="mb-4 h-2.5 rounded-full border border-ink/40 bg-paper p-[1.5px]">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{ width: `${clockPct}%`, backgroundColor: clockPct > 40 ? "#C6F32E" : "#FF6B4A" }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {b.phase === "intro" && (
            <motion.p
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center font-display text-2xl font-extrabold text-ink"
            >
              {opponent.name} wants to battle!
            </motion.p>
          )}

          {(b.phase === "question" || b.phase === "reveal") && (
            <motion.div
              key={`q-${b.qi}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.16 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="chip bg-paper text-ink/70">
                  Tier {q.tier} · {q.tier + 1} Charge if fast
                </span>
                <span className="font-mono text-xs font-bold tabular-nums text-ink/60">{Math.ceil(t)}s</span>
              </div>
              <p className="font-display text-lg font-bold leading-snug text-ink sm:text-xl">{q.q}</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const revealed = b.phase === "reveal";
                  const isAnswer = i === q.answer;
                  const isPicked = b.picked === i;
                  let cls = "border-ink/25 bg-white hover:border-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#171321]";
                  if (revealed && isAnswer) cls = "border-ink bg-lime/35 shadow-[3px_3px_0_#171321]";
                  else if (revealed && isPicked) cls = "border-ink bg-coral/25";
                  else if (revealed) cls = "border-ink/15 opacity-55";
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      disabled={revealed}
                      className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left text-sm font-medium leading-snug text-ink transition-all ${cls}`}
                    >
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-paper font-mono text-[11px] font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {b.phase === "shop" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-vio">
                  Spend your Charge · <Zap className="-mt-0.5 inline size-3.5" /> {b.you.charge}
                </p>
                <button onClick={endTurn} className="btn btn-primary !py-2 !text-[10px]">
                  End turn <ArrowRight className="size-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {ITEMS.map((it) => {
                  const can = b.you.charge >= it.cost;
                  return (
                    <button
                      key={it.id}
                      onClick={() => buy(it.id)}
                      disabled={!can}
                      className={`rounded-xl border-2 border-ink p-3 text-left transition-all ${
                        can ? "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#171321]" : "opacity-40"
                      }`}
                      style={{ backgroundColor: it.color }}
                    >
                      <p className="font-display text-sm font-extrabold leading-tight text-ink">{it.name}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink/75">{it.desc}</p>
                      <p className="mt-1.5 font-mono text-[10px] font-bold uppercase text-ink">{it.cost} charge</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {b.phase === "enemy" && (
            <motion.p
              key="enemy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-pulse text-center font-mono text-xs font-bold uppercase tracking-[0.25em] text-ink/60"
            >
              {opponent.name} is taking their turn…
            </motion.p>
          )}

          {b.phase === "over" && result && (
            <motion.div
              key="over"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticker-lg bg-ink p-6 text-center text-paper"
            >
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-sun">
                {result.won ? "Victory" : "Defeat"}
              </p>
              <p className={`mt-2 font-display text-5xl font-extrabold ${result.won ? "text-lime" : "text-coral"}`}>
                {result.xp > 0 ? "+" : ""}
                {result.xp} XP
              </p>
              <div className="mx-auto mt-4 flex flex-nowrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-wider text-paper/60">
                <span className="flex items-center gap-1">
                  <Heart className="size-4 text-coral" /> {b.you.hp} HP left
                </span>
                <span>{b.you.correct} correct</span>
                <span>vs {RANKS[opponent.rankIdx].name}</span>
              </div>
              <p className="mt-3 text-xs text-paper/60">
                {result.won
                  ? `${opponent.name} drops ${Math.abs(opponentDelta(result.xp, true))} XP on the leaderboard.`
                  : `${opponent.name} gains ${opponentDelta(result.xp, false)} XP. Losing to ${
                      opponent.label === "harder" ? "a stronger" : opponent.label === "easier" ? "a weaker" : "an even"
                    } opponent cost you ${Math.abs(result.xp)} XP.`}
              </p>
              <button onClick={onExit} className="btn btn-primary mx-auto mt-6">
                Back to the arena <ArrowRight className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
