import React from 'react';

export const PropMateLogo = () => {
  return (
    <div className="propmate-logo">
      <span className="logo-brand">PropMate</span>
      <span className="logo-number">360</span>
      <div className="logo-icon-badge">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-icon-svg"
        >
          {/* Circular 360 arrow ring */}
          <path
            d="M 24 6 C 33.94 6 42 14.06 42 24 C 42 27.2 41.15 30.2 39.68 32.8"
            stroke="#22D3EE"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Top Arrow */}
          <path
            d="M 21 2 L 26 6 L 21 10"
            stroke="#22D3EE"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 24 42 C 14.06 42 6 33.94 6 24 C 6 20.8 6.85 17.8 8.32 15.2"
            stroke="#00E5FF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Bottom Arrow */}
          <path
            d="M 27 46 L 22 42 L 27 38"
            stroke="#00E5FF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Architectural Buildings */}
          {/* Center Tall Building */}
          <path
            d="M 21 34 V 16 L 24 13 L 27 16 V 34"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <line x1="24" y1="14" x2="24" y2="34" stroke="#FFFFFF" strokeWidth="1.4" />

          {/* Left Building */}
          <path
            d="M 15 34 V 20 L 19 18 V 34"
            stroke="#22D3EE"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Right Building */}
          <path
            d="M 29 34 V 18 L 33 20 V 34"
            stroke="#22D3EE"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Ground Baseline */}
          <line x1="12" y1="34" x2="36" y2="34" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};
