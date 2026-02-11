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

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: "You are FinPredict AI Assistant. Help with financial analysis.",
      // Важно: эта функция правильно подготавливает сообщения для Gemini
      messages: convertToModelMessages(messages),
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[AI Chat Error]:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
