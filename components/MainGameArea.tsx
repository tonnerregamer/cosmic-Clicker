import React from 'react';
import { formatNumber } from '../utils/format.ts';

const MainGameArea = ({ onClick, floatingNumbers, starPowerLevel, clickableOrbs, onOrbClick }) => {
  const hueShift = Math.min(starPowerLevel * 0.25, 45); 
  const baseHue = 50;
  
  const fromColor = `hsl(${baseHue - hueShift}, 100%, 60%)`;
  const viaColor = `hsl(${30 - hueShift}, 95%, 55%)`;
  const toColor = `hsl(${10 - hueShift}, 90%, 50%)`;

  const starStyle = {
    background: `radial-gradient(circle at 30% 30%, ${fromColor}, ${viaColor}, ${toColor})`,
    position: 'relative',
    width: '75%',
    height: '75%',
    borderRadius: '9999px',
    boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.3)',
    transition: 'transform 100ms ease-in-out',
  };
  
  const orbStyle = {
    position: 'absolute',
    width: '3rem',
    height: '3rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(253, 224, 71, 0.8)',
    backdropFilter: 'blur(4px)',
    border: '2px solid #fef08a',
    boxShadow: '0 10px 15px -3px rgba(250, 204, 21, 0.3), 0 4px 6px -2px rgba(250, 204, 21, 0.3)',
    animation: 'orb-pulse 2.5s ease-in-out infinite',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    padding: '0.25rem',
    zIndex: 10,
  };


  return (
    <div style={{position: 'relative', width: '100%', maxWidth: '32rem', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {/* Background Glow */}
      <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(250, 204, 21, 0.2)', filter: 'blur(48px)', borderRadius: '9999px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', pointerEvents: 'none'}}></div>

       {/* Clickable Orbs */}
       {clickableOrbs.map(orb => (
        <button
          key={orb.id}
          onClick={() => onOrbClick(orb.id)}
          className="animate-orb-pulse"
          style={{
            ...orbStyle,
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
        className="active-scale-95"
        aria-label="Click to generate stardust"
        style={starStyle}
      >
        {/* Star Core */}
        <div style={{position: 'absolute', inset: 0, borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.5)', animation: 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite', pointerEvents: 'none'}}></div>
        {/* Star Flares */}
        <div className="animate-spin-slow" style={{position: 'absolute', inset: '0.5rem', borderRadius: '9999px', border: '2px solid rgba(253, 224, 71, 0.5)', pointerEvents: 'none'}}></div>
        <div className="animate-spin-slow-reverse" style={{position: 'absolute', inset: '1rem', borderRadius: '9999px', border: '2px solid rgba(251, 146, 60, 0.3)', pointerEvents: 'none'}}></div>
        
        {/* Floating Numbers */}
        {floatingNumbers.map(num => (
          <div
            key={num.id}
            className="font-orbitron animate-float-up"
            style={{
                position: 'absolute',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fef08a',
                pointerEvents: 'none',
                left: `${num.x}px`,
                top: `${num.y}px`,
                transform: 'translate(-50%, -50%)'
            }}
          >
            {num.value}
          </div>
        ))}
      </button>

      <style>{`
        .active-scale-95:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default MainGameArea;