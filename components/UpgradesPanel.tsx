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
  onResetSave: () => void;
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
      className="tab-button"
      data-active={activeTab === tab}
      aria-pressed={activeTab === tab}
    >
      <style>{`
        .tab-button {
          display: flex;
          flex: 1 1 0%;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: bold;
          border-bottom: 2px solid;
          transition: color 200ms, border-color 200ms;
          border-color: transparent;
          color: #94a3b8;
        }
        .tab-button:hover {
          color: #67e8f9;
        }
        .tab-button[data-active="true"] {
          border-color: #22d3ee;
          color: #22d3ee;
        }
      `}</style>
        <div style={{width: '1.25rem', height: '1.25rem', pointerEvents: 'none'}}>{icon}</div>
        <span style={{pointerEvents: 'none'}}>{tab}</span>
    </button>
);

const StatDisplay: React.FC<{label: string, value: string | number}> = ({ label, value }) => (
    <div style={{backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <dt style={{fontSize: '0.875rem', color: '#94a3b8'}}>{label}</dt>
        <dd className="font-orbitron" style={{fontWeight: 'bold', color: '#67e8f9'}}>{value}</dd>
    </div>
);

const StatsPanel: React.FC<{ data: HistoryData[], stats: DetailedStats, onReset: () => void }> = ({ data, stats, onReset }) => {
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
        <div style={{padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
                <h3 className="font-orbitron" style={{fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'center', color: '#67e8f9'}}>Stardust Total</h3>
                {data.length < 2 ? (
                    <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>Collecte des données...</div>
                ) : (
                    <div style={{position: 'relative', height: '6rem'}}>
                        <svg viewBox={`0 0 300 100`} style={{width: '100%', height: '100%'}} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                            <path d={'M ' + pathData} fill="none" stroke="#06b6d4" strokeWidth="2" />
                            <path d={`M ${pathData.split(' ')[0]} L ${pathData} L 300,100 L 0,100 Z`} fill="url(#areaGradient)" />
                        </svg>
                        <div style={{position: 'absolute', top: 0, left: 0, fontSize: '0.75rem', color: '#94a3b8'}}>{formatNumber(maxY)}</div>
                        <div style={{position: 'absolute', bottom: 0, left: 0, fontSize: '0.75rem', color: '#94a3b8'}}>{formatNumber(minY)}</div>
                    </div>
                )}
            </div>
            <dl style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <StatDisplay label="Stardust/sec" value={formatNumber(stats.stardustPerSecond)} />
                <StatDisplay label="Stardust/clic" value={formatNumber(stats.stardustPerClick)} />
                <StatDisplay label="Bonus de Prestige" value={stats.prestigeBonus} />
                <StatDisplay label="Clics totaux" value={formatNumber(stats.totalClicks)} />
                <StatDisplay label="Supernovas" value={stats.supernovaCount} />
                <StatDisplay label="Temps de jeu" value={stats.playTime} />
            </dl>
            <div style={{paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #334155'}}>
              <button
                onClick={onReset}
                className="button-reset"
              >
                <style>{`
                  .button-reset {
                    width: 100%;
                    background-color: #4b5563;
                    color: white;
                    font-weight: bold;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 200ms;
                  }
                  .button-reset:hover {
                    background-color: #6b7280;
                  }
                `}</style>
                Réinitialiser la Sauvegarde
              </button>
            </div>
        </div>
    );
};

const UpgradesPanel: React.FC<UpgradesPanelProps> = ({ upgrades, onPurchase, currencies, onPrestige, canPrestige, prestigeCost, history, detailedStats, onResetSave }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Currency.Stardust);

  const isUpgradeUnlocked = (upgrade: Upgrade) => {
    if (!upgrade.requirement) return true;
    const requiredUpgrade = upgrades[upgrade.requirement.upgradeId];
    return requiredUpgrade && requiredUpgrade.level >= upgrade.requirement.level;
  };
  
  const filteredUpgrades = Object.values(upgrades)
    .filter((u: Upgrade) => u.currency === activeTab && isUpgradeUnlocked(u));

  return (
    <div style={{backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #334155', height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', borderBottom: '1px solid #334155'}}>
        <TabButton tab={Currency.Stardust} activeTab={activeTab} onClick={setActiveTab} icon={<StardustIcon />} />
        <TabButton tab={Currency.NebulaGas} activeTab={activeTab} onClick={setActiveTab} icon={<NebulaGasIcon />} />
        <TabButton tab={Currency.Antimatter} activeTab={activeTab} onClick={setActiveTab} icon={<AntimatterIcon />} />
        <TabButton tab={'Stats'} activeTab={activeTab} onClick={setActiveTab} icon={<StatsIcon />} />
      </div>

      <div style={{flexGrow: 1, overflowY: 'auto'}}>
        {activeTab !== Currency.Antimatter && activeTab !== 'Stats' && (
          <div style={{padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {filteredUpgrades.map((upgrade: Upgrade) => (
              <UpgradeButton key={upgrade.id} upgrade={upgrade} onPurchase={onPurchase} canAfford={currencies[upgrade.currency] >= upgrade.cost}/>
            ))}
          </div>
        )}

        {activeTab === 'Stats' && <StatsPanel data={history} stats={detailedStats} onReset={onResetSave} />}

        {activeTab === Currency.Antimatter && (
            <div style={{padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <div style={{backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.5)'}}>
                    <h3 className="font-orbitron" style={{fontSize: '1.125rem', color: '#f87171'}}>SUPERNOVA</h3>
                    <p style={{fontSize: '0.875rem', color: '#d1d5db', marginTop: '0.5rem'}}>Réinitialisez votre progression pour gagner de l'Antimatière et débloquer de puissantes améliorations permanentes.</p>
                    <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem'}}>Requiert {formatNumber(prestigeCost)} Stardust total.</p>
                    <button 
                        onClick={onPrestige}
                        disabled={!canPrestige}
                        className="supernova-button"
                    >
                      <style>{`
                        .supernova-button {
                          margin-top: 1rem;
                          width: 100%;
                          background-color: #dc2626;
                          color: white;
                          font-weight: bold;
                          padding: 0.5rem 1rem;
                          border-radius: 0.5rem;
                          transition: all 200ms;
                          box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.2);
                        }
                        .supernova-button:hover:not(:disabled) {
                          background-color: #ef4444;
                        }
                        .supernova-button:disabled {
                          background-color: #991b1b;
                          color: #94a3b8;
                          cursor: not-allowed;
                          box-shadow: none;
                        }
                      `}</style>
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