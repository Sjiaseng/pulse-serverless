import { NextResponse } from "next/server";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "@/lib/db/dynamodbconnection";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ message: "Missing sessionId" }, { status: 400 });
  }

  try {
    const data = await ddbDocClient.send(
      new QueryCommand({
        TableName: "ChatMessages",
        KeyConditionExpression: "sessionId = :s",
        ExpressionAttributeValues: {
          ":s": sessionId,
        },
        ScanIndexForward: true, 
      })
    );

    return NextResponse.json(data.Items ?? [], { status: 200 });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
