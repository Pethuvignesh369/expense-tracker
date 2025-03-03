// components/RupeeSvg.tsx
import React from 'react';

interface RupeeSvgProps {
  size?: number;
  className?: string;
}

export const RupeeSvg: React.FC<RupeeSvgProps> = ({ 
  size = 24, 
  className = "" 
}) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 7H9.5a4.5 4.5 0 1 0 0 9H13" />
    <path d="M16 16l-4-9" />
  </svg>
);