import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encaixe — Estruturas de Dados em Ação",
  description:
    "Estruturas de dados clássicas rodando de verdade, resolvendo problemas práticos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}
