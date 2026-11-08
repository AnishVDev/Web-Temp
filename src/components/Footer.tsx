import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { MODULES } from "@/content";

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink/20 bg-paper text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src="/png/lockup.png"
            alt="NEURO//HIGH"
            width={210}
            height={36}
            className="h-9 w-auto object-contain"
          />

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/70">
            Learn how AI works, try it out, and practice checking its answers.
            Each module includes short lessons, activities, and quizzes.
          </p>

          <div className="mt-5 flex flex-col gap-2 text-xs text-ink/60">
            <span className="flex items-center gap-2">
              <GraduationCap className="size-4 shrink-0 text-vio" />
              For grades 9–12, with classroom use in mind.
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-aqua-deep" />
              Progress stays on this device. No account or email needed.
            </span>
          </div>
        </div>

        <nav aria-label="Course modules">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
            Modules
          </p>
          <ul className="mt-4 space-y-2.5">
            {MODULES.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/learn/${m.slug}`}
                  className="group flex items-center gap-2 text-sm text-ink/75 transition-colors hover:text-vio"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="transition-transform group-hover:translate-x-0.5">
                    {m.codename} — {m.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
            Good to know
          </p>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink/75">
            <li>Free to use. No ads or tracking.</li>
            <li>AI can get things wrong, even when an answer sounds confident.</li>
            <li>The skills you learn can apply across different AI tools.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/15 py-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink/45">
        NEURO//HIGH — Learn how AI works. Decide how to use it.
      </div>
    </footer>
  );
}
