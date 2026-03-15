import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { NextResponse } from "next/server";

const TOPIC_ARN = process.env.SNS_TOPIC_ARN || "arn:aws:sns:us-east-1:950724106216:newbus";
const REGION = process.env.AWS_REGION || process.env.APP_REGION || "us-east-1";

export async function POST() {
  try {
    const snsClient = new SNSClient({ 
      region: REGION,
      credentials: {
        accessKeyId: process.env.APP_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.APP_SECRET_ACCESS_KEY || "",
      }
    });
    const response = await snsClient.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject: "DRT Test",
        Message: "Bus 8501⚡ Air Filter — Failure Risk",
      }),
    );

    return NextResponse.json({
      message: "SNS test sent",
      snsMessageId: response.MessageId,
    });
  } catch (error) {
    console.error("[API PredictiveAlerts Test] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send SNS test",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
