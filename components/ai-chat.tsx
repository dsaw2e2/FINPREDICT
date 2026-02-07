"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

const chatTransport = new DefaultChatTransport({ api: "/api/ai-chat" })

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

interface AIChatProps {
  isDarkMode: boolean
  translations: {
    aiAssistant: string
    askAboutStocks: string
    sendMessage: string
    thinking: string
    poweredBy: string
    disclaimer: string
  }
}

export default function AIChat({ isDarkMode, translations: t }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? isDarkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-700"
            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        }`}
        aria-label={isOpen ? "Close chat" : t.aiAssistant}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.aiAssistant}</h3>
              <p className="text-white/70 text-xs">{t.poweredBy}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[420px]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                  </svg>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t.askAboutStocks}
                </p>
                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {[
                    "Saudi Aramco analysis?",
                    "Oil price forecast?",
                    "AAPL vs MSFT?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        sendMessage({ text: suggestion })
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isDarkMode
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const text = getMessageText(message)
              if (!text) return null

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md"
                        : isDarkMode
                          ? "bg-gray-800 text-gray-200 rounded-bl-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{text}</div>
                  </div>
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}>
                  <div className="flex gap-1.5">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`} style={{ animationDelay: "0ms" }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`} style={{ animationDelay: "150ms" }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-500" : "bg-gray-400"}`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <div className={`px-4 py-1.5 text-center ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
            <p className="text-[10px]">{t.disclaimer}</p>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className={`p-3 border-t flex gap-2 ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.sendMessage}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-750"
                  : "bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-50"
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
