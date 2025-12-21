import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eng Panel - V3",
  description: "Sistema de Gestão de Engenharia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* suppressHydrationWarning evita erros causados por extensões e temas dinâmicos */
    <html lang="pt-br" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}