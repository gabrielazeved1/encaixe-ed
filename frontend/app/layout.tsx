import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Encaixe — Estruturas de Dados em Ação",
  description:
    "Estruturas de dados clássicas rodando de verdade, resolvendo problemas práticos.",
  openGraph: {
    title: "Encaixe — Estruturas de Dados em Ação",
    description:
      "Estruturas de dados clássicas rodando de verdade, resolvendo problemas práticos.",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0d1117] text-white">
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
