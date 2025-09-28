import React from 'react';
// FIX: Import the Upgrade type to use in component props.
import { Currency, Upgrade } from '../types.js';
import { formatNumber } from '../utils/format.js';
import { StardustIcon, NebulaGasIcon, AntimatterIcon } from './icons.js';

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
    case Currency.Stardust:
      return <StardustIcon />;
    case Currency.NebulaGas:
      return <NebulaGasIcon />;
    case Currency.Antimatter:
      return <AntimatterIcon />;
  }
};

const getCurrencyColor = (currency: string) => {
  switch (currency) {
    case Currency.Stardust:
      return '#fde047'; // text-yellow-300
    case Currency.NebulaGas:
      return '#d8b4fe'; // text-purple-300
    case Currency.Antimatter:
      return '#f87171'; // text-red-400
  }
}

// FIX: Define an interface for the component's props for type safety.
interface UpgradeButtonProps {
  upgrade: Upgrade;
  onPurchase: (id: string) => void;
  canAfford: boolean;
}

// FIX: Explicitly type the component as React.FC to ensure special props like 'key' are handled correctly.
const UpgradeButton: React.FC<UpgradeButtonProps> = ({ upgrade, onPurchase, canAfford }) => {
  const isMaxLevel = upgrade.maxLevel && upgrade.level >= upgrade.maxLevel;

  return (
    <button
      onClick={() => onPurchase(upgrade.id)}
      disabled={!canAfford || isMaxLevel}
      className="upgrade-button"
    >
      <style>{`
        .upgrade-button {
          width: 100%;
          text-align: left;
          padding: 0.75rem;
          background-color: rgba(15, 23, 42, 0.5);
          border-radius: 0.5rem;
          border: 1px solid #334155;
          transition: all 200ms;
        }
        .upgrade-button:hover:not(:disabled) {
          background-color: rgba(51, 65, 85, 0.5);
          border-color: #22d3ee;
        }
        .upgrade-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <div style={{pointerEvents: 'none'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h4 className="font-orbitron" style={{fontWeight: 'bold'}}>{upgrade.name}</h4>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: isMaxLevel ? '#16a34a' : '#334155',
            color: isMaxLevel ? 'white' : 'inherit'
          }}>
              {isMaxLevel ? 'MAX' : `Lvl ${upgrade.level}`}
          </span>
        </div>
        <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>{upgrade.description}</p>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontWeight: 600, color: getCurrencyColor(upgrade.currency)}}>
          {!isMaxLevel && (
              <>
                  <div style={{width: '1rem', height: '1rem'}}>{getCurrencyIcon(upgrade.currency)}</div>
                  <span>{formatNumber(upgrade.cost)}</span>
              </>
          )}
        </div>
      </div>
    </button>
  );
};

export default UpgradeButton;