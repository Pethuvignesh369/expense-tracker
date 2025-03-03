// Custom Indian Rupee Icon Component
// Create this as components/icons/RupeeIcon.tsx

import React from 'react';

interface RupeeIconProps {
  className?: string;
}

export const RupeeIcon: React.FC<RupeeIconProps> = ({ className = "h-5 w-5" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 3h12M6 8h12M6 13l6 8M12 13H6M15 13c3 0 4-2 4-2V8c0-3-2-5-5-5H6" />
    </svg>
  );
};
