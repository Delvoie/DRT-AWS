import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { BusRecord } from "@/lib/types";
import { buildBusHealthRecords } from "./healthEngine";
import { PartHealthRecord } from "@/lib/types/predictive";

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || "arn:aws:sns:us-east-1:950724106216:newbus";
const region = process.env.AWS_REGION || process.env.APP_REGION || "us-east-1";

function getSnsClient() {
  return new SNSClient({ region });
}

export async function processFleetAlerts(buses: BusRecord[]) {
  console.log(`[NotificationEngine] Processing alerts for ${buses.length} buses...`);
  console.log(`[NotificationEngine] Publishing to ${SNS_TOPIC_ARN} in ${region}`);

  const allRecords: PartHealthRecord[] = buses.flatMap(bus => buildBusHealthRecords(bus));
  
  const criticalParts = allRecords.filter(r => r.healthPct <= 20);
  const warningParts = allRecords.filter(r => r.healthPct <= 35 && r.healthPct > 20);

  console.log(`[NotificationEngine] Found ${criticalParts.length} critical and ${warningParts.length} warning parts.`);
  
  const subject = criticalParts.length > 0 || warningParts.length > 0
    ? `⚡ Predictive Alert: ${criticalParts.length} critical, ${warningParts.length} warning parts`
    : `✅ Predictive Fleet Health: All parts stable`;
  
  let body = `DRT Bus Maintenance - Predictive Alert Summary\n`;
  body += `Generated at: ${new Date().toLocaleString()}\n`;
  body += `──────────────────────────────────────────────────\n\n`;

  if (criticalParts.length > 0) {
    body += `🔴 CRITICAL HEALTH (<= 20%)\n`;
    criticalParts.forEach(p => {
      body += `- Bus ${p.busAlias}: ${p.partName} (${p.healthPct.toFixed(1)}%) - Failure likely in ${p.projectedFailureKm?.toLocaleString()} km\n`;
    });
    body += `\n`;
  }

  if (warningParts.length > 0) {
    body += `⚠️ WARNING HEALTH (<= 35%)\n`;
    warningParts.forEach(p => {
      body += `- Bus ${p.busAlias}: ${p.partName} (${p.healthPct.toFixed(1)}%) - Order now\n`;
    });
    body += `\n`;
  }

  if (criticalParts.length === 0 && warningParts.length === 0) {
    body += `All monitored parts are currently within healthy thresholds.\n`;
  }

  body += `──────────────────────────────────────────────────\n`;
  body += `View Detailed Dashboard: https://drt-dashboard.vercel.app/predictive\n`;

  try {
    const snsClient = getSnsClient();
    const command = new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: subject,
      Message: body,
    });

    const response = await snsClient.send(command);
    console.log("[NotificationEngine] SNS Response:", JSON.stringify(response, null, 2));
    console.log("[NotificationEngine] SNS Notification sent successfully:", response.MessageId);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("[NotificationEngine] Error sending SNS notification:", error);
    return { success: false, error: (error as Error).message };
  }
}
