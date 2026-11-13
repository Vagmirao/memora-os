import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'amber' | 'red' | 'green' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center font-mono font-medium tracking-wider uppercase border transition-colors';

  const sizeClasses =
    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]';

  const variantClasses = {
    cyan: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    neutral: 'bg-[#282a2c] text-[#b9cacb] border-[#3b494b]',
    outline: 'bg-transparent text-[#b9cacb] border-[#3b494b]',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
