import React from 'react';

interface SSPMSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SSPMSLogo: React.FC<SSPMSLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${className}`}
    >
      {/* Shopping Cart */}
      <g id="cart" transform="translate(50, 40)">
        {/* Cart body */}
        <path
          d="M 25 20 L 28 50 L 55 50 L 58 20 Z"
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Cart handle */}
        <path
          d="M 28 20 Q 41.5 0 55 20"
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Wheels */}
        <circle cx="35" cy="55" r="4.5" fill="#059669" />
        <circle cx="48" cy="55" r="4.5" fill="#059669" />

        {/* Items */}
        <rect x="30" y="30" width="8" height="12" fill="#f59e0b" rx="1.5" />
        <rect x="42" y="28" width="8" height="14" fill="#ec4899" rx="1.5" />
      </g>

      {/* Pasbest Icon Badge (Bottom Right) */}
      <g id="company-badge" transform="translate(120, 120)">
        {/* Background circle */}
        <circle cx="0" cy="0" r="35" fill="#0369a1" opacity="0.1" stroke="#0369a1" strokeWidth="2" />

        {/* Checkmark icon */}
        <path
          d="M -12 -5 L -4 8 L 15 -15"
          fill="none"
          stroke="#0369a1"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Company text */}
        <text
          x="0"
          y="28"
          fontFamily="Arial, sans-serif"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          fill="#0369a1"
        >
          PASBEST
        </text>
      </g>

      {/* Main Text */}
      <text
        x="100"
        y="180"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        textAnchor="middle"
        fill="#059669"
      >
        SSPMS
      </text>
    </svg>
  );
};

export default SSPMSLogo;
