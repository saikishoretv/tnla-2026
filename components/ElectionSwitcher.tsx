"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const ELECTIONS = [
  { id: "tnla2026", label: "TNLA 2026", sublabel: "Tamil Nadu", href: "/tnla2026" },
  { id: "kerala2026", label: "KLA 2026", sublabel: "Kerala", href: "/kerala2026" },
  { id: "pondicherry2026", label: "PLA 2026", sublabel: "Pondicherry", href: "/pondicherry2026" },
];

export default function ElectionSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = ELECTIONS.find((e) => pathname.startsWith(`/${e.id}`)) ?? ELECTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors"
      >
        <div className="text-left">
          <p className="text-white font-bold text-base leading-tight">{current.label}</p>
          <p className="text-gray-400 text-xs leading-tight">{current.sublabel}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-700 bg-gray-900 shadow-xl z-50 overflow-hidden">
          {ELECTIONS.map((e) => {
            const active = e.id === current.id;
            return (
              <button
                key={e.id}
                onClick={() => { router.push(e.href); setOpen(false); }}
                className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors ${
                  active ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <span className={`text-sm font-medium ${active ? "text-white" : "text-gray-300"}`}>
                  {e.label}
                </span>
                <span className="text-xs text-gray-500">{e.sublabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
