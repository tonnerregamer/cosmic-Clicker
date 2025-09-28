import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// FIX: Import types to be used for state and props.
import { Currency, UpgradeType, Upgrade, GameState, FloatingNumber, ClickableOrb, HistoryData, DetailedStats } from './types.js';
import Header from './components/Header.js';
import MainGameArea from './components/MainGameArea.js';
import UpgradesPanel from './components/UpgradesPanel.js';
import { useGameLoop } from './hooks/useGameLoop.js';
import { formatNumber } from './utils/format.js';

// FIX: Add type for INITIAL_UPGRADES to ensure it conforms to the Upgrade interface.
const INITIAL_UPGRADES: Record<string, Upgrade> = {
  // Stardust Upgrades
  clickPower1: {
    id: 'clickPower1', name: 'Cosmic Tap', description: 'Increases Stardust per click.', level: 1, baseCost: 5, cost: 5, costIncrease: 1.15, baseEffect: 1, effect: (level) => level * 1, type: UpgradeType.Click, currency: Currency.Stardust,
  },
  probe: {
    id: 'probe', name: 'Stardust Probe', description: 'Passively generates Stardust per second.', level: 0, baseCost: 15, cost: 15, costIncrease: 1.18, baseEffect: 0.5, effect: (level) => level * 0.5, type: UpgradeType.Passive, currency: Currency.Stardust, requirement: { upgradeId: 'clickPower1', level: 5 },
  },
  clickPower2: {
    id: 'clickPower2', name: 'Star Gazer', description: 'Each level grants a bonus to Cosmic Tap.', level: 0, baseCost: 100, cost: 100, costIncrease: 1.2, baseEffect: 5, effect: (level) => level * 5, type: UpgradeType.Click, currency: Currency.Stardust, requirement: { upgradeId: 'clickPower1', level: 10 },
  },
  reinforcedProbes: {
    id: 'reinforcedProbes', name: 'Reinforced Probes', description: 'Stardust Probes are 25% more effective.', level: 0, baseCost: 500, cost: 500, costIncrease: 2, baseEffect: 0.25, effect: (level) => 1 + level * 0.25, type: UpgradeType.Utility, currency: Currency.Stardust, requirement: { upgradeId: 'probe', level: 10 },
  },
  asteroidMining: {
    id: 'asteroidMining', name: 'Asteroid Mining', description: 'Mine asteroids for a new source of passive Stardust.', level: 0, baseCost: 1000, cost: 1000, costIncrease: 1.2, baseEffect: 10, effect: (level) => level * 10, type: UpgradeType.Passive, currency: Currency.Stardust, requirement: { upgradeId: 'probe', level: 25 },
  },
  cometChasers: {
    id: 'cometChasers', name: 'Comet Chasers', description: 'Boosts Asteroid Mining production by 50%.', level: 0, baseCost: 5000, cost: 5000, costIncrease: 2.5, baseEffect: 0.5, effect: (level) => 1 + level * 0.5, type: UpgradeType.Utility, currency: Currency.Stardust, requirement: { upgradeId: 'asteroidMining', level: 5 },
  },
  solarWinds: {
    id: 'solarWinds', name: 'Solar Winds', description: 'Boosts all passive Stardust generation by 10%.', level: 0, baseCost: 15000, cost: 15000, costIncrease: 3, baseEffect: 0.1, effect: (level) => 1 + level * 0.1, type: UpgradeType.Utility, currency: Currency.Stardust, requirement: { upgradeId: 'asteroidMining', level: 15 },
  },
  
  // Nebula Gas Upgrades
  gasHarvester: {
    id: 'gasHarvester', name: 'Gas Harvester', description: 'Passively generates Nebula Gas per second.', level: 0, baseCost: 10, cost: 10, costIncrease: 1.25, baseEffect: 0.2, effect: (level) => level * 0.2, type: UpgradeType.Passive, currency: Currency.NebulaGas,
  },
  orbitalCollector: {
    id: 'orbitalCollector', name: 'Orbital Collector', description: 'Spawns clickable Stardust Fragments around the star. Higher levels increase spawn rate and value.', level: 0, baseCost: 25, cost: 25, costIncrease: 1.5, baseEffect: 0.05, effect: (level) => level * 0.05, type: UpgradeType.Utility, currency: Currency.NebulaGas, maxLevel: 100, requirement: { upgradeId: 'gasHarvester', level: 1 }
  },
  nebulaCondenser: {
    id: 'nebulaCondenser', name: 'Nebula Condenser', description: 'Boosts all passive Nebula Gas generation by 20%.', level: 0, baseCost: 50, cost: 50, costIncrease: 2, baseEffect: 0.2, effect: (level) => 1 + level * 0.2, type: UpgradeType.Utility, currency: Currency.NebulaGas, requirement: { upgradeId: 'gasHarvester', level: 5 },
  },
  gasGiantSiphon: {
    id: 'gasGiantSiphon', name: 'Gas Giant Siphon', description: 'A new powerful source of passive Nebula Gas.', level: 0, baseCost: 100, cost: 100, costIncrease: 1.3, baseEffect: 1, effect: (level) => level * 1, type: UpgradeType.Passive, currency: Currency.NebulaGas, requirement: { upgradeId: 'gasHarvester', level: 15 },
  },
  cosmicForge: {
    id: 'cosmicForge', name: 'Cosmic Forge', description: 'Boosts Stardust click power by 1% of your Nebula Gas per second.', level: 0, baseCost: 250, cost: 250, costIncrease: 5, baseEffect: 0.01, effect: (level, state) => {
        if (!state) return 1;
        const nebulaPerSecond = state.upgrades.gasHarvester.effect(state.upgrades.gasHarvester.level) + state.upgrades.gasGiantSiphon.effect(state.upgrades.gasGiantSiphon.level);
        return 1 + (level * 0.01 * nebulaPerSecond);
    }, type: UpgradeType.Utility, currency: Currency.NebulaGas, requirement: { upgradeId: 'nebulaCondenser', level: 5 },
  },

   // Antimatter Upgrades
  prestigeBoost: {
    id: 'prestigeBoost', name: 'Cosmic Singularity', description: 'Permanently boosts all Stardust generation by 10% per level.', level: 0, baseCost: 1, cost: 1, costIncrease: 2, baseEffect: 0.1, effect: (level) => 1 + level * 0.1, type: UpgradeType.Prestige, currency: Currency.Antimatter,
  },
  prestigePower: {
    id: 'prestigePower', name: 'Prestige Power', description: 'Gain 10% more Antimatter when you Go Supernova.', level: 0, baseCost: 5, cost: 5, costIncrease: 3, baseEffect: 0.1, effect: (level) => 1 + level * 0.1, type: UpgradeType.Prestige, currency: Currency.Antimatter, requirement: { upgradeId: 'prestigeBoost', level: 1},
  },
  acceleratedLearning: {
    id: 'acceleratedLearning', name: 'Accelerated Learning', description: 'Reduces the cost of all Stardust upgrades by 2% per level.', level: 0, baseCost: 10, cost: 10, costIncrease: 4, baseEffect: 0.02, effect: (level) => 1 - level * 0.02, type: UpgradeType.Prestige, currency: Currency.Antimatter, requirement: { upgradeId: 'prestigeBoost', level: 3},
  },
};

