import { NextResponse } from "next/server";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ddbDocClient from "@/lib/db/dynamodbconnection";
import { v4 as uuidv4 } from "uuid";

import Ably from "ably";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const sessionId = form.get("sessionId") as string;
    const senderId = form.get("senderId") as string;
    const targetUserId = form.get("targetUserId") as string;
    const content = (form.get("content") as string) || "";
    const file = form.get("attachment") as File | null;

    if (!sessionId || !senderId || !targetUserId) {
      return NextResponse.json(
        { message: "Missing sessionId, senderId or targetUserId" },
        { status: 400 }
      );
    }

    let attachmentMeta: Attachment | undefined;

    // Handle S3 upload
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const key = `chat/${uuidv4()}-${file.name}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read" 
        })
      );

      attachmentMeta = {
        name: file.name,
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        type: file.type,
        size: file.size,
      };
    }

    // New message object
    const newMsg: ChatMessage = {
      id: uuidv4(),
      sessionId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      attachments: attachmentMeta ? [attachmentMeta] : undefined,
    };

    // Save to ChatMessages
    await ddbDocClient.send(
      new PutCommand({
        TableName: "ChatMessages",
        Item: newMsg,
      })
    );

  const unreadAttr = `#u_${targetUserId.replace(/-/g, "_")}`;

  await ddbDocClient.send(
    new UpdateCommand({
      TableName: "ChatSessions",
      Key: { id: sessionId },
      UpdateExpression: `SET lastMessage = :lastMessage, #ts = :ts, unread.${unreadAttr} = if_not_exists(unread.${unreadAttr}, :zero) + :inc`,
      ExpressionAttributeNames: {
        "#ts": "timestamp",
        [unreadAttr]: targetUserId,
      },
      ExpressionAttributeValues: {
        ":lastMessage": newMsg.content || (attachmentMeta?.name ?? "Attachment"),
        ":ts": newMsg.timestamp,
        ":inc": 1,
        ":zero": 0,
      },
    })
  );

    const ably = new Ably.Realtime(process.env.ABLY_API_KEY!);
    const channel = ably.channels.get(`chat:${sessionId}`);
    await channel.publish("message", newMsg);

    const receiverChannel = ably.channels.get(`chat:user:${targetUserId}`);
      await receiverChannel.publish("message", {
        ...newMsg,
        sessionId,
        targetUserId,
      });

    return NextResponse.json(newMsg, { status: 200 });
  } catch (err) {
    console.error("Error sending chat message:", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(err) },
      { status: 500 }
    );
  }
}
