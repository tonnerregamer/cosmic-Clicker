// FIX: Add `as const` to ensure currency keys are treated as literal types.
export const Currency = {
  Stardust: 'Stardust',
  NebulaGas: 'Nebula Gas',
  Antimatter: 'Antimatter',
} as const;

export const UpgradeType = {
  Click: 'Click',
  Passive: 'Passive',
  Utility: 'Utility',
  Prestige: 'Prestige',
};

// FIX: Uncommented TypeScript interfaces to provide strong typing throughout the application.
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  cost: number;
  baseCost: number;
  costIncrease: number;
  effect: (level: number, gameState?: GameState) => number;
  baseEffect: number;
  type: string;
  currency: string;
  maxLevel?: number;
  requirement?: {
    upgradeId: string;
    level: number;
  };
}

export interface GameState {
  currencies: {
    [Currency.Stardust]: number;
    [Currency.NebulaGas]: number;
    [Currency.Antimatter]: number;
  };
  upgrades: Record<string, Upgrade>;
  totalStardustEver: number;
  stats: {
    totalClicks: number;
    supernovaCount: number;
    playTime: number; // in seconds
  };
  lastTick: number;
}

export type FloatingNumber = {
  id: number;
  value: string;
  x: number;
  y: number;
};

export interface HistoryData {
    timestamp: number;
    totalStardust: number;
}

export type ClickableOrb = {
  id: number;
  value: number;
  x: number;
  y: number;
};

export interface DetailedStats {
    stardustPerSecond: number;
    stardustPerClick: number;
    totalClicks: number;
    supernovaCount: number;
    playTime: string;
    prestigeBonus: string;
}