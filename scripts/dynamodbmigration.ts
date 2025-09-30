/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  CreateTableCommand, 
  ListTablesCommand, 
  ScalarAttributeType, 
  KeyType 
} from "@aws-sdk/client-dynamodb";
import ddbDocClient from "../lib/db/dynamodbconnection";

async function createTableIfNotExists(tableName: string, createFn: () => Promise<void>) {
  try {
    const tables = await ddbDocClient.send(new ListTablesCommand({}));
    if (!tables.TableNames?.includes(tableName)) {
      console.log(`Creating table: ${tableName}`);
      await createFn();
    } else {
      console.log(`Table ${tableName} already exists — skipping creation`);
    }
  } catch (err) {
    console.error(`Error checking/creating table ${tableName}:`, err);
  }
}

async function createChatSessionsTable() {
  const params = {
    TableName: "ChatSessions",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: ScalarAttributeType.S },
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: KeyType.HASH },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  };

  try {
    const command = new CreateTableCommand(params);
    const response = await ddbDocClient.send(command);
    console.log("ChatSessions table created:", response.TableDescription?.TableName);
  } catch (err: any) {
    if (err.name === "ResourceInUseException") {
      console.log("ChatSessions table already exists, not recreating.");
    } else {
      console.error("Error creating ChatSessions table:", err);
    }
  }
}

async function createChatMessagesTable() {
  const params = {
    TableName: "ChatMessages",
    AttributeDefinitions: [
      { AttributeName: "sessionId", AttributeType: ScalarAttributeType.S },
      { AttributeName: "timestamp", AttributeType: ScalarAttributeType.S },
    ],
    KeySchema: [
      { AttributeName: "sessionId", KeyType: KeyType.HASH },
      { AttributeName: "timestamp", KeyType: KeyType.RANGE },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  };

  try {
    const command = new CreateTableCommand(params);
    const response = await ddbDocClient.send(command);
    console.log("ChatMessages table created:", response.TableDescription?.TableName);
  } catch (err: any) {
    if (err.name === "ResourceInUseException") {
      console.log("ChatMessages table already exists, not recreating.");
    } else {
      console.error("Error creating ChatMessages table:", err);
    }
  }
}

export async function initDynamoDB() {
  await createTableIfNotExists("ChatSessions", createChatSessionsTable);
  await createTableIfNotExists("ChatMessages", createChatMessagesTable);
}

initDynamoDB();
