import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { MODULES } from "@/content";

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/img/logo-lockup-light.png"
              alt="NEURO//HIGH"
              width={210}
              height={36}
              unoptimized
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">
            An AI literacy portal built for grades 9–12. Demystify the machine, master the
            tools, and graduate as a full stack human.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-xs text-paper/50">
            <span className="flex items-center gap-2">
              <GraduationCap className="size-4 text-lime" /> Written for learners, reviewed for classrooms.
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-aqua" /> Progress is stored only on your device&apos;s session — no accounts, no email, no tracking.
            </span>
          </div>
        </div>
        <nav aria-label="Modules">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-paper/40">Modules</p>
          <ul className="mt-4 space-y-2.5">
            {MODULES.map((m) => (
              <li key={m.slug}>
                <Link href={`/learn/${m.slug}`} className="group flex items-center gap-2 text-sm text-paper/75 hover:text-paper">
                  <span className="size-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {m.codename} — {m.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-paper/40">The deal</p>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/75">
            <li>No accounts. No ads. No data harvesting.</li>
            <li>Every skill here transfers to whatever AI exists next year.</li>
            <li>Built to make you harder to fool and easier to hire.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15 py-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-paper/35">
        NEURO//HIGH — learn the machine before it learns you
      </div>
    </footer>
  );
}
