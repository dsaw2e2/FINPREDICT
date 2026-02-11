// /app/api/ai-chat/route.ts
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("[AI Chat] Missing GOOGLE_GENERATIVE_AI_API_KEY");
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const body = await req.json();

    // 🛡️ STRICT VALIDATION
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      console.warn("[AI Chat] Invalid messages payload");
      return Response.json(
        { error: "Invalid request: 'messages' must be a non-empty array" },
        { status: 400 }
      );
    }

    // ✅ CRITICAL FIX: Use V2-SPEC MODEL (removes "-latest" suffix)
    // "gemini-1.5-flash" = v2 spec | "gemini-1.5-flash-latest" = v3 spec (unsupported in AI SDK 5)
    const cleanMessages = body.messages
      .filter((m): m is { role: string; content: string } => 
        m && 
        typeof m === 'object' && 
        typeof m.role === 'string' && 
        typeof m.content === 'string' &&
        m.content.trim().length > 0
      )
      .map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content.trim(),
      }));

    if (cleanMessages.length === 0) {
      return Response.json(
        { error: "No valid messages found after sanitization" },
        { status: 400 }
      );
    }

    // ✅ FIXED MODEL STRING: "gemini-1.5-flash" (v2 spec compatible)
    const result = await streamText({
      model: google("gemini-1.5-flash"), // ← REMOVED "-latest" SUFFIX
      system: "You are FinPredict AI Assistant — an expert financial analyst. Respond concisely in the user's language.",
      messages: cleanMessages, // ← NO convertToModelMessages (causes crashes)
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[AI Chat Fatal Error]:", {
      message: error.message,
      name: error.name,
    });
    return Response.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
