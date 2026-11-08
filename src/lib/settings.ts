// ─── App settings (saved in this browser) ───────────────────────────────────

export type ThemeMode = "light" | "dark";

export type AppSettings = {
  theme: ThemeMode;
  reduceMotion: boolean;
};

export const SETTINGS_KEY = "neurohigh-settings-v1";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  reduceMotion: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* storage blocked or full */
  }
}

/** Puts the settings onto <html> so CSS can respond to them. */
export function applySettings(s: AppSettings) {
  const el = document.documentElement;
  el.dataset.theme = s.theme;
  el.dataset.motion = s.reduceMotion ? "reduced" : "full";
  el.style.colorScheme = s.theme;
}

/**
 * Runs before React loads (see layout.tsx) so the saved theme is applied
 * on the very first paint and the page doesn't flash white in dark mode.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}");var t=s.theme==="dark"?"dark":"light";var m=s.reduceMotion?"reduced":"full";var el=document.documentElement;el.dataset.theme=t;el.dataset.motion=m;el.style.colorScheme=t;}catch(e){}})();`;
