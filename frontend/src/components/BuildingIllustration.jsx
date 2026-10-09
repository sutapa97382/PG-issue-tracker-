import React from 'react';

export const BuildingIllustration = () => {
  return (
    <div className="building-illustration-container">
      <svg
        viewBox="0 0 540 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="building-svg"
      >
        <defs>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
          </filter>
          <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#cyanGlow)">
          {/* Ground Base Line */}
          <path d="M 50 375 L 490 375" stroke="url(#groundGrad)" strokeWidth="2" />
          <path d="M 90 385 L 450 385" stroke="url(#groundGrad)" strokeWidth="1.2" opacity="0.6" />

          {/* BACKGROUND TREES - LEFT */}
          <g opacity="0.9">
            {/* Left Far Tree */}
            <path d="M 90 375 C 90 340 70 330 70 305 C 70 280 95 270 105 285 C 115 265 140 270 145 295 C 155 310 145 340 140 375" />
            <path d="M 115 375 V 325 M 115 345 L 100 330 M 115 340 L 130 325" strokeWidth="1.6" />

            {/* Left Foreground Tree */}
            <path d="M 125 375 C 125 350 110 340 115 320 C 120 300 145 295 155 310 C 170 295 190 310 185 335 C 195 350 180 375 175 375" />
            <path d="M 152 375 V 335 M 152 355 L 138 340 M 152 350 L 168 338" strokeWidth="1.6" />

            {/* Bushes Left Base */}
            <path d="M 120 375 C 115 365 130 360 140 365 C 150 358 165 360 170 368 C 178 360 195 365 195 375" fill="none" />
          </g>

          {/* BACKGROUND TREES - RIGHT */}
          <g opacity="0.9">
            {/* Right Foreground Tree */}
            <path d="M 365 375 C 365 355 350 345 355 325 C 360 300 385 300 395 315 C 410 300 430 310 425 335 C 435 350 420 375 415 375" />
            <path d="M 390 375 V 330 M 390 350 L 375 338 M 390 345 L 408 332" strokeWidth="1.6" />

            {/* Right Far Tree */}
            <path d="M 405 375 C 405 345 390 335 395 310 C 400 280 430 280 440 300 C 455 285 475 298 470 325 C 480 345 465 375 455 375" />
            <path d="M 438 375 V 320 M 438 340 L 420 328 M 438 335 L 455 322" strokeWidth="1.6" />

            {/* Bushes Right Base */}
            <path d="M 350 375 C 355 365 370 362 380 367 C 390 360 405 362 410 370 C 420 362 435 368 440 375" fill="none" />
          </g>

          {/* MAIN APARTMENT BUILDING (Isometric 2-point perspective) */}
          {/* Main Corner: (270, y) - Left Wall extends to (155, y), Right Wall extends to (375, y) */}

          {/* Base Floor Outline */}
          <path d="M 155 375 L 270 388 L 375 375 V 105 L 270 82 L 155 105 Z" strokeWidth="2.4" />

          {/* Central Corner Ridge */}
          <path d="M 270 82 V 388" strokeWidth="2.2" />

          {/* ROOFTOP STRUCTURE / PENTHOUSE / WATER TANK & EQUIPMENT */}
          <path d="M 205 105 L 205 70 L 270 54 L 330 70 L 330 105" strokeWidth="2" />
          <path d="M 270 54 V 82" strokeWidth="1.8" />
          <path d="M 220 74 L 270 62 L 315 74" strokeWidth="1.4" />
          {/* Roof HVAC / elevator overrun details */}
          <rect x="235" y="60" width="20" height="8" rx="1" strokeWidth="1.2" />
          <line x1="285" y1="62" x2="310" y2="68" strokeWidth="1.4" />

          {/* ROOF OVERHANG / CORNICE */}
          <path d="M 148 107 L 270 80 L 382 107" strokeWidth="2.5" />
          <path d="M 148 112 L 270 85 L 382 112" strokeWidth="1.5" />

          {/* FLOORS HORIZONTAL SLABS (6 Floors) */}
          {/* Floor 6 (Top) */}
          <path d="M 155 145 L 270 125 L 375 145" strokeWidth="1.8" />
          {/* Floor 5 */}
          <path d="M 155 190 L 270 170 L 375 190" strokeWidth="1.8" />
          {/* Floor 4 */}
          <path d="M 155 235 L 270 215 L 375 235" strokeWidth="1.8" />
          {/* Floor 3 */}
          <path d="M 155 280 L 270 260 L 375 280" strokeWidth="1.8" />
          {/* Floor 2 */}
          <path d="M 155 325 L 270 305 L 375 325" strokeWidth="1.8" />
          {/* Floor 1 (Ground Floor line) */}
          <path d="M 155 370 L 270 350 L 375 370" strokeWidth="1.8" />

          {/* ================= LEFT FACADE (Windows & Balconies) ================= */}
          {/* Left Vertical Architectural Column lines */}
          <path d="M 188 112 V 365" strokeWidth="1.4" opacity="0.8" />
          <path d="M 226 102 V 358" strokeWidth="1.4" opacity="0.8" />

          {/* Left Window Grids per floor */}
          {/* Floor 5 */}
          <rect x="162" y="118" width="20" height="20" strokeWidth="1.3" />
          <line x1="172" y1="118" x2="172" y2="138" strokeWidth="1" />
          <rect x="195" y="112" width="24" height="20" strokeWidth="1.3" />
          <line x1="207" y1="112" x2="207" y2="132" strokeWidth="1" />
          <rect x="233" y="106" width="28" height="20" strokeWidth="1.3" />
          <line x1="247" y1="106" x2="247" y2="126" strokeWidth="1" />

          {/* Floor 4 (Balcony extended) */}
          <rect x="162" y="163" width="20" height="20" strokeWidth="1.3" />
          <line x1="172" y1="163" x2="172" y2="183" strokeWidth="1" />
          {/* Balcony structure on middle left */}
          <path d="M 190 178 L 190 188 L 265 174 L 265 164" strokeWidth="1.8" />
          <path d="M 190 174 L 265 160" strokeWidth="1.2" />
          <line x1="205" y1="171" x2="205" y2="185" strokeWidth="1" />
          <line x1="225" y1="167" x2="225" y2="181" strokeWidth="1" />
          <line x1="245" y1="164" x2="245" y2="178" strokeWidth="1" />

          {/* Floor 3 */}
          <rect x="162" y="208" width="20" height="20" strokeWidth="1.3" />
          <line x1="172" y1="208" x2="172" y2="228" strokeWidth="1" />
          <rect x="195" y="202" width="24" height="20" strokeWidth="1.3" />
          <line x1="207" y1="202" x2="207" y2="222" strokeWidth="1" />
          <rect x="233" y="196" width="28" height="20" strokeWidth="1.3" />
          <line x1="247" y1="196" x2="247" y2="216" strokeWidth="1" />

          {/* Floor 2 (Balcony extended) */}
          <rect x="162" y="253" width="20" height="20" strokeWidth="1.3" />
          <line x1="172" y1="253" x2="172" y2="273" strokeWidth="1" />
          {/* Balcony structure */}
          <path d="M 190 268 L 190 278 L 265 264 L 265 254" strokeWidth="1.8" />
          <path d="M 190 264 L 265 250" strokeWidth="1.2" />
          <line x1="205" y1="261" x2="205" y2="275" strokeWidth="1" />
          <line x1="225" y1="257" x2="225" y2="271" strokeWidth="1" />
          <line x1="245" y1="254" x2="245" y2="268" strokeWidth="1" />

          {/* Floor 1 */}
          <rect x="162" y="298" width="20" height="20" strokeWidth="1.3" />
          <line x1="172" y1="298" x2="172" y2="318" strokeWidth="1" />
          <rect x="195" y="292" width="24" height="20" strokeWidth="1.3" />
          <line x1="207" y1="292" x2="207" y2="312" strokeWidth="1" />
          <rect x="233" y="286" width="28" height="20" strokeWidth="1.3" />
          <line x1="247" y1="286" x2="247" y2="306" strokeWidth="1" />

          {/* Ground Floor Windows & Left Entry */}
          <rect x="162" y="338" width="24" height="28" strokeWidth="1.5" />
          <line x1="174" y1="338" x2="174" y2="366" strokeWidth="1" />
          <rect x="198" y="332" width="26" height="28" strokeWidth="1.5" />
          <line x1="211" y1="332" x2="211" y2="360" strokeWidth="1" />

          {/* ================= RIGHT FACADE (Balconies & Windows) ================= */}
          {/* Right Vertical Columns */}
          <path d="M 305 98 V 360" strokeWidth="1.4" opacity="0.8" />
          <path d="M 342 108 V 365" strokeWidth="1.4" opacity="0.8" />

          {/* Floor 5 Balcony right */}
          <path d="M 275 128 L 275 142 L 338 132 L 338 118" strokeWidth="1.8" />
          <path d="M 275 124 L 338 114" strokeWidth="1.2" />
          <line x1="295" y1="126" x2="295" y2="139" strokeWidth="1" />
          <line x1="316" y1="123" x2="316" y2="136" strokeWidth="1" />
          {/* Window behind */}
          <rect x="348" y="118" width="20" height="20" strokeWidth="1.3" />
          <line x1="358" y1="118" x2="358" y2="138" strokeWidth="1" />

          {/* Floor 4 Balcony right */}
          <path d="M 275 173 L 275 187 L 338 177 L 338 163" strokeWidth="1.8" />
          <path d="M 275 169 L 338 159" strokeWidth="1.2" />
          <line x1="295" y1="171" x2="295" y2="184" strokeWidth="1" />
          <line x1="316" y1="168" x2="316" y2="181" strokeWidth="1" />
          {/* Window behind */}
          <rect x="348" y="163" width="20" height="20" strokeWidth="1.3" />
          <line x1="358" y1="163" x2="358" y2="183" strokeWidth="1" />

          {/* Floor 3 Balcony right */}
          <path d="M 275 218 L 275 232 L 338 222 L 338 208" strokeWidth="1.8" />
          <path d="M 275 214 L 338 204" strokeWidth="1.2" />
          <line x1="295" y1="216" x2="295" y2="229" strokeWidth="1" />
          <line x1="316" y1="213" x2="316" y2="226" strokeWidth="1" />
          {/* Window behind */}
          <rect x="348" y="208" width="20" height="20" strokeWidth="1.3" />
          <line x1="358" y1="208" x2="358" y2="228" strokeWidth="1" />

          {/* Floor 2 Balcony right */}
          <path d="M 275 263 L 275 277 L 338 267 L 338 253" strokeWidth="1.8" />
          <path d="M 275 259 L 338 249" strokeWidth="1.2" />
          <line x1="295" y1="261" x2="295" y2="274" strokeWidth="1" />
          <line x1="316" y1="258" x2="316" y2="271" strokeWidth="1" />
          {/* Window behind */}
          <rect x="348" y="253" width="20" height="20" strokeWidth="1.3" />
          <line x1="358" y1="253" x2="358" y2="273" strokeWidth="1" />

          {/* Floor 1 Balcony right */}
          <path d="M 275 308 L 275 322 L 338 312 L 338 298" strokeWidth="1.8" />
          <path d="M 275 304 L 338 294" strokeWidth="1.2" />
          <line x1="295" y1="306" x2="295" y2="319" strokeWidth="1" />
          <line x1="316" y1="303" x2="316" y2="316" strokeWidth="1" />
          {/* Window behind */}
          <rect x="348" y="298" width="20" height="20" strokeWidth="1.3" />
          <line x1="358" y1="298" x2="358" y2="318" strokeWidth="1" />

          {/* GROUND FLOOR MAIN ENTRANCE & CANOPY */}
          {/* Entrance Canopy / Porch */}
          <path d="M 240 338 L 270 342 L 300 338" strokeWidth="2.4" />
          <path d="M 235 342 L 270 347 L 305 342" strokeWidth="1.8" />
          {/* Entrance Doorway Glass */}
          <rect x="250" y="347" width="40" height="36" strokeWidth="1.8" />
          <line x1="270" y1="347" x2="270" y2="383" strokeWidth="1.5" />
          {/* Door Handles */}
          <line x1="266" y1="365" x2="266" y2="371" strokeWidth="1.6" />
          <line x1="274" y1="365" x2="274" y2="371" strokeWidth="1.6" />
          {/* Entrance Steps */}
          <path d="M 245 383 L 270 387 L 295 383" strokeWidth="1.6" />
          <path d="M 240 387 L 270 391 L 300 387" strokeWidth="1.2" />

          {/* Ground Floor Right Windows */}
          <rect x="312" y="332" width="26" height="28" strokeWidth="1.5" />
          <line x1="325" y1="332" x2="325" y2="360" strokeWidth="1" />
          <rect x="345" y="338" width="22" height="26" strokeWidth="1.5" />
          <line x1="356" y1="338" x2="356" y2="364" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
