import React from 'react';
import { Upgrade, Currency } from '../types';
import { formatNumber } from '../utils/format';
import { StardustIcon, NebulaGasIcon, AntimatterIcon } from './icons';

interface UpgradeButtonProps {
  upgrade: Upgrade;
  onPurchase: (upgradeId: string) => void;
  canAfford: boolean;
}

const getCurrencyIcon = (currency: Currency) => {
  switch (currency) {
    case Currency.Stardust:
      return <StardustIcon />;
    case Currency.NebulaGas:
      return <NebulaGasIcon />;
    case Currency.Antimatter:
      return <AntimatterIcon />;
  }
};

const getCurrencyColor = (currency: Currency) => {
  switch (currency) {
    case Currency.Stardust:
      return 'text-yellow-300';
    case Currency.NebulaGas:
      return 'text-purple-300';
    case Currency.Antimatter:
      return 'text-red-400';
  }
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ upgrade, onPurchase, canAfford }) => {
  const isMaxLevel = upgrade.maxLevel && upgrade.level >= upgrade.maxLevel;

  return (
    <button
      onClick={() => onPurchase(upgrade.id)}
      disabled={!canAfford || isMaxLevel}
      className="w-full text-left p-3 bg-slate-900/50 rounded-lg border border-slate-700 transition-all duration-200 hover:bg-slate-700/50 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700"
    >
      <div className="pointer-events-none">
        <div className="flex justify-between items-center">
          <h4 className="font-bold font-orbitron">{upgrade.name}</h4>
          <span className={`text-sm font-semibold px-2 py-1 rounded ${isMaxLevel ? 'bg-green-600 text-white' : 'bg-slate-700'}`}>
              {isMaxLevel ? 'MAX' : `Lvl ${upgrade.level}`}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{upgrade.description}</p>
        <div className={`flex items-center space-x-2 mt-2 font-semibold ${getCurrencyColor(upgrade.currency)}`}>
          {!isMaxLevel && (
              <>
                  <div className="w-4 h-4">{getCurrencyIcon(upgrade.currency)}</div>
                  <span>{formatNumber(upgrade.cost)}</span>
              </>
          )}
        </div>
      </div>
    </button>
  );
};

export default UpgradeButton;