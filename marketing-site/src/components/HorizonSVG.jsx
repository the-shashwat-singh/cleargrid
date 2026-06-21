import React from 'react';

// A soft decorative SVG shape fixed behind everything
export default function HorizonSVG() {
  return (
    <svg 
      style={{
        position: 'fixed',
        top: '20vh',
        left: 0,
        width: '100vw',
        height: '80vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      viewBox="0 0 1440 800"
      preserveAspectRatio="none"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft curved hill/horizon shape matching light glass tones */}
      <path 
        d="M0 400 C 400 200, 1000 600, 1440 300 L 1440 800 L 0 800 Z" 
        fill="url(#horizonGrad)" 
        opacity="0.6"
      />
      <path 
        d="M0 600 C 600 300, 900 700, 1440 500 L 1440 800 L 0 800 Z" 
        fill="url(#horizonGrad2)" 
        opacity="0.4"
      />
      
      <defs>
        <linearGradient id="horizonGrad" x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#F8FAFC" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="horizonGrad2" x1="0" y1="0" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" />
          <stop offset="1" stopColor="#F1F5F9" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
