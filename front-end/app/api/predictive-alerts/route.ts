import { NextRequest, NextResponse } from "next/server";
import { processFleetAlerts } from "@/lib/predictive/notificationEngine";
import { BusRecord } from "@/lib/types";
import { generateMockBusRecords } from "@/lib/mockData";

console.log("[DEBUG] SNS_TOPIC_ARN:", process.env.SNS_TOPIC_ARN);
console.log("[DEBUG] AWS_REGION:", process.env.AWS_REGION || process.env.APP_REGION || "MISSING");
console.log("[DEBUG] AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "MISSING");
console.log("[DEBUG] APP_ACCESS_KEY_ID:", process.env.APP_ACCESS_KEY_ID ? "SET" : "MISSING");

export async function POST(req: NextRequest) {
  try {
    let buses: BusRecord[] = [];

    try {
      const body = await req.json() as { buses?: BusRecord[] } | null;
      if (body?.buses && Array.isArray(body.buses)) {
        buses = body.buses;
      }
    } catch {
      buses = [];
    }

    if (!buses.length) {
      buses = generateMockBusRecords();
    }

    console.log(`[API PredictiveAlerts] Calling processFleetAlerts with ${buses.length} buses...`);
    const result = await processFleetAlerts(buses);
    
    if (result.success) {
      return NextResponse.json({ 
        message: "Alerts processed successfully", 
        snsMessageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to process alerts", 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[API PredictiveAlerts] Error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
