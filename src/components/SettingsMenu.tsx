"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Settings, Sparkles, X } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  applySettings,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors ${
        checked ? "bg-lime" : "bg-paper"
      }`}
    >
      <span
        className={`absolute left-[2px] top-[2px] size-4 rounded-full border-2 border-ink bg-white transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Read saved settings once on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    applySettings(next);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Settings"
        className="btn btn-ghost !px-3 !py-2"
      >
        <Settings className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="sticker-lg absolute right-0 top-full z-[70] mt-3 w-[min(88vw,300px)] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-extrabold text-ink">Settings</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-paper"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            <li className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/15 p-3">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-vio">
                  <Moon className="size-4 text-white" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-extrabold text-ink">Dark mode</p>
                  <p className="text-xs leading-snug text-ink/60">Easier on your eyes at night.</p>
                </div>
              </div>
              <Toggle
                label="Dark mode"
                checked={settings.theme === "dark"}
                onChange={(on) => update({ theme: on ? "dark" : "light" })}
              />
            </li>

            <li className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/15 p-3">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-sun">
                  <Sparkles className="size-4 text-ink" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-extrabold text-ink">Reduced motion</p>
                  <p className="text-xs leading-snug text-ink/60">Turns off most animations.</p>
                </div>
              </div>
              <Toggle
                label="Reduced motion"
                checked={settings.reduceMotion}
                onChange={(on) => update({ reduceMotion: on })}
              />
            </li>
          </ul>

          <p className="mt-3 text-[11px] leading-snug text-ink/50">
            Your settings are saved in this browser only.
          </p>
        </div>
      )}
    </div>
  );
}
