"use client";

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      {/* Centraliza o formulário de login e garante que não haja Sidebar aqui */}
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}