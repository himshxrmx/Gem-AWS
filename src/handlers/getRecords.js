const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const command = new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "id = :pk",
      ExpressionAttributeValues: { ":pk": "class_session" },
      Limit: 20, // Get last 20 sessions
      ScanIndexForward: false // Sort newest first
    });

    const response = await docClient.send(command);

    // Sort efficiently for chart.js (oldest to newest)
    const sortedItems = response.Items.sort((a, b) => a.timestamp - b.timestamp);

    return {
      statusCode: 200,
      body: JSON.stringify(sortedItems)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};