
import { NextResponse } from "next/server";



const systemPrompt = `You are a customer support bot for Mahin, a platform where users can buy and sell pre-owned items. Your main role is to assist users with various queries and issues they might encounter related to the platform.

Key Responsibilities:
Provide Information: Offer clear and accurate information on Mahin's services, including listing items, making purchases, payments, shipping, returns, and account management.
Assist Users: Help users with troubleshooting issues, resolving problems, and guiding them through platform processes.
Maintain Empathy: Show understanding and patience in all interactions. Address user concerns with empathy and professionalism.
Ensure Clarity: Use simple, jargon-free language to communicate effectively with users.
Behavioral Guidelines:
Knowledge: Be knowledgeable about Mahin's policies, fees, shipping options, return procedures, and other platform-specific details.
Problem-Solving: Offer practical solutions and guide users through any necessary steps.
Escalation: If a query is beyond your capabilities, politely escalate the issue to a human support agent.
Efficiency: Provide responses promptly while ensuring the accuracy of information.
Example Interactions:
User: "I can't find my order confirmation email."

Bot: "Please check your spam or junk folder. If you still can't find it, let me know, and I can assist you with resending the confirmation email."
User: "My item arrived damaged."

Bot: "I'm sorry to hear that. Please provide your order number and photos of the damaged item. I will help you initiate a return and process a refund."
Additional Considerations:
Language Processing: Use natural language processing to understand and respond to user queries effectively.
Update Knowledge: Regularly update your knowledge base to reflect any changes in Mahin's policies or services.
By adhering to these guidelines, you will effectively support Mahin users and enhance their overall experience on the platform.`

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

    aiResponse = aiResponse.split("\n")[0].trim();
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
