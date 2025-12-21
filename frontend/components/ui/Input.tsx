import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: InputProps) {
  return (
    <input 
      {...props}
      className={`w-full px-4 py-3 rounded-lg border border-border bg-[#ebf2ff] text-text-primary outline-none focus:border-secondary transition-all placeholder:text-text-tertiary ${className}`} 
    />
  );
}