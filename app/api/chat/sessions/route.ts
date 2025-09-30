import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "@/lib/db/dynamodbconnection";
import Ably from "ably"

interface ChatSession {
  id: string;
  participantIds: string[];
  lastMessage: string;
  timestamp: string;
  unread: Record<string, number>;
}

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function POST(req: Request) {
  try {
    const { currentUserId, targetUserId } = await req.json();


    if (!currentUserId || !targetUserId) {
      return NextResponse.json(
        { message: "Missing user ids" },
        { status: 400 }
      );
    }

    const newSession: ChatSession = {
      id: uuidv4(),
      participantIds: [currentUserId, targetUserId],
      lastMessage: "Start a conversation...",
      timestamp: new Date().toISOString(),
      unread: {
        [currentUserId]: 0,
        [targetUserId]: 0,
      },
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: "ChatSessions",
        Item: newSession,
      })
    );

    const channel = ably.channels.get("chat:sessions");
    await channel.publish("created", newSession);

    return NextResponse.json(newSession, { status: 200 });
  } catch (err) {
    console.error("Error saving chat session:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
