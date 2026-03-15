"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/fleet", label: "Fleet" },
  { href: "/inventory", label: "Inventory" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-50 font-mono">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">

          {/* Left: Logo + Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-white rounded-sm w-[60px] h-[34px] flex items-center justify-center overflow-hidden p-1">
            <div className="relative w-full h-full">
                <Image
                src="/data/assets/drtlogo.svg"
                alt="DRT Logo"
                fill
                className="object-contain"
                sizes="60px"
                />
            </div>
            </div>
              <span className="text-[13px] font-semibold text-white uppercase tracking-widest">
                Dashboard
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-stretch h-14">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      relative inline-flex items-center px-4 text-[11px] font-medium
                      uppercase tracking-widest border-l border-[#1e1e1e]
                      transition-colors duration-150
                      ${active
                        ? "text-[#00703C] bg-[#00703C]/10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#00703C]"
                        : "text-[#666] hover:text-[#e5e5e5] hover:bg-[#161616]"
                      }
                    `}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: status + actions */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[10px] text-[#444] tracking-wide flex items-center gap-1.5">
                {/* <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> */}
              {/* 3 active */}
            </span>

            {/* <button
              type="button"
              className="w-8 h-8 border border-[#2a2a2a] text-[#666] flex items-center justify-center
                         hover:border-[#444] hover:text-[#ccc] hover:bg-[#161616] transition-colors"
            >
              <span className="sr-only">Notifications</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>

            <div className="w-8 h-8 bg-amber-400 flex items-center justify-center text-[10px] font-semibold text-black tracking-wide cursor-pointer">
              JD
            </div> */}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="sm:hidden p-2 text-[#666] hover:text-[#ccc] hover:bg-[#161616] transition-colors"
          >
            <span className="sr-only">Toggle menu</span>
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-[#1e1e1e] bg-[#0a0a0a]">
          <div className="py-2">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block px-6 py-3 text-[11px] font-medium uppercase tracking-widest
                    border-l-2 transition-colors
                    ${active
                      ? "border-[#00703C] text-[#00703C] bg-[#00703C]/10"
                      : "border-transparent text-[#666] hover:text-[#ccc] hover:bg-[#161616]"
                    }
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          {/* <div className="border-t border-[#1e1e1e] px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 flex items-center justify-center text-[11px] font-semibold text-black tracking-wide">
              JD
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">John Doe</p>
              <p className="text-[11px] text-[#555]">john@example.com</p>
            </div>
          </div> */}
        </div>
      )}
    </nav>
  );
}