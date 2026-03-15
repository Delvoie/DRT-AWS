"use client";

import Image from "next/image";

const team = [
  {
    initials: "JM",
    name: "Julien Mongrain",
    role: "Full-Stack Developer",
    tags: ["Next.js", "TypeScript"],
  },
  {
    initials: "LD",
    name: "Lucas Delvoie",
    role: "UI / UX Designer",
    tags: ["Figma", "Tailwind"],
  },
  {
    initials: "BB",
    name: "Ben Busstuff",
    role: "Data & Backend",
    tags: ["APIs", "CSV"],
  },
];

const timeline = [
  { time: "00:00", label: "Kickoff", desc: "Problem statement revealed. Team formed." },
  { time: "03:00", label: "Architecture", desc: "Stack chosen. Repo initialized. Coffee acquired." },
  { time: "09:00", label: "Core build", desc: "Fleet dashboard, live map, and data pipeline." },
  { time: "20:00", label: "Polish", desc: "UI refinement, mobile breakpoints, edge cases." },
  { time: "34:00", label: "Submission", desc: "Deployed to Vercel. Demo rehearsed." },
  { time: "36:00", label: "Presentation", desc: "Live demo to judges and sponsors." },
];

const stats = [
  { value: "36", unit: "hrs", label: "Build time" },
  { value: "3", unit: "devs", label: "Team size" },
  { value: "847", unit: "commits", label: "Git commits" },
  { value: "∞", unit: "cups", label: "Coffee consumed" },
];

const sponsors = [
  {
    name: "Ajax Pickering Board of Trade",
    logo: "/sponsors/apbot-logo.svg",
    desc: "Supporting local innovation and entrepreneurship across Durham Region.",
  },
  {
    name: "Durham Region Transit",
    logo: "/sponsors/drt-logo.svg",
    desc: "Providing real-world fleet data and domain expertise for this project.",
  },
  {
    name: "Durham College Student Association",
    logo: "/sponsors/dcsa-logo.svg",
    desc: "Empowering students to build solutions that matter for their communities.",
  },
];

export default function About() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen font-mono text-white">

{/* Hero */}
<section className="border-b border-[#1e1e1e] px-6 py-20 max-w-7xl mx-auto">
  <div className="flex flex-col sm:flex-row items-start justify-between gap-10">
    
    {/* Left: existing content */}
    <div className="flex flex-col gap-6 max-w-2xl">

      <div className="flex items-center gap-3">
        <span className="text-[9px] text-[#00703C] uppercase tracking-[0.2em] border border-[#1a3d2b] bg-[#0d1f18] px-2.5 py-1">
          Hackathon 2026
        </span>
        <span className="text-[9px] text-[#333] uppercase tracking-[0.15em]">
          36-hour sprint
        </span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
        DRT Fleet
        <br />
        <span className="text-[#00703C]">Monitor</span>
      </h1>

      <p className="text-[13px] text-[#555] leading-relaxed max-w-lg">
        Real-time fleet intelligence dashboard for Durham Region Transit.
        Track vehicles, monitor maintenance schedules, and manage inventory.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ value, unit, label }) => (
          <div key={label} className="bg-[#111] border border-[#1e1e1e] p-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{value}</span>
              <span className="text-[10px] text-[#00703C] uppercase">{unit}</span>
            </div>
            <span className="text-[9px] text-[#444] uppercase">{label}</span>
          </div>
        ))}
      </div>

    </div>

    {/* Right: QR Code */}
    <div className="flex flex-col items-center  shrink-0">
      <div className="bg-white p-3">
        <Image
          src="/data/assets/QrCode.svg"
          alt="QR Code — Live Demo"
          width={120}
          height={120}
        />
      </div>
      <span className="text-[9px] text-[#333] uppercase tracking-widest">Live demo</span>
    </div>

  </div>
</section>

      {/* Timeline */}
      <section className="border-b border-[#1e1e1e] px-6 py-16 max-w-7xl mx-auto">

        <div className="flex items-center gap-4 mb-10">
          <span className="text-[9px] uppercase text-[#333]">36-hour timeline</span>
          <div className="flex-1 h-px bg-[#1e1e1e]" />
        </div>

        <div className="flex flex-col">
          {timeline.map(({ time, label, desc }) => (
            <div key={time} className="flex gap-6 py-4 border-b border-[#1e1e1e]">

              <span className="text-[10px] text-[#333] w-12">{time}</span>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold">{label}</span>
                <span className="text-[11px] text-[#444]">{desc}</span>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Tech */}
      <section className="border-b border-[#1e1e1e] px-6 py-16 max-w-7xl mx-auto">

        <div className="flex items-center gap-4 mb-10">
          <span className="text-[9px] uppercase text-[#333]">Tech stack</span>
          <div className="flex-1 h-px bg-[#1e1e1e]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Next.js 14", category: "Framework" },
            { name: "TypeScript", category: "Language" },
            { name: "Tailwind CSS", category: "Styling" },
            { name: "Vercel", category: "Deployment" },
            { name: "PostgreSQL", category: "Database" },
            { name: "Prisma", category: "ORM" },
            { name: "Mapbox GL", category: "Mapping" },
            { name: "Recharts", category: "Charts" },
          ].map(({ name, category }) => (
            <div key={name} className="bg-[#111] border border-[#1e1e1e] p-4">
              <span className="text-[9px] text-[#333] uppercase">{category}</span>
              <div className="text-[12px] font-semibold">{name}</div>
            </div>
          ))}
        </div>

      </section>

      {/* Team */}
      <section className="border-b border-[#1e1e1e] px-6 py-16 max-w-7xl mx-auto">

        <div className="flex items-center gap-4 mb-10">
          <span className="text-[9px] uppercase text-[#333]">The team</span>
          <div className="flex-1 h-px bg-[#1e1e1e]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {team.map(({ initials, name, role, tags }) => (
            <div
              key={name}
              className="bg-[#111] border border-[#1e1e1e] p-5 flex flex-col gap-4"
            >

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0d1f18] border border-[#1a3d2b] flex items-center justify-center text-[12px] font-semibold text-[#00703C]">
                  {initials}
                </div>

                <div>
                  <p className="text-[12px] font-semibold">{name}</p>
                  <p className="text-[10px] text-[#444]">{role}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-[#1e1e1e] pt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] text-[#333] border border-[#222] px-2 py-0.5 uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </div>
          ))}

        </div>

      </section>

{/* Sponsors */}
<section className="px-6 py-16 max-w-7xl mx-auto">
  <div className="flex items-center gap-4 mb-10">
    <span className="text-[9px] uppercase text-[#333]">Presented by</span>
    <div className="flex-1 h-px bg-[#1e1e1e]" />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {sponsors.map(({ name, logo, desc }) => (
      <div
        key={name}
        className="bg-[#111] border border-[#1e1e1e] p-6 flex flex-col gap-4"
      >
        <div className="h-12 flex items-center justify-start">
          <Image    
            src={logo}
            alt={name}
            width={180}
            height={48}
            className="max-h-full max-w-full object-contain opacity-60"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            className="hidden h-12 w-full border border-dashed border-[#1e1e1e] bg-[#0a0a0a] items-center justify-center"
          >
            <span className="text-[9px] text-[#222] uppercase tracking-widest">
              {name}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-white">{name}</div>
        <div className="text-[11px] text-[#444] leading-relaxed">{desc}</div>
      </div>
    ))}
  </div>
</section>


    </main>
  );
}