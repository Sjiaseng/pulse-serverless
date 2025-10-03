import { NextRequest, NextResponse } from "next/server";
import {
  SNSClient,
  SubscribeCommand,
  ListSubscriptionsByTopicCommand,
} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const topicArn = process.env.SNS_TOPIC_ARN!;

    // Check existing subscriptions
    const listCmd = new ListSubscriptionsByTopicCommand({ TopicArn: topicArn });
    const { Subscriptions } = await snsClient.send(listCmd);

    const subscribed = Subscriptions?.some(
      (s) => s.Endpoint === email && s.SubscriptionArn !== "PendingConfirmation"
    );

    if (subscribed) {
      return NextResponse.json({ status: "subscribed" });
    }

    // If not subscribed, create a new one
    const subscribeCmd = new SubscribeCommand({
      Protocol: "email",
      TopicArn: topicArn,
      Endpoint: email,
    });
    await snsClient.send(subscribeCmd);

    return NextResponse.json({ status: "pending" }); // pending email confirmation
  } catch (err) {
    console.error("SNS Subscribe error:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
