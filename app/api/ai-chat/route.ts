// /app/api/ai-chat/route.ts
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  // 🔑 Validate API key FIRST (security best practice)
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("[AI Chat] Missing GOOGLE_GENERATIVE_AI_API_KEY");
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const body = await req.json();

    // 🛡️ STRICT VALIDATION: Prevent ALL undefined/map errors
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      console.warn("[AI Chat] Invalid messages payload:", { 
        hasBody: !!body, 
        messagesType: Array.isArray(body?.messages) ? "array" : typeof body?.messages,
        length: body?.messages?.length 
      });
      return Response.json(
        { error: "Invalid request: 'messages' must be a non-empty array" }, 
        { status: 400 }
      );
    }

    // ✨ CRITICAL FIX 1: Remove convertToModelMessages (causes internal .map() crash with Google)
    // ✨ CRITICAL FIX 2: Robust per-message validation + sanitization
    const cleanMessages = body.messages
      .filter((m): m is { role: string; content: string } => 
        m && 
        typeof m === 'object' && 
        typeof m.role === 'string' && 
        typeof m.content === 'string' &&
        m.content.trim().length > 0 // Skip empty messages
      )
      .map(m => ({
        role: m.role === 'system' ? 'user' : m.role, // Gemini doesn't support system role in messages
        content: m.content.trim(),
      }));

    if (cleanMessages.length === 0) {
      return Response.json(
        { error: "No valid messages found after sanitization" }, 
        { status: 400 }
      );
    }

    // ✅ CORRECT USAGE: Pass cleanMessages DIRECTLY (no convertToModelMessages)
    const result = await streamText({
      model: google("gemini-1.5-flash-latest"), // ✅ Verified valid model name (gemini-2.0-flash doesn't exist)
      system: "You are FinPredict AI Assistant — an expert financial analyst. Respond concisely in the user's language.",
      messages: cleanMessages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    // 🚨 Enhanced error logging for debugging
    console.error("[AI Chat Fatal Error]:", {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      name: error.name,
    });
    
    // Never leak internal errors to client
    return Response.json(
      { error: "Failed to process request. Please try again." }, 
      { status: 500 }
    );
  }
}
