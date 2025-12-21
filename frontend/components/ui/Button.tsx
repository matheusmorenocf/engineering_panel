import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button 
      {...props}
      className={`w-full bg-secondary hover:bg-secondary-dark text-white py-4 rounded-lg font-bold tracking-widest transition-all uppercase text-xs shadow-md mt-2 cursor-pointer active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}