const SAVE_KEY = 'cosmicClickerSave';

// FIX: Add return type to ensure the function returns a valid GameState object.
const getInitialState = (): GameState => {
    const upgradesCopy: Record<string, Upgrade> = {};
    for (const key of Object.keys(INITIAL_UPGRADES)) {
        upgradesCopy[key] = { ...INITIAL_UPGRADES[key] };
    }

    return {
        currencies: {
          [Currency.Stardust]: 0,
          [Currency.NebulaGas]: 0,
          [Currency.Antimatter]: 0,
        },
        upgrades: upgradesCopy,
        totalStardustEver: 0,
        stats: {
            totalClicks: 0,
            supernovaCount: 0,
            playTime: 0,
        },
        lastTick: Date.now(),
    };
};


// FIX: Add return type to ensure the function returns a valid GameState object.
const loadGameState = (): GameState => {
    try {
        const savedJson = localStorage.getItem(SAVE_KEY);
        if (!savedJson) return getInitialState();

        const savedState = JSON.parse(savedJson);
        const initialState = getInitialState();

        // Merge upgrades carefully to prevent issues with updates
        const currentUpgrades = initialState.upgrades;
        if (savedState.upgrades) {
            for (const id in currentUpgrades) {
                if (savedState.upgrades[id]) {
                    const savedLevel = savedState.upgrades[id].level;
                    currentUpgrades[id].level = savedLevel;
                    currentUpgrades[id].cost = Math.ceil(
                        currentUpgrades[id].baseCost * Math.pow(currentUpgrades[id].costIncrease, savedLevel)
                    );
                }
            }
        }
        
        return {
            ...initialState,
            currencies: savedState.currencies ?? initialState.currencies,
            totalStardustEver: savedState.totalStardustEver ?? initialState.totalStardustEver,
            stats: {
                ...initialState.stats,
                ...(savedState.stats ?? {}),
            },
            upgrades: currentUpgrades,
            lastTick: Date.now(), // Always reset lastTick to prevent huge offline gains on load
        };
    } catch (error) {
        console.error("Failed to load or parse saved state, starting fresh.", error);
        localStorage.removeItem(SAVE_KEY);
        return getInitialState();
    }
};


