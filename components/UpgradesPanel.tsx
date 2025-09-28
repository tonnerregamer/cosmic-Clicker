import React, { useState } from 'react';
import { Upgrade, Currency, HistoryData, DetailedStats } from '../types';
import UpgradeButton from './UpgradeButton';
import { formatNumber } from '../utils/format';
import { StardustIcon, NebulaGasIcon, AntimatterIcon, StatsIcon } from './icons';

interface UpgradesPanelProps {
  upgrades: Record<string, Upgrade>;
  onPurchase: (upgradeId: string) => void;
  currencies: { [key in Currency]: number };
  onPrestige: () => void;
  canPrestige: boolean;
  prestigeCost: number;
  history: HistoryData[];
  detailedStats: DetailedStats;
}

type Tab = Currency | 'Stats';

interface TabButtonProps {
    tab: Tab;
    activeTab: Tab;
    onClick: (tab: Tab) => void;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, onClick, icon }) => (
    <button
      onClick={() => onClick(tab)}
      className={`flex flex-1 items-center justify-center space-x-2 p-3 text-sm font-bold border-b-2 transition-colors duration-200 ${
        activeTab === tab
          ? 'border-cyan-400 text-cyan-400'
          : 'border-transparent text-slate-400 hover:text-cyan-300'
      }`}
      aria-pressed={activeTab === tab}
    >
        <div className="w-5 h-5 pointer-events-none">{icon}</div>
        <span className="pointer-events-none">{tab}</span>
    </button>
);

const StatDisplay: React.FC<{label: string, value: string | number}> = ({ label, value }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-baseline">
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="font-orbitron font-bold text-cyan-300">{value}</dd>
    </div>
);

const StatsPanel: React.FC<{ data: HistoryData[], stats: DetailedStats }> = ({ data, stats }) => {
    const points = data.map(d => d.totalStardust);
    const maxY = Math.max(...points, 1);
    const minY = data.length > 0 ? Math.min(...points) : 0;
    const range = maxY - minY;

    const getPathData = () => {
        if (range <= 0) return 'M 0,50 L 300,50'; // Flat line in the middle if no change
        return points.map((p, i) => {
            const x = (i / (points.length - 1)) * 300;
            const y = 100 - ((p - minY) / range) * 100;
            return `${x},${y}`;
        }).join(' L ');
    };
    
    const pathData = data.length < 2 ? 'M 0,50 L 300,50' : getPathData();

    return (
        <div className="p-4 space-y-4">
            <div>
                <h3 className="font-orbitron text-lg mb-2 text-center text-cyan-300">Stardust Total</h3>
                {data.length < 2 ? (
                    <div className="text-center p-8 text-slate-400">Collecte des données...</div>
                ) : (
                    <div className="relative h-24">
                        <svg viewBox={`0 0 300 100`} className="w-full h-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                            <path d={'M ' + pathData} fill="none" stroke="#06b6d4" strokeWidth="2" />
                            <path d={`M ${pathData.split(' ')[0]} L ${pathData} L 300,100 L 0,100 Z`} fill="url(#areaGradient)" />
                        </svg>
                        <div className="absolute top-0 left-0 text-xs text-slate-400">{formatNumber(maxY)}</div>
                        <div className="absolute bottom-0 left-0 text-xs text-slate-400">{formatNumber(minY)}</div>
                    </div>
                )}
            </div>
            <dl className="space-y-2">
                <StatDisplay label="Stardust/sec" value={formatNumber(stats.stardustPerSecond)} />
                <StatDisplay label="Stardust/clic" value={formatNumber(stats.stardustPerClick)} />
                <StatDisplay label="Bonus de Prestige" value={stats.prestigeBonus} />
                <StatDisplay label="Clics totaux" value={formatNumber(stats.totalClicks)} />
                <StatDisplay label="Supernovas" value={stats.supernovaCount} />
                <StatDisplay label="Temps de jeu" value={stats.playTime} />
            </dl>
        </div>
    );
};

const UpgradesPanel: React.FC<UpgradesPanelProps> = ({ upgrades, onPurchase, currencies, onPrestige, canPrestige, prestigeCost, history, detailedStats }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Currency.Stardust);

  const isUpgradeUnlocked = (upgrade: Upgrade) => {
    if (!upgrade.requirement) return true;
    const requiredUpgrade = upgrades[upgrade.requirement.upgradeId];
    return requiredUpgrade && requiredUpgrade.level >= upgrade.requirement.level;
  };
  
  const filteredUpgrades = Object.values(upgrades)
    .filter((u: Upgrade) => u.currency === activeTab && isUpgradeUnlocked(u));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 h-full flex flex-col max-h-[80vh]">
      <div className="flex border-b border-slate-700">
        <TabButton tab={Currency.Stardust} activeTab={activeTab} onClick={setActiveTab} icon={<StardustIcon />} />
        <TabButton tab={Currency.NebulaGas} activeTab={activeTab} onClick={setActiveTab} icon={<NebulaGasIcon />} />
        <TabButton tab={Currency.Antimatter} activeTab={activeTab} onClick={setActiveTab} icon={<AntimatterIcon />} />
        <TabButton tab={'Stats'} activeTab={activeTab} onClick={setActiveTab} icon={<StatsIcon />} />
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab !== Currency.Antimatter && activeTab !== 'Stats' && (
          <div className="p-4 space-y-3">
            {filteredUpgrades.map((upgrade: Upgrade) => (
              <UpgradeButton key={upgrade.id} upgrade={upgrade} onPurchase={onPurchase} canAfford={currencies[upgrade.currency] >= upgrade.cost}/>
            ))}
          </div>
        )}

        {activeTab === 'Stats' && <StatsPanel data={history} stats={detailedStats} />}

        {activeTab === Currency.Antimatter && (
            <div className="p-4 space-y-3">
                <div className="bg-slate-900/50 p-4 rounded-lg text-center border border-red-500/50">
                    <h3 className="font-orbitron text-lg text-red-400">SUPERNOVA</h3>
                    <p className="text-sm text-slate-300 mt-2">Réinitialisez votre progression pour gagner de l'Antimatière et débloquer de puissantes améliorations permanentes.</p>
                    <p className="text-xs text-slate-400 mt-2">Requiert {formatNumber(prestigeCost)} Stardust total.</p>
                    <button 
                        onClick={onPrestige}
                        disabled={!canPrestige}
                        className="mt-4 w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 disabled:shadow-none"
                    >
                        Go Supernova
                    </button>
                </div>
                {filteredUpgrades.map((upgrade: Upgrade) => (
                    <UpgradeButton key={upgrade.id} upgrade={upgrade} onPurchase={onPurchase} canAfford={currencies[upgrade.currency] >= upgrade.cost}/>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default UpgradesPanel;