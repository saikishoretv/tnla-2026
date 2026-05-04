"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/tnla2026", label: "Dashboard" },
  { href: "/tnla2026/results", label: "All Results" },
  { href: "/tnla2026/star-candidates", label: "Star Candidates" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/tnla2026"
            ? pathname === "/tnla2026"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-gray-800 text-white font-medium ring-1 ring-indigo-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