const App = () => {
  // FIX: Type the game state for type safety.
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  // FIX: Type the floating numbers state.
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  // FIX: Type the clickable orbs state.
  const [clickableOrbs, setClickableOrbs] = useState<ClickableOrb[]>([]);
  const [stardustPerSecond, setStardustPerSecond] = useState(0);
  // FIX: Type the history state.
  const [history, setHistory] = useState<HistoryData[]>([]);
  const lastHistoryUpdate = useRef(Date.now());

  const prestigeCost = 1e6; // 1 Million Stardust

  // --- Save Game State ---
  useEffect(() => {
    const saveInterval = setInterval(() => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        } catch (error) {
            console.error("Failed to save game state:", error);
        }
    }, 5000); // Save every 5 seconds

    window.addEventListener('beforeunload', () => {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    });

    return () => clearInterval(saveInterval);
  }, [gameState]);


  const getClickValue = useCallback(() => {
    const { upgrades } = gameState;
    const antimatterBoost = upgrades.prestigeBoost.effect(upgrades.prestigeBoost.level);
    const forgeBoost = upgrades.cosmicForge.effect(upgrades.cosmicForge.level, gameState);
    const baseClick = upgrades.clickPower1.effect(upgrades.clickPower1.level) + upgrades.clickPower2.effect(upgrades.clickPower2.level);
    return baseClick * antimatterBoost * forgeBoost;
  }, [gameState]);

  const handleStarClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const clickValue = getClickValue();
    setGameState(prev => ({
        ...prev,
        currencies: { ...prev.currencies, [Currency.Stardust]: prev.currencies[Currency.Stardust] + clickValue },
        totalStardustEver: prev.totalStardustEver + clickValue,
        stats: { ...prev.stats, totalClicks: prev.stats.totalClicks + 1 },
    }));

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newFloatingNumber = { id: Date.now() + Math.random(), value: `+${formatNumber(clickValue)}`, x, y, };
    setFloatingNumbers(current => [...current, newFloatingNumber]);
    setTimeout(() => {
        setFloatingNumbers(current => current.filter(n => n.id !== newFloatingNumber.id));
    }, 2000);
  }, [getClickValue]);
  
  const handleOrbClick = useCallback((orbId: number) => {
    const orb = clickableOrbs.find(o => o.id === orbId);
    if (!orb) return;

    setGameState(prev => ({
      ...prev,
      currencies: { ...prev.currencies, [Currency.Stardust]: prev.currencies[Currency.Stardust] + orb.value },
      totalStardustEver: prev.totalStardustEver + orb.value,
    }));
    
    setClickableOrbs(prev => prev.filter(o => o.id !== orbId));
  }, [clickableOrbs]);


  const handlePurchaseUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades[upgradeId];
      if (upgrade.level >= (upgrade.maxLevel ?? Infinity)) return prev;

      let cost = upgrade.cost;
      if (upgrade.currency === Currency.Stardust) {
        cost *= prev.upgrades.acceleratedLearning.effect(prev.upgrades.acceleratedLearning.level);
      }
      
      if (prev.currencies[upgrade.currency] < cost) return prev;

      const newLevel = upgrade.level + 1;
      const newCost = Math.ceil(upgrade.baseCost * Math.pow(upgrade.costIncrease, newLevel));

      return {
        ...prev,
        currencies: { ...prev.currencies, [upgrade.currency]: prev.currencies[upgrade.currency] - cost },
        upgrades: { ...prev.upgrades, [upgradeId]: { ...upgrade, level: newLevel, cost: newCost } },
      };
    });
  }, []);

  const handlePrestige = useCallback(() => {
    if (gameState.totalStardustEver < prestigeCost) return;
    
    const prestigePowerBoost = gameState.upgrades.prestigePower.effect(gameState.upgrades.prestigePower.level);
    const antimatterGained = Math.floor((Math.log10(gameState.totalStardustEver / prestigeCost)) + 1) * prestigePowerBoost;

    setGameState(prev => {
        const prestigeUpgrades: Record<string, Upgrade> = { ...prev.upgrades };
        Object.keys(INITIAL_UPGRADES).forEach(key => {
            if (INITIAL_UPGRADES[key].currency !== Currency.Antimatter) {
                prestigeUpgrades[key] = { ...INITIAL_UPGRADES[key] };
            }
        });

        return {
            ...prev,
            currencies: {
                [Currency.Stardust]: 0,
                [Currency.NebulaGas]: 0,
                [Currency.Antimatter]: prev.currencies[Currency.Antimatter] + antimatterGained,
            },
            upgrades: prestigeUpgrades,
            totalStardustEver: 0,
            stats: { ...prev.stats, supernovaCount: prev.stats.supernovaCount + 1 },
            lastTick: Date.now(),
        };
    });
    setClickableOrbs([]);
    setHistory([]);
  }, [gameState.totalStardustEver, gameState.upgrades]);

  const handleResetSave = useCallback(() => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser votre progression ? Cette action est irréversible.")) {
        localStorage.removeItem(SAVE_KEY);
        setGameState(getInitialState());
        setFloatingNumbers([]);
        setClickableOrbs([]);
        setStardustPerSecond(0);
        setHistory([]);
        lastHistoryUpdate.current = Date.now();
    }
  }, []);

  const gameTick = useCallback(() => {
    const now = Date.now();
    const timeDelta = (now - gameState.lastTick) / 1000;

    // --- Calculations based on current state ---
    const { upgrades } = gameState;
    const antimatterBoost = upgrades.prestigeBoost.effect(upgrades.prestigeBoost.level);
    const solarWindsBoost = upgrades.solarWinds.effect(upgrades.solarWinds.level);
    
    const probeProduction = upgrades.probe.effect(upgrades.probe.level) * upgrades.reinforcedProbes.effect(upgrades.reinforcedProbes.level);
    const asteroidProduction = upgrades.asteroidMining.effect(upgrades.asteroidMining.level) * upgrades.cometChasers.effect(upgrades.cometChasers.level);

    const sps = (probeProduction + asteroidProduction) * antimatterBoost * solarWindsBoost;
    setStardustPerSecond(sps);
    
    const nebulaCondenserBoost = upgrades.nebulaCondenser.effect(upgrades.nebulaCondenser.level);
    const nebulaPerSecond = (upgrades.gasHarvester.effect(upgrades.gasHarvester.level) + upgrades.gasGiantSiphon.effect(upgrades.gasGiantSiphon.level)) * nebulaCondenserBoost;
    
    // --- State Updates ---
    setGameState(prev => {
      // Handle orb spawning
      const collector = prev.upgrades.orbitalCollector;
      if (collector.level > 0 && clickableOrbs.length < 10) {
        const spawnChance = collector.effect(collector.level) * timeDelta;
        if (Math.random() < spawnChance) {
          const angle = Math.random() * 2 * Math.PI;
          const newOrb: ClickableOrb = {
            id: Date.now() + Math.random(),
            value: (sps + getClickValue()) * (5 + collector.level * 0.5),
            x: 50 + Math.cos(angle) * (40 + Math.random() * 5),
            y: 50 + Math.sin(angle) * (40 + Math.random() * 5),
          };
          setClickableOrbs(current => [...current, newOrb]);
        }
      }

      const newStardust = prev.currencies[Currency.Stardust] + sps * timeDelta;

      // Update history every second
      if (now - lastHistoryUpdate.current >= 1000) {
        lastHistoryUpdate.current = now;
        setHistory(prevHistory => {
          const newEntry: HistoryData = { timestamp: now, totalStardust: newStardust };
          const newHistory = [...prevHistory, newEntry];
          return newHistory.length > 60 ? newHistory.slice(1) : newHistory;
        });
      }

      return {
        ...prev,
        currencies: {
          [Currency.Stardust]: newStardust,
          [Currency.NebulaGas]: prev.currencies[Currency.NebulaGas] + nebulaPerSecond * timeDelta,
          [Currency.Antimatter]: prev.currencies[Currency.Antimatter],
        },
        totalStardustEver: prev.totalStardustEver + sps * timeDelta,
        stats: { ...prev.stats, playTime: prev.stats.playTime + timeDelta },
        lastTick: now,
      };
    });
  }, [gameState, clickableOrbs.length, getClickValue]);

  useGameLoop(gameTick, 100);

  // FIX: With gameState.upgrades being properly typed, Object.values returns Upgrade[] instead of unknown[], fixing the error.
  const starPowerLevel = useMemo(() => Object.values(gameState.upgrades)
// FIX: Explicitly type 'u' as 'Upgrade' to resolve type inference issues with Object.values.
    .filter((u: Upgrade) => u.currency === Currency.Stardust)
    // FIX: Explicitly type the accumulator 'sum' as 'number' to resolve the type error.
    .reduce((sum: number, u: Upgrade) => sum + u.level, 0), [gameState.upgrades]);

  const detailedStats: DetailedStats = useMemo(() => {
      const playTime = gameState.stats.playTime;
      const hours = Math.floor(playTime / 3600);
      const minutes = Math.floor((playTime % 3600) / 60);
      const seconds = Math.floor(playTime % 60);
      const formattedPlayTime = `${hours}h ${minutes}m ${seconds}s`;

      return {
          stardustPerSecond: stardustPerSecond,
          stardustPerClick: getClickValue(),
          totalClicks: gameState.stats.totalClicks,
          supernovaCount: gameState.stats.supernovaCount,
          playTime: formattedPlayTime,
          prestigeBonus: `${((gameState.upgrades.prestigeBoost.effect(gameState.upgrades.prestigeBoost.level) - 1) * 100).toFixed(0)}%`,
      }
  }, [stardustPerSecond, getClickValue, gameState.stats, gameState.upgrades]);

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(to bottom, #0f172a, black)'}}>
      <div style={{padding: '1rem 1rem 0 1rem', flexShr: 0}}>
        <Header currencies={gameState.currencies} />
      </div>
      <main style={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          padding: '1rem',
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <MainGameArea 
              onClick={handleStarClick} 
              floatingNumbers={floatingNumbers}
              starPowerLevel={starPowerLevel}
              clickableOrbs={clickableOrbs}
              onOrbClick={handleOrbClick}
            />
        </div>
        <div style={{overflow: 'hidden'}}>
            <UpgradesPanel 
              upgrades={gameState.upgrades} 
              onPurchase={handlePurchaseUpgrade} 
              currencies={gameState.currencies}
              onPrestige={handlePrestige}
              canPrestige={gameState.totalStardustEver >= prestigeCost}
              prestigeCost={prestigeCost}
              history={history}
              detailedStats={detailedStats}
              onResetSave={handleResetSave}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
