"use client";

import Link from "next/link";
import Image from "next/image";
import { navLinks } from "./navbar";

const techStack = ["Next.js", "TypeScript", "Tailwind", "AWS"];

const sponsors = [
  {
    name: "Ajax Pickering Board of Trade",
    short: "Ajax Pickering\nBoard of Trade",
    logo: "/data/assets/ajaxlogo.webp",
  },
  {
    name: "Durham Region Transit",
    short: "Durham Region\nTransit",
    logo: "/data/assets/drtlogo.svg",
  },
  {
    name: "Durham College Student Association",
    short: "Durham College\nStudent Association",
    logo: "/data/assets/dcsa-logo-solid-purple.svg",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#1e1e1e] font-mono">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 py-10 border-b border-[#1e1e1e]">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#00703C] flex items-center justify-center">
                <span className="text-[10px] font-semibold text-white tracking-wide">DRT</span>
              </div>
              <span className="text-[13px] font-semibold text-white uppercase tracking-widest">
                Dashboard
              </span>
            </div>
            <p className="text-[11px] text-[#444] leading-relaxed tracking-wide">
              Fleet intelligence platform.<br />Built in 26 hours.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#0d1f18] border border-[#1a3d2b] px-2.5 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00703C] animate-pulse" />
              <span className="text-[10px] text-[#00703C] uppercase tracking-widest">Live demo running</span>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-[9px] font-semibold text-[#333] uppercase tracking-[0.15em] mb-4">
              Navigate
            </p>
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11px] text-[#555] hover:text-[#e5e5e5] tracking-wide transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] text-[#222]">—</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Hackathon card */}
          <div>
            <p className="text-[9px] font-semibold text-[#333] uppercase tracking-[0.15em] mb-4">
              Hackathon
            </p>
            <div className="bg-[#111] border border-[#1e1e1e] p-4 flex flex-col gap-2.5">
              <span className="text-[9px] text-[#333] uppercase tracking-[0.15em]">Project entry</span>
              <span className="text-[13px] font-semibold text-white tracking-wide">DRT Fleet Monitor</span>
              <span className="text-[10px] text-[#444]">26hr sprint — March 2026</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-wide px-2 py-1 border text-[#00703C] border-[#1a3d2b] bg-[#0d1f18]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="py-7 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-[9px] font-semibold text-[#333] uppercase tracking-[0.15em] whitespace-nowrap">
              Presented by
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #1e1e1e 0, #1e1e1e 4px, transparent 4px, transparent 8px)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sponsors.map(({ name, short, logo }) => (
              <div
                key={name}
                className="bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors px-5 py-4 flex flex-col items-center gap-3"
              >
                {/* Styled like header logo */}
                <div className="bg-white rounded-sm px-1.5 py-1 w-full h-12 flex items-center justify-center">
                  <span className="flex items-center">
                    <Image
                      src={logo}
                      alt={name}
                      width={120}
                      height={48}
                      className="object-contain"
                    />
                  </span>
                </div>
                <span className="text-[9px] text-[#444] uppercase tracking-wide text-center leading-relaxed whitespace-pre-line">
                  {short}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashed divider */}
        <div
          className="w-full h-px"
          style={{
            background:
              "repeating-linear-gradient(90deg, #1e1e1e 0, #1e1e1e 4px, transparent 4px, transparent 8px)",
          }}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between py-4">
          <span className="text-[10px] text-[#333] tracking-wide">
            © 2026 <span className="text-[#00703C]">DRT Dashboard</span> — Hackathon Project
          </span>
          <span className="text-[10px] text-[#2a2a2a] tracking-wide">
            Built with <span className="text-[#333]">↑ too much coffee</span>
          </span>
        </div>

      </div>
    </footer>
  );
}