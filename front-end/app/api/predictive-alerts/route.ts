import { NextRequest, NextResponse } from "next/server";
import { processFleetAlerts } from "@/lib/predictive/notificationEngine";
import { BusRecord } from "@/lib/types";

console.log("[DEBUG] SNS_TOPIC_ARN:", process.env.SNS_TOPIC_ARN);
console.log("[DEBUG] AWS_REGION:", process.env.AWS_REGION || process.env.APP_REGION || "MISSING");
console.log("[DEBUG] AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "MISSING");

export async function POST(req: NextRequest) {
  try {
    const { buses } = await req.json() as { buses: BusRecord[] };
    
    if (!buses || !Array.isArray(buses)) {
      return NextResponse.json({ error: "Invalid buses data" }, { status: 400 });
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
