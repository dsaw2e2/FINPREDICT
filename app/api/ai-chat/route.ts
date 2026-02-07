import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
  const keyVal = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  console.log("[v0] GOOGLE_GENERATIVE_AI_API_KEY exists:", !!keyVal, "length:", keyVal?.length ?? 0)
  console.log("[v0] GEMINI_API_KEY exists:", !!geminiKey, "length:", geminiKey?.length ?? 0)
  
  // List all env vars that contain GEMINI or GOOGLE
  const relevantKeys = Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("GOOGLE"))
  console.log("[v0] Relevant env var keys:", relevantKeys)

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `You are FinPredict AI Assistant — an expert financial analyst and stock market advisor.

Your capabilities:
- Analyze stock prices and provide insights on energy companies (Saudi Aramco, ExxonMobil, Shell, BP, TotalEnergies, Chevron, ConocoPhillips, Equinor, Enel, Iberdrola, E.ON, RWE, Orsted, Vestas, Siemens Energy, Neste)
- Explain market trends, price movements, and factors affecting energy stocks
- Provide educational information about investing, technical analysis, and fundamental analysis
- Discuss macroeconomic factors: oil prices (Brent/WTI), gas prices (TTF/Henry Hub), carbon credits (EU ETS), interest rates, inflation
- Give context about SARIMAX, Prophet, and LSTM prediction models used on the platform
- Explain how geopolitical events, OPEC decisions, and renewable energy transitions affect energy stocks

Rules:
- Always respond in the same language the user writes in (Russian, English, or Kazakh)
- Never give specific buy/sell recommendations — always add a disclaimer that this is not financial advice
- Be concise but thorough. Use bullet points for clarity
- When discussing predictions, explain the methodology and confidence levels
- Reference real market data and factors when possible
- If asked about a specific ticker, provide company background, recent performance context, and key factors to watch`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
