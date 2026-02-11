import { convertToModelMessages, streamText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) return Response.json({ error: "No API Key" }, { status: 500 })

  const google = createGoogleGenerativeAI({ apiKey })

  try {
    const { messages } = await req.json()

    // Важно: Gemini строго требует только role и content
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: "You are a helpful financial assistant.",
      messages: convertToModelMessages(formattedMessages),
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("API Error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
