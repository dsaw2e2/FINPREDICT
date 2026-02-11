"use client"

import React, { useState, useRef, useEffect } from "react"
// Исправленный импорт для новых версий SDK
import { useChat } from "ai/react"

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

  // Стандартная настройка без лишних транспортов
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/ai-chat",
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-gray-500" : "bg-gradient-to-br from-blue-500 to-purple-600"
        } text-white`}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
          isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
            <h3 className="font-semibold text-sm">{t.aiAssistant}</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[420px]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" ? "bg-blue-600 text-white" : (isDarkMode ? "bg-gray-800" : "bg-gray-100")
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onFormSubmit} className="p-3 border-t border-gray-500/20 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={t.sendMessage}
              className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
            />
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
