// components/Button.tsx
import React, { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={twMerge(`bg-zinc-800 hover:bg-zinc-700 flex flex-row items-center justify-center gap-2 text-white px-4 py-2 rounded transition-colors`, className)}
    >
      {children}
    </button>
  );
};

export default Button;
