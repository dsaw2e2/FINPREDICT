import { convertToModelMessages, streamText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (!apiKey) {
    return Response.json({ error: "API Key not found" }, { status: 500 })
  }

  try {
    const body = await req.json()
    
    // ПРОВЕРКА: Если messages не переданы или это не массив, выдаем ошибку вместо падения
    if (!body || !Array.isArray(body.messages)) {
      console.error("[AI Chat] Invalid request body:", body)
      return Response.json({ error: "Messages are required and must be an array" }, { status: 400 })
    }

    const { messages } = body

    // Очистка сообщений для Gemini
    const cleanMessages = messages.map((m: any) => ({
      role: m.role || 'user',
      content: m.content || '',
    }))

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: "You are FinPredict AI Assistant — an expert financial analyst. Respond in the user's language.",
      messages: convertToModelMessages(cleanMessages),
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[AI Chat Error]:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
