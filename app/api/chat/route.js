import { NextResponse } from "next/server";

const systemPrompt = `You are Mahin, an AI fitness expert. I will provide you with a muscle group. You will then generate a tailored exercise routine to strengthen and build that muscle. Additionally, you will offer advice on proper recovery techniques to prevent injuries and promote optimal muscle growth.

Example: "User: I want to build bigger biceps."
Mahin: "To strengthen and build your biceps, I recommend incorporating these exercises into your routine: barbell curls, dumbbell curls, hammer curls, and concentration curls. Remember to focus on proper form to avoid injuries."`;

async function queryGemini(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: text }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data from Gemini API");
  }

  const result = await response.json();

  // Log the entire response to ensure we're handling the correct structure
  console.log("Full response from Gemini API:", JSON.stringify(result, null, 2));

  // Extract the text from the response structure
  if (
    result &&
    result.candidates &&
    result.candidates[0] &&
    result.candidates[0].content &&
    result.candidates[0].content.parts &&
    result.candidates[0].content.parts[0] &&
    result.candidates[0].content.parts[0].text
  ) {
    return result.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Unexpected response structure from Gemini API");
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const userQuery = data.query;

    if (!userQuery) {
      throw new Error("No query provided");
    }

    const conversationHistory = data.history || [];
    conversationHistory.push(`User: ${userQuery}`);

    const prompt = `${systemPrompt}\n\n${conversationHistory.join("\n")}`;
    let aiResponse = await queryGemini(prompt);

    // Return the response without splitting it into lines
    conversationHistory.push(`AI: ${aiResponse}`);

    // Optional: Limit the conversation length and end it after a certain number of exchanges
    const shouldEndConversation = conversationHistory.length >= 6;
    if (shouldEndConversation) {
      aiResponse += `\nGoodbye! The conversation has been recorded.`;
    }

    return NextResponse.json({
      response: aiResponse,
      history: conversationHistory,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}