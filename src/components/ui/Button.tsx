import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-mono tracking-wider uppercase transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#00F0FF] rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-4 py-2 text-[12px] gap-2',
    lg: 'px-6 py-2.5 text-[13px] gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#00F0FF] text-[#0c0e10] font-semibold hover:bg-[#00dbe9] shadow-[0_0_12px_rgba(0,240,255,0.25)] border border-[#00F0FF]',
    secondary:
      'bg-[#1e2022] text-[#e2e2e5] border border-[#3b494b] hover:bg-[#282a2c] hover:border-[#00F0FF]/40 hover:text-[#00F0FF]',
    outline:
      'bg-transparent text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]',
    danger:
      'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50',
    ghost:
      'bg-transparent text-[#b9cacb] border border-transparent hover:bg-[#1e2022] hover:text-[#e2e2e5]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
