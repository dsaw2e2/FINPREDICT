import { convertToModelMessages, streamText } from "ai"
import { google } from "@ai-sdk/google" // Используем прямой импорт провайдера

export const maxDuration = 30

const SYSTEM_PROMPT = `You are FinPredict AI Assistant — an expert financial analyst and stock market advisor...` // Ваш промпт

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (!apiKey) {
    return Response.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured." },
      { status: 500 }
    )
  }

  try {
    const { messages } = await req.json()

    // Очистка сообщений для соответствия схеме Gemini
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const result = await streamText({
      model: google("gemini-2.0-flash"), // Провайдер автоматически подхватит настройки
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(cleanMessages),
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[FinPredict AI] Chat error:", error.message)
    return Response.json(
      { error: `AI request failed: ${error.message}` },
      { status: 500 }
    )
  }
}
