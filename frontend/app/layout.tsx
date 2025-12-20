import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eng Panel | Painel de Engenharia",
  description: "Sistema modular para gestão de projetos de engenharia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased">
        {/* Aqui você pode adicionar Providers futuramente (Auth, Theme, etc) */}
        {children}
      </body>
    </html>
  );
}