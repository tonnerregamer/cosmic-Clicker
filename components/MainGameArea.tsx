import React from 'react';
import { FloatingNumber, ClickableOrb } from '../types';
import { formatNumber } from '../utils/format';

interface MainGameAreaProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  floatingNumbers: FloatingNumber[];
  starPowerLevel: number;
  clickableOrbs: ClickableOrb[];
  onOrbClick: (id: number) => void;
}

const MainGameArea: React.FC<MainGameAreaProps> = ({ onClick, floatingNumbers, starPowerLevel, clickableOrbs, onOrbClick }) => {
  const hueShift = Math.min(starPowerLevel * 0.25, 45); 
  const baseHue = 50;
  
  const fromColor = `hsl(${baseHue - hueShift}, 100%, 60%)`;
  const viaColor = `hsl(${30 - hueShift}, 95%, 55%)`;
  const toColor = `hsl(${10 - hueShift}, 90%, 50%)`;

  const starStyle = {
    background: `radial-gradient(circle at 30% 30%, ${fromColor}, ${viaColor}, ${toColor})`,
  };

  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse pointer-events-none"></div>

       {/* Clickable Orbs */}
       {clickableOrbs.map(orb => (
        <button
          key={orb.id}
          onClick={() => onOrbClick(orb.id)}
          className="absolute w-12 h-12 rounded-full bg-yellow-300/80 backdrop-blur-sm border-2 border-yellow-200 shadow-lg shadow-yellow-400/30 animate-orb-pulse flex items-center justify-center text-black font-bold text-xs p-1 z-10"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          aria-label={`Click to collect ${formatNumber(orb.value)} stardust`}
        >
          +{formatNumber(orb.value)}
        </button>
      ))}

      <button
        onClick={onClick}
        className="relative w-3/4 h-3/4 rounded-full focus:outline-none transition-transform duration-100 ease-in-out active:scale-95 shadow-2xl shadow-yellow-500/30"
        aria-label="Click to generate stardust"
        style={starStyle}
      >
        {/* Star Core */}
        <div className="absolute inset-0 rounded-full bg-white/50 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] pointer-events-none"></div>
        {/* Star Flares */}
        <div className="absolute inset-2 rounded-full border-2 border-yellow-300/50 animate-spin-slow pointer-events-none"></div>
        <div className="absolute inset-4 rounded-full border-2 border-orange-400/30 animate-spin-slow-reverse pointer-events-none"></div>
        
        {/* Floating Numbers */}
        {floatingNumbers.map(num => (
          <div
            key={num.id}
            className="absolute font-orbitron text-2xl font-bold text-yellow-200 pointer-events-none animate-float-up"
            style={{ left: `${num.x}px`, top: `${num.y}px`, transform: 'translate(-50%, -50%)' }}
          >
            {num.value}
          </div>
        ))}
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 30s linear infinite; }

        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%) translateY(-50px);
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        @keyframes orb-pulse {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 1;
            }
        }
        .animate-orb-pulse {
            animation: orb-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MainGameArea;