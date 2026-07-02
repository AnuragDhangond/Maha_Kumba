import React from 'react';
import '../styles/HeadingOrnament.css';
import trishulLogo from '../assets/trishul_logoo.png';
import OptimizedImage from './OptimizedImage';

const ornaments = {
    flower: (
        <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet">
            {/* Left Line */}
            <line x1="0" y1="20" x2="150" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Left Swooshes */}
            <path d="M 155 20 C 130 20 120 12 100 12 C 120 12 140 15 160 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M 145 25 C 130 25 125 30 115 30 C 130 30 140 28 150 35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Right Line */}
            <line x1="250" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Right Swooshes */}
            <path d="M 245 20 C 270 20 280 12 300 12 C 280 12 260 15 240 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M 255 25 C 270 25 275 30 285 30 C 270 30 260 28 250 35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Center Diamonds/Teardrops */}
            <path d="M 200 2 L 205 18 L 195 18 Z" fill="currentColor" />
            <path d="M 200 38 L 204 22 L 196 22 Z" fill="currentColor" />
            <circle cx="200" cy="20" r="2.5" fill="currentColor" />

            {/* Inner Dots */}
            <circle cx="185" cy="18" r="1.5" fill="currentColor" />
            <circle cx="215" cy="18" r="1.5" fill="currentColor" />
        </svg>
    ),
    leaf: (
        <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet">
            <line x1="0" y1="20" x2="160" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="240" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 170 20 Q 200 -5 230 20 Q 200 45 170 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="20" r="4" fill="currentColor" />
            <path d="M 180 20 Q 200 10 220 20" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 180 20 Q 200 30 220 20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
    ),
    diamond: (
        <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet">
            <line x1="0" y1="20" x2="170" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="230" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="2" />
            <rect x="190" y="10" width="20" height="20" transform="rotate(45 200 20)" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="195" y="15" width="10" height="10" transform="rotate(45 200 20)" fill="currentColor" />
            <circle cx="180" cy="20" r="2" fill="currentColor" />
            <circle cx="220" cy="20" r="2" fill="currentColor" />
        </svg>
    ),
    swirl: (
        <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet">
            <path d="M 0 20 H 150 C 170 20 170 10 180 10 C 190 10 190 30 200 30 C 210 30 210 10 220 10 C 230 10 230 20 250 20 H 400" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="20" r="3" fill="currentColor" />
            <circle cx="180" cy="20" r="2" fill="currentColor" />
            <circle cx="220" cy="20" r="2" fill="currentColor" />
        </svg>
    ),
    dot: (
        <svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet">
            <line x1="0" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="260" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="20" r="5" fill="currentColor" />
            <circle cx="175" cy="20" r="3" fill="currentColor" />
            <circle cx="225" cy="20" r="3" fill="currentColor" />
            <circle cx="155" cy="20" r="2" fill="currentColor" />
            <circle cx="245" cy="20" r="2" fill="currentColor" />
        </svg>
    ),
    trishul: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '400px', height: '40px' }}>
            <div style={{ flex: 1, height: '2px', background: 'currentColor', opacity: 0.6 }}></div>
            <img 
                src={trishulLogo} 
                alt="Trishul" 
                className="ornament-icon-img"
            />
            <div style={{ flex: 1, height: '2px', background: 'currentColor', opacity: 0.6 }}></div>
        </div>
    )
};

const HeadingOrnament = ({ variant = 'flower', className = '' }) => {
    return (
        <div className={`heading-ornament ${className}`} aria-hidden="true">
            {ornaments[variant] || ornaments['flower']}
        </div>
    );
};

export default HeadingOrnament;
