import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
  },
});

// document client sdk -> for modifying the dynamodb
const ddbDocClient = DynamoDBDocumentClient.from(dynamodbClient);

export default ddbDocClient;
