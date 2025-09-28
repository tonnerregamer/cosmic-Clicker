import React from 'react';
import { Currency } from '../types.ts';
import { StardustIcon, NebulaGasIcon, AntimatterIcon } from './icons.tsx';
import { formatNumber } from '../utils/format.ts';

const CurrencyDisplay = ({ icon, amount, name, color }) => (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(4px)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #334155', color}}>
        <div style={{width: '2rem', height: '2rem'}}>{icon}</div>
        <div>
            <div className="font-orbitron" style={{fontSize: '1.25rem', lineHeight: 'none'}}>{formatNumber(amount)}</div>
            <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{name}</div>
        </div>
    </div>
);


const Header = ({ currencies }) => {
  return (
    <header style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
      <style>{`
        @media (min-width: 640px) {
          header {
            flex-direction: row;
            gap: 1rem;
          }
        }
      `}</style>
      <h1 className="font-orbitron" style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#67e8f9', textShadow: '0 0 8px rgba(107,235,242,0.5)'}}>
         <style>{`
            @media (min-width: 1024px) {
              h1 {
                font-size: 2.25rem;
              }
            }
        `}</style>
        Cosmic Clicker
      </h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem'}}>
        <style>{`
            @media (min-width: 768px) {
              div[style*="grid-template-columns"] {
                gap: 1rem;
              }
            }
        `}</style>
        <CurrencyDisplay
            icon={<StardustIcon />}
            amount={currencies[Currency.Stardust]}
            name="Stardust"
            color="#fde047"
        />
        <CurrencyDisplay
            icon={<NebulaGasIcon />}
            amount={currencies[Currency.NebulaGas]}
            name="Nebula Gas"
            color="#d8b4fe"
        />
        <CurrencyDisplay
            icon={<AntimatterIcon />}
            amount={currencies[Currency.Antimatter]}
            name="Antimatter"
            color="#f87171"
        />
      </div>
    </header>
  );
};

export default Header;