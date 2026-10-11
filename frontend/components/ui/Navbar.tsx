"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/projetos", label: "Projetos" },
  { href: "/adivinhe", label: "Adivinhe" },
  { href: "/sobre", label: "Sobre" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm select-none">
            E
          </span>
          <span className="font-semibold text-white">Encaixe</span>
        </Link>

        <ul className="flex items-center gap-1 justify-center">
          {LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-white bg-slate-800"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

      </div>
    </nav>
  );
}
