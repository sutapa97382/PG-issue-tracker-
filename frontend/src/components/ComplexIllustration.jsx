import React from 'react';

export const ComplexIllustration = () => {
  return (
    <div className="complex-illustration-container">
      <svg
        viewBox="0 0 640 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="complex-svg"
      >
        <defs>
          <filter id="neonComplexGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38bdf8" floodOpacity="0.35" />
          </filter>
          <linearGradient id="gridFadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Isometric Grid Floor Lines */}
        <g stroke="url(#gridFadeGrad)" strokeWidth="1" strokeDasharray="4 6" opacity="0.6">
          <line x1="40" y1="240" x2="320" y2="400" />
          <line x1="120" y1="190" x2="400" y2="350" />
          <line x1="200" y1="140" x2="480" y2="300" />
          <line x1="280" y1="90" x2="560" y2="250" />

          <line x1="600" y1="240" x2="320" y2="400" />
          <line x1="520" y1="190" x2="240" y2="350" />
          <line x1="440" y1="140" x2="160" y2="300" />
          <line x1="360" y1="90" x2="80" y2="250" />
        </g>

        {/* Outer Property Boundary Base (Rhombus Isometric Ground) */}
        <polygon
          points="320,110 570,240 320,380 70,240"
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Complex Buildings Group */}
        <g stroke="#38BDF8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonComplexGlow)">
          
          {/* ========================================================
              BUILDING 1: NORTH-WEST (Top-Left) L-SHAPED WING
             ======================================================== */}
          {/* Base */}
          <polygon points="260,150 310,175 270,195 240,180 200,200 160,180 200,160 220,170" strokeWidth="2" />
          {/* Walls Extrusion (Height -55px) */}
          <line x1="260" y1="150" x2="260" y2="95" />
          <line x1="310" y1="175" x2="310" y2="120" />
          <line x1="270" y1="195" x2="270" y2="140" />
          <line x1="240" y1="180" x2="240" y2="125" />
          <line x1="200" y1="200" x2="200" y2="145" />
          <line x1="160" y1="180" x2="160" y2="125" />
          <line x1="200" y1="160" x2="200" y2="105" />
          <line x1="220" y1="170" x2="220" y2="115" />
          {/* Roof */}
          <polygon points="260,95 310,120 270,140 240,125 200,145 160,125 200,105 220,115" strokeWidth="2.2" />
          {/* Roof details */}
          <polygon points="262,99 306,121 270,137 241,126 200,143 164,126 200,108 219,116" strokeWidth="1" opacity="0.6" />
          {/* Horizontal floor lines Wing 1 */}
          <path d="M 160 143 L 200 163 L 240 143 M 240 143 L 270 158 L 310 138" strokeWidth="1.2" opacity="0.8" />
          <path d="M 160 162 L 200 182 L 240 162 M 240 162 L 270 177 L 310 157" strokeWidth="1.2" opacity="0.8" />
          {/* Window grids on visible facades */}
          <line x1="180" y1="135" x2="180" y2="175" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="285" y1="132" x2="285" y2="170" strokeWidth="1" strokeDasharray="3 3" />

          {/* ========================================================
              BUILDING 2: SOUTH-WEST (Left Foreground) RESIDENTIAL BLOCK
             ======================================================== */}
          {/* Base */}
          <polygon points="100,240 190,285 240,260 150,215" strokeWidth="2" />
          {/* Vertical walls (-70px) */}
          <line x1="100" y1="240" x2="100" y2="170" />
          <line x1="190" y1="285" x2="190" y2="215" strokeWidth="2.2" />
          <line x1="240" y1="260" x2="240" y2="190" />
          <line x1="150" y1="215" x2="150" y2="145" />
          {/* Roof */}
          <polygon points="100,170 190,215 240,190 150,145" strokeWidth="2.4" />
          {/* Roof Parapet & HVAC */}
          <polygon points="105,173 186,213 234,189 153,149" strokeWidth="1.2" opacity="0.7" />
          <rect x="155" y="165" width="22" height="12" rx="2" strokeWidth="1.2" transform="rotate(-15 155 165)" />
          {/* Floors (4 stories) */}
          <path d="M 100 188 L 190 233 L 240 208" strokeWidth="1.4" />
          <path d="M 100 205 L 190 250 L 240 225" strokeWidth="1.4" />
          <path d="M 100 222 L 190 267 L 240 242" strokeWidth="1.4" />
          {/* Left facade windows & balconies */}
          <line x1="122" y1="181" x2="122" y2="235" strokeWidth="1.2" />
          <line x1="145" y1="192" x2="145" y2="246" strokeWidth="1.2" />
          <line x1="168" y1="204" x2="168" y2="258" strokeWidth="1.2" />
          {/* Small balconies */}
          <rect x="120" y="193" width="16" height="8" strokeWidth="1.2" />
          <rect x="143" y="205" width="16" height="8" strokeWidth="1.2" />
          <rect x="120" y="211" width="16" height="8" strokeWidth="1.2" />
          <rect x="143" y="223" width="16" height="8" strokeWidth="1.2" />
          {/* Right facade windows */}
          <line x1="205" y1="228" x2="205" y2="278" strokeWidth="1.2" />
          <line x1="222" y1="219" x2="222" y2="269" strokeWidth="1.2" />

          {/* ========================================================
              BUILDING 3: CENTRAL / COURTYARD TOWER & PLAZA WING
             ======================================================== */}
          {/* Base */}
          <polygon points="210,315 285,355 350,320 275,280" strokeWidth="2.2" />
          {/* Walls (-80px) */}
          <line x1="210" y1="315" x2="210" y2="235" />
          <line x1="285" y1="355" x2="285" y2="275" strokeWidth="2.4" />
          <line x1="350" y1="320" x2="350" y2="240" />
          <line x1="275" y1="280" x2="275" y2="200" />
          {/* Roof */}
          <polygon points="210,235 285,275 350,240 275,200" strokeWidth="2.4" />
          <polygon points="215,238 282,273 344,239 277,204" strokeWidth="1.2" opacity="0.7" />
          {/* Rooftop Garden / Structures */}
          <line x1="260" y1="225" x2="295" y2="242" strokeWidth="1.5" />
          <rect x="250" y="222" width="16" height="10" strokeWidth="1.2" />
          {/* Stories (5 stories) */}
          <path d="M 210 251 L 285 291 L 350 256" strokeWidth="1.4" />
          <path d="M 210 267 L 285 307 L 350 272" strokeWidth="1.4" />
          <path d="M 210 283 L 285 323 L 350 288" strokeWidth="1.4" />
          <path d="M 210 299 L 285 339 L 350 304" strokeWidth="1.4" />
          {/* Windows / Balcony Grids */}
          <line x1="235" y1="248" x2="235" y2="308" strokeWidth="1.2" />
          <line x1="260" y1="261" x2="260" y2="321" strokeWidth="1.2" />
          <line x1="306" y1="283" x2="306" y2="343" strokeWidth="1.2" />
          <line x1="328" y1="272" x2="328" y2="332" strokeWidth="1.2" />

          {/* ========================================================
              BUILDING 4: NORTH-EAST & EAST COURTYARD WING (Right)
             ======================================================== */}
          {/* Base */}
          <polygon points="360,250 450,295 490,275 490,225 430,195 380,220 410,235" strokeWidth="2" />
          {/* Walls (-65px) */}
          <line x1="360" y1="250" x2="360" y2="185" />
          <line x1="450" y1="295" x2="450" y2="230" strokeWidth="2.2" />
          <line x1="490" y1="275" x2="490" y2="210" />
          <line x1="490" y1="225" x2="490" y2="160" />
          <line x1="430" y1="195" x2="430" y2="130" />
          <line x1="380" y1="220" x2="380" y2="155" />
          {/* Roof */}
          <polygon points="360,185 450,230 490,210 490,160 430,130 380,155 410,170" strokeWidth="2.4" />
          {/* Floors */}
          <path d="M 360 206 L 450 251 L 490 231" strokeWidth="1.4" />
          <path d="M 360 228 L 450 273 L 490 253" strokeWidth="1.4" />
          {/* Windows */}
          <line x1="390" y1="200" x2="390" y2="260" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="420" y1="215" x2="420" y2="275" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="470" y1="220" x2="470" y2="270" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* ========================================================
              COURTYARD / PLAZA / INTERNAL WALKWAYS & TREES
             ======================================================== */}
          {/* Courtyard Walkway loop in between */}
          <polygon points="270,250 330,280 370,260 310,230" strokeWidth="1.4" strokeDasharray="4 4" opacity="0.7" />
          <line x1="230" y1="270" x2="270" y2="250" strokeWidth="1.2" />
          <line x1="330" y1="280" x2="360" y2="295" strokeWidth="1.2" />

          {/* Stylized trees in courtyard and perimeters */}
          {/* Courtyard Tree 1 */}
          <circle cx="295" cy="245" r="7" strokeWidth="1.5" />
          <line x1="295" y1="252" x2="295" y2="258" strokeWidth="1.5" />
          {/* Courtyard Tree 2 */}
          <circle cx="330" cy="260" r="8" strokeWidth="1.5" />
          <line x1="330" y1="268" x2="330" y2="274" strokeWidth="1.5" />

          {/* Perimeter Trees Left */}
          <circle cx="85" cy="255" r="9" strokeWidth="1.5" />
          <circle cx="115" cy="285" r="8" strokeWidth="1.5" />

          {/* Perimeter Trees Right */}
          <circle cx="510" cy="270" r="9" strokeWidth="1.5" />
          <circle cx="530" cy="245" r="8" strokeWidth="1.5" />

          {/* Front Entrance Pavement Lines */}
          <line x1="285" y1="355" x2="320" y2="375" strokeWidth="2" />
          <line x1="270" y1="363" x2="305" y2="383" strokeWidth="1.4" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
};
