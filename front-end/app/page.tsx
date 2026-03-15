// src/app/page.tsx
// Root page — renders the fleet dashboard.
// The FleetDashboard itself is a client component; this page stays a server component.

import type { Metadata } from "next";
import FleetDashboard from "./fleet/FleetDashboard";

export const metadata: Metadata = {
  title: "DRT Fleet Risk Tracker",
  description: "Preventative maintenance risk dashboard for DRT transit fleet.",
};

export default function HomePage() {
  return <FleetDashboard />;
}

