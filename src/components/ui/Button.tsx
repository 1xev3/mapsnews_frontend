// components/Button.tsx
import React, { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'filled' | 'outline' | 'ghost' | 'icon_left' | 'icon_right';
}

const Button: FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'filled',
  ...props 
}) => {
  const baseStyles = 'flex flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg';
  
  const variants = {
    filled: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    outline: 'border border-zinc-800 text-zinc-800 hover:bg-zinc-100',
    ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-800',
    icon_left: 'justify-start',
    icon_right: 'justify-end'
  };

  return (
    <button
      {...props}
      className={twMerge(
        baseStyles,
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
