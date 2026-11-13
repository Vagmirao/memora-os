import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  highlightCyan?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = false,
  highlightCyan = false,
  onClick,
}) => {
  const bgClass = elevated ? 'bg-[#1e2022]' : 'bg-[#121416]';
  const borderClass = highlightCyan
    ? 'border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
    : 'border-[#3b494b]/60';
  const hoverClass = onClick
    ? 'hover:border-[#00F0FF]/50 transition-colors cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${bgClass} border ${borderClass} ${hoverClass} rounded-[4px] p-4 ${className}`}
    >
      {children}
    </div>
  );
};
