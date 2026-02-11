"use client"

import React, { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react" // Используем стандартный хук

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Упрощенный вызов useChat
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/ai-chat",
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <>
      {/* Кнопка открытия чата */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        }`}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
          isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
            <h3 className="font-semibold text-sm">{t.aiAssistant}</h3>
            <p className="opacity-70 text-xs">{t.poweredBy}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[420px]">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm opacity-50">{t.askAboutStocks}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {["Saudi Aramco?", "Oil forecast?", "AAPL vs MSFT?"].map(s => (
                    <button 
                      key={s} 
                      onClick={() => append({ role: 'user', content: s })}
                      className="px-3 py-1 bg-gray-500/10 rounded-full text-xs hover:bg-gray-500/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-500/20 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={t.sendMessage}
              className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none ${
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
