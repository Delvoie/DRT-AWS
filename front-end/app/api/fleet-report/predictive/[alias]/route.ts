import { NextResponse } from "next/server";

import { getPredictiveBusResponse } from "@/lib/predictive/api";

interface RouteContext {
  params: Promise<{
    alias: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { alias } = await params;
  const report = getPredictiveBusResponse(decodeURIComponent(alias));

  if (!report) {
    return NextResponse.json(
      { error: `No predictive data found for bus alias "${alias}".` },
      { status: 404 },
    );
  }

  return NextResponse.json(report);
}
