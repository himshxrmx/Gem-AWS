Smart Attendance & Engagement System v2 (AWS + Gemini)
An automated, serverless classroom monitoring system that eliminates manual roll calls. By leveraging Google Gemini 2.5 Flash's multimodal vision capabilities deployed on AWS Serverless infrastructure (Lambda & API Gateway), this system processes real-time classroom imagery to instantly calculate attendance and gauge overall student engagement.

Key Features
Zero-Touch Attendance: Completely automates roll calls using wide-angle classroom images.

Real-Time Engagement Analytics: Classifies student expressions into 6 distinct categories (Happy, Neutral, Bored, Sad, Angry, Surprised) to calculate a live "Classroom Engagement Score."

High-Speed Inference: Powered by Gemini 2.5 Flash for sub-second multimodal analysis.

Fully Serverless: 100% serverless architecture using AWS SAM, ensuring zero idle costs and infinite scalability.

Optimized Data Retrieval: DynamoDB integration with efficient querying for charting time-series engagement data on the frontend.

Tech Stack & Architecture
Compute: AWS Lambda (Node.js 20.x)

Routing: Amazon API Gateway (HTTP API)

Database: Amazon DynamoDB (Pay-Per-Request)

AI Engine: Google Gemini 2.5 Flash (REST API)

Infrastructure as Code (IaC): AWS Serverless Application Model (SAM)

Getting Started & Deployment
This project uses AWS SAM for deployment. The configuration is pre-set to deploy a stack named THE-GRAD in the us-east-1 region.

Prerequisites
AWS CLI installed and configured (aws configure)

AWS SAM CLI installed

Node.js v20+

A Google Gemini API Key

Deployment Steps
Clone the repository:

Bash
git clone https://github.com/yourusername/Smart-Attendance-System-v2.git
cd Smart-Attendance-System-v2
Install local dependencies (optional for local testing):

Bash
npm install
Build the SAM Application:

Bash
sam build
Deploy to AWS:
Provide your Gemini API key during deployment so the Lambda functions can access it securely via environment variables.

Bash
sam deploy --parameter-overrides GeminiApiKey="YOUR_GEMINI_API_KEY_HERE"
Retrieve your API URL:
Once deployed, SAM will output your live API Gateway Endpoint URL (e.g., https://xxxxxx.execute-api.us-east-1.amazonaws.com). Use this as the API_BASE in your frontend application.

API Reference
1. Analyze Classroom Image
Endpoint: POST /analyze

Description: Accepts a base64 encoded image, passes it to Gemini 2.5 Flash for expression analysis, calculates the engagement percentage, and saves the record to DynamoDB.

Request Body:

JSON
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAA..."
}
Successful Response (200 OK):

JSON
{
  "id": "class_session",
  "timestamp": 1709999999999,
  "recordId": "550e8400-e29b-41d4-a716-446655440000",
  "total_students": 42,
  "happy": 20,
  "neutral": 18,
  "bored": 4,
  "sad": 0,
  "angry": 0,
  "surprised": 0,
  "engagement_percentage": 90
}
2. Fetch Dashboard Records
Endpoint: GET /records

Description: Retrieves the last 20 classroom sessions from DynamoDB, sorted chronologically from oldest to newest for seamless Chart.js integration.

Successful Response (200 OK):

JSON
[
  {
    "id": "class_session",
    "timestamp": 1709999900000,
    "recordId": "...",
    "total_students": 42,
    "engagement_percentage": 90
  }
]
Author
Him Sharma

GitHub: @himshxrmx

Project Version: 2.0 (AWS Cloud Edition)

