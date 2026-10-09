import React from 'react';

export const DotPattern = () => {
  return (
    <div className="halftone-dots-wrapper" aria-hidden="true">
      <svg
        className="halftone-svg"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="dotFade" cx="15%" cy="85%" r="80%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#081636" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Render a grid of dots with varying sizes according to distance */}
        {Array.from({ length: 14 }).map((_, row) =>
          Array.from({ length: 14 }).map((_, col) => {
            const cx = 15 + col * 22;
            const cy = 295 - row * 22;
            // distance from bottom left (0, 320)
            const dist = Math.sqrt(Math.pow(col, 2) + Math.pow(row, 2));
            if (dist > 14) return null;
            const radius = Math.max(0.8, 3.2 - dist * 0.18);
            const opacity = Math.max(0.04, 0.45 - dist * 0.03);

            return (
              <circle
                key={`${row}-${col}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill="#38BDF8"
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
