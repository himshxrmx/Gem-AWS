const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" })
      };
    }

    const body = JSON.parse(event.body);

    if (!body.image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Image is required" })
      };
    }

    const base64Image = body.image.includes(",")
      ? body.image.split(",")[1]
      : body.image;

    const prompt = `
Analyze this classroom image carefully.

For each visible student, classify facial expression into ONE of these categories:

Happy
Neutral
Bored
Sad
Angry
Surprised

Return strictly JSON in this exact format:

{
  "total_students": number,
  "happy": number,
  "neutral": number,
  "bored": number,
  "sad": number,
  "angry": number,
  "surprised": number
}
`;


    // 🔥 Gemini 2.5 Flash (Correct v1 endpoint)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(errorText);
    }

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates || !geminiData.candidates.length) {
      throw new Error("No response from Gemini");
    }

    let textOutput =
      geminiData.candidates[0].content.parts[0].text;

    // Clean markdown formatting if present
    textOutput = textOutput.replace(/```json|```/g, "").trim();

    let stats;

    try {
      stats = JSON.parse(textOutput);
    } catch (parseError) {
      console.error("JSON Parse Error:", textOutput);
      throw new Error("Invalid JSON returned by Gemini");
    }

    // Define engaged emotions
const engagedCount =
  (stats.happy || 0) +
  (stats.neutral || 0) +
  (stats.surprised || 0);

// Calculate percentage
const percentage =
  stats.total_students > 0
    ? Math.round((engagedCount / stats.total_students) * 100)
    : 0;

const record = {
  id: "class_session",
  timestamp: Date.now(),
  recordId: uuidv4(),
  total_students: stats.total_students,
  happy: stats.happy || 0,
  neutral: stats.neutral || 0,
  bored: stats.bored || 0,
  sad: stats.sad || 0,
  angry: stats.angry || 0,
  surprised: stats.surprised || 0,
  engagement_percentage: percentage
};


    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: record
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(record)
    };

  } catch (error) {
    console.error("Analyze Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to analyze image",
        details: error.message
      })
    };
  }
};

