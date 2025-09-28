import React from 'react';
import { Currency } from '../types';
import { StardustIcon, NebulaGasIcon, AntimatterIcon } from './icons';
import { formatNumber } from '../utils/format';

interface HeaderProps {
  currencies: {
    [Currency.Stardust]: number;
    [Currency.NebulaGas]: number;
    [Currency.Antimatter]: number;
  };
}

const CurrencyDisplay: React.FC<{ icon: React.ReactNode; amount: number; name: string; className?: string }> = ({ icon, amount, name, className }) => (
    <div className={`flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700 ${className}`}>
        <div className="w-8 h-8">{icon}</div>
        <div>
            <div className="font-orbitron text-xl leading-none">{formatNumber(amount)}</div>
            <div className="text-xs text-slate-400">{name}</div>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ currencies }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <h1 className="text-3xl lg:text-4xl font-orbitron font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(107,235,242,0.5)]">
        Cosmic Clicker
      </h1>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <CurrencyDisplay
            icon={<StardustIcon />}
            amount={currencies[Currency.Stardust]}
            name="Stardust"
            className="text-yellow-300"
        />
        <CurrencyDisplay
            icon={<NebulaGasIcon />}
            amount={currencies[Currency.NebulaGas]}
            name="Nebula Gas"
            className="text-purple-300"
        />
        <CurrencyDisplay
            icon={<AntimatterIcon />}
            amount={currencies[Currency.Antimatter]}
            name="Antimatter"
            className="text-red-400"
        />
      </div>
    </header>
  );
};

export default Header;
