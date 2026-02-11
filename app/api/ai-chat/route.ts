import { convertToModelMessages, streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return Response.json({ error: "API Key not found" }, { status: 500 })
  }

  const google = createGoogleGenerativeAI({ apiKey })

  try {
    const { messages } = await req.json()

    // Очистка сообщений: Gemini принимает ТОЛЬКО role и content
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: "You are FinPredict AI Assistant — an expert financial analyst. Use Russian, English, or Kazakh based on user input.",
      messages: convertToModelMessages(cleanMessages),
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[AI Chat Error]:", error)
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
