import { NextRequest, NextResponse } from "next/server";
import { processFleetAlerts } from "@/lib/predictive/notificationEngine";
import { BusRecord } from "@/lib/types";

console.log("[DEBUG] SNS_TOPIC_ARN:", process.env.SNS_TOPIC_ARN);
console.log("[DEBUG] APP_ACCESS_KEY_ID:", process.env.APP_ACCESS_KEY_ID ? "SET" : "MISSING");
console.log("[DEBUG] APP_SECRET_ACCESS_KEY:", process.env.APP_SECRET_ACCESS_KEY ? "SET" : "MISSING");

export async function POST(req: NextRequest) {
  try {
    const { buses } = await req.json() as { buses: BusRecord[] };
    
    if (!buses || !Array.isArray(buses)) {
      return NextResponse.json({ error: "Invalid buses data" }, { status: 400 });
    }

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
