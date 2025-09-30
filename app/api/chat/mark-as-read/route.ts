import { NextRequest, NextResponse } from "next/server";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "@/lib/db/dynamodbconnection";
import Ably from "ably";

const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });

export async function POST(req: NextRequest) {
  const { sessionId, userId } = await req.json();

  if (!sessionId || !userId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: "ChatSessions",
        Key: { id: sessionId },
        UpdateExpression: "SET unread.#uid = :zero",
        ExpressionAttributeNames: {
          "#uid": userId,
        },
        ExpressionAttributeValues: {
          ":zero": 0,
        },
      })
    );

    const channel = ably.channels.get(`chat-${sessionId}`);
    await channel.publish("read", { sessionId, userId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error marking read:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
