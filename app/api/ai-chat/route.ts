import {
  convertToModelMessages,
  streamText,
} from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are FinPredict AI Assistant — an expert financial analyst and stock market advisor...` // Ваш промпт без изменений

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey || apiKey.length < 10) {
    return Response.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured." },
      { status: 500 }
    )
  }

  const google = createGoogleGenerativeAI({ apiKey })

  try {
    const { messages } = await req.json()

    // ОЧИСТКА СООБЩЕНИЙ: Оставляем только те поля, которые требует схема ModelMessage
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(cleanMessages), // Используем очищенные сообщения
      abortSignal: req.signal,
    })

    // Используем стандартный метод для потоковой передачи данных
    return result.toDataStreamResponse()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[FinPredict AI] Chat error:", errMsg)
    return Response.json(
      { error: `AI request failed: ${errMsg}` },
      { status: 500 }
    )
  }
}
