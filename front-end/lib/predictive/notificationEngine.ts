import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { BusRecord } from "@/lib/types";
import { PartHealthRecord } from "@/lib/types/predictive";
import { buildBusHealthRecords } from "./healthEngine";

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || "arn:aws:sns:us-east-1:950724106216:newbus";
const region = process.env.AWS_REGION || process.env.APP_REGION || "us-east-1";

function getSnsClient() {
  return new SNSClient({ region });
}

function buildMessage(criticalParts: PartHealthRecord[], warningParts: PartHealthRecord[]) {
  const subject =
    criticalParts.length > 0 || warningParts.length > 0
      ? `Predictive Alert: ${criticalParts.length} critical, ${warningParts.length} warning parts`
      : "Predictive Fleet Health: All parts stable";

  let body = "DRT Bus Maintenance Alert Summary\n";
  body += `Generated at: ${new Date().toLocaleString()}\n\n`;

  if (criticalParts.length > 0) {
    body += "CRITICAL HEALTH (<= 20%)\n";
    criticalParts.slice(0, 8).forEach((part) => {
      body += `- Bus ${part.busAlias}: ${part.partName} (${part.healthPct.toFixed(1)}%) - Failure likely in ${part.projectedFailureKm?.toLocaleString() ?? "unknown"} km\n`;
    });
    if (criticalParts.length > 8) {
      body += `- Plus ${criticalParts.length - 8} more critical parts\n`;
    }
    body += "\n";
  }

  if (warningParts.length > 0) {
    body += "WARNING HEALTH (<= 35%)\n";
    warningParts.slice(0, 8).forEach((part) => {
      body += `- Bus ${part.busAlias}: ${part.partName} (${part.healthPct.toFixed(1)}%) - Order now\n`;
    });
    if (warningParts.length > 8) {
      body += `- Plus ${warningParts.length - 8} more warning parts\n`;
    }
    body += "\n";
  }

  if (criticalParts.length === 0 && warningParts.length === 0) {
    body += "All monitored parts are currently within healthy thresholds.\n\n";
  }

  body += "View Detailed Dashboard: https://drt-dashboard.vercel.app/predictive\n";

  return { subject, body };
}

export async function processFleetAlerts(buses: BusRecord[]) {
  console.log(`[NotificationEngine] Processing alerts for ${buses.length} buses...`);
  console.log(`[NotificationEngine] Publishing to ${SNS_TOPIC_ARN} in ${region}`);

  const allRecords: PartHealthRecord[] = buses.flatMap((bus) => buildBusHealthRecords(bus));
  const criticalParts = allRecords.filter((record) => record.healthPct <= 20);
  const warningParts = allRecords.filter((record) => record.healthPct <= 35 && record.healthPct > 20);

  console.log(`[NotificationEngine] Found ${criticalParts.length} critical and ${warningParts.length} warning parts.`);

  try {
    const snsClient = getSnsClient();
    const { subject, body } = buildMessage(criticalParts, warningParts);
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
