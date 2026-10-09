import React from 'react';

export const HexagonLogo = () => {
  return (
    <div className="propmate-admin-logo">
      <div className="hexagon-badge">
        <svg
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hexagon-svg"
        >
          {/* Glowing cyan rounded hexagon outline */}
          <path
            d="M 27 4 L 47 15.5 V 38.5 L 27 50 L 7 38.5 V 15.5 Z"
            stroke="#22D3EE"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Inner 360 degree text with curve */}
          <text
            x="27"
            y="28"
            fill="#38BDF8"
            fontSize="11"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
            letterSpacing="-0.5"
          >
            360°
          </text>

          {/* Rotating circular arrows around 360 */}
          <path
            d="M 16 27 C 16 21 21 16 27 16 C 33 16 38 21 38 27"
            stroke="#00E5FF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M 35 24 L 38 27 L 41 24" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          <path
            d="M 38 27 C 38 33 33 38 27 38 C 21 38 16 33 16 27"
            stroke="#00E5FF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M 19 30 L 16 27 L 13 30" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="logo-brand-text">PropMate 360</span>
    </div>
  );
};
