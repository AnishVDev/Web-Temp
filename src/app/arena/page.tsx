import type { Metadata } from "next";
import ArenaLobby from "@/components/arena/ArenaLobby";

export const metadata: Metadata = { title: "Arena — NEURO//HIGH" };

export default function ArenaPage() {
  return <ArenaLobby />;
}
```

## 9. Patch `src/components/Header.tsx`

```tsx
import { Flame, House, LayoutDashboard, Menu, Rocket, Swords, Trophy, X, Zap } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/#modules", label: "Modules", icon: Rocket },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];
