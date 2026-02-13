// ============================================================
// Casino Mariage - RNG & Game Logic Utilities
// ============================================================

export interface Symbol {
  id: number;
  name: string;
  filename: string;
  src: string;
  initials: string;
  color: string; // gradient for placeholder
}

export const SYMBOLS: Symbol[] = [
  {
    id: 0,
    name: "Anaé",
    filename: "ANAÉ.jpeg",
    src: `/images/${encodeURIComponent("ANAÉ.jpeg")}`,
    initials: "A",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 1,
    name: "Nathan",
    filename: "NATHAN.jpeg",
    src: "/images/NATHAN.jpeg",
    initials: "N",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    name: "Arthur",
    filename: "ARTHUR.jpeg",
    src: "/images/ARTHUR.jpeg",
    initials: "AR",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    name: "Christophe & Katia",
    filename: "CHRISTOPHE_ET_KATIA.jpeg",
    src: "/images/CHRISTOPHE_ET_KATIA.jpeg",
    initials: "C&K",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 4,
    name: "JB & Agnès",
    filename: "JB ET AGNES.jpeg",
    src: `/images/${encodeURIComponent("JB ET AGNES.jpeg")}`,
    initials: "J&A",
    color: "from-red-500 to-orange-600",
  },
  {
    id: 5,
    name: "Jules",
    filename: "JULES.jpeg",
    src: "/images/JULES.jpeg",
    initials: "JU",
    color: "from-cyan-500 to-sky-600",
  },
];

export const WIN_RATE = 1 / 3;
export const NEAR_MISS_RATE = 0.5;
export const COOLDOWN_MS = 5000;

export interface SpinResult {
  reels: [Symbol, Symbol, Symbol];
  isWin: boolean;
  isNearMiss: boolean;
}

function randomSymbol(): Symbol {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function randomSymbolExcluding(excludeId: number): Symbol {
  const filtered = SYMBOLS.filter((s) => s.id !== excludeId);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function spin(forceWin: boolean = false): SpinResult {
  const isWin = forceWin || Math.random() < WIN_RATE;

  if (isWin) {
    const winner = randomSymbol();
    return {
      reels: [winner, winner, winner],
      isWin: true,
      isNearMiss: false,
    };
  }

  // Loss path
  const isNearMiss = Math.random() < NEAR_MISS_RATE;

  if (isNearMiss) {
    const matchSymbol = randomSymbol();
    const thirdReel = randomSymbolExcluding(matchSymbol.id);
    return {
      reels: [matchSymbol, matchSymbol, thirdReel],
      isWin: false,
      isNearMiss: true,
    };
  }

  // Pure random mismatch — ensure not all 3 are the same
  const r1 = randomSymbol();
  const r2 = randomSymbol();
  let r3 = randomSymbol();

  while (r1.id === r2.id && r2.id === r3.id) {
    r3 = randomSymbol();
  }

  return {
    reels: [r1, r2, r3],
    isWin: false,
    isNearMiss: false,
  };
}
