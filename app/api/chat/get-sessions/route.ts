import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "@/lib/db/dynamodbconnection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const result = await ddbDocClient.send(
      new ScanCommand({
        TableName: "ChatSessions",
        FilterExpression: "contains(participantIds, :uid)",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
      })
    );

    return NextResponse.json(result.Items ?? [], { status: 200 });
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
