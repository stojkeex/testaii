"use client"

import { useState, useEffect, useRef } from "react"
import type { Profile, UserProfile, ChatMessage } from "@/types"
import { ThemeModal } from "./theme-modal"

interface ChatInterfaceProps {
  profile: Profile
  userProfile: UserProfile
  onBackToInbox: () => void
  onUpdateProfile: (profile: Profile) => void
  allProfiles: Profile[]
  setAllProfiles: (profiles: Profile[]) => void
  isMobile: boolean
}

const themes = [
  { name: "Blue Purple", class: "bg-animated-blue-purple" },
  { name: "Peach Yellow", class: "bg-animated-peach-yellow" },
  { name: "Red Orange", class: "bg-animated-red-orange" },
  { name: "Cosmic", class: "bg-animated-cosmic" },
  { name: "Aurora", class: "bg-animated-aurora" },
  { name: "Sunset", class: "bg-animated-sunset" },
  { name: "Ocean", class: "bg-animated-ocean" },
  { name: "Forest", class: "bg-animated-forest" },
]

export function ChatInterface({
  profile,
  userProfile,
  onBackToInbox,
  onUpdateProfile,
  allProfiles,
  setAllProfiles,
  isMobile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groupTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadChatHistory()
    if (messages.length === 0 && profile.type === "individual") {
      sendWelcomeMessage()
    }
  }, [profile.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem(`chatHistory_${profile.id}`) || "[]")
      setMessages(history)
    } catch {
      setMessages([])
    }
  }

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    localStorage.setItem(`chatHistory_${profile.id}`, JSON.stringify(newMessages))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      role: "user",
      content: { type: "text", content: content.trim() },
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    saveChatHistory(newMessages)
    setInputValue("")

    if (profile.type === "individual") {
      await handleIndividualResponse(content.trim(), newMessages)
    } else {
      await handleGroupResponse(content.trim(), newMessages)
    }
  }

  const handleIndividualResponse = async (prompt: string, currentMessages: ChatMessage[]) => {
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          profile,
          userProfile,
          history: currentMessages,
        }),
      })

      const data = await response.json()

      setTimeout(
        () => {
          setIsTyping(false)
          const aiMessage: ChatMessage = {
            role: "model",
            content: {
              type: "text",
              content: data.response || "Sorry, something went wrong...",
              senderName: profile.name,
            },
          }

          const updatedMessages = [...currentMessages, aiMessage]
          setMessages(updatedMessages)
          saveChatHistory(updatedMessages)
        },
        Math.random() * 2000 + 1000,
      )
    } catch (error) {
      setIsTyping(false)
      console.error("Chat error:", error)
    }
  }

  const handleGroupResponse = async (prompt: string, currentMessages: ChatMessage[]) => {
    // Group chat logic - multiple AI responses
    let lastSpeaker = userProfile.name
    let lastMessage = prompt

    for (let i = 0; i < 2; i++) {
      const availableMembers = profile.members?.filter((m) => m.name !== lastSpeaker) || []
      if (availableMembers.length === 0) break

      const respondingMember = availableMembers[Math.floor(Math.random() * availableMembers.length)]
      setIsTyping(true)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are in a group chat named "${profile.name}". The last message from ${lastSpeaker} was: "${lastMessage}". As ${respondingMember.name}, give a short, casual reply.`,
            profile: respondingMember,
            userProfile,
            history: currentMessages,
          }),
        })

        const data = await response.json()

        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

        setIsTyping(false)
        const aiMessage: ChatMessage = {
          role: "model",
          content: {
            type: "text",
            content: data.response || "...",
            senderName: respondingMember.name,
          },
        }

        currentMessages = [...currentMessages, aiMessage]
        setMessages(currentMessages)
        saveChatHistory(currentMessages)

        lastSpeaker = respondingMember.name
        lastMessage = data.response || "..."
      } catch (error) {
        setIsTyping(false)
        console.error("Group chat error:", error)
        break
      }
    }
  }

  const sendWelcomeMessage = async () => {
    if (profile.type !== "individual") return

    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Greet ${userProfile.name} casually, like you know them. Keep it short and friendly.`,
          profile,
          userProfile,
          history: [],
        }),
      })

      const data = await response.json()

      setTimeout(() => {
        setIsTyping(false)
        const welcomeMessage: ChatMessage = {
          role: "model",
          content: {
            type: "text",
            content: data.response || "Hey! 👋",
            senderName: profile.name,
          },
        }

        const newMessages = [welcomeMessage]
        setMessages(newMessages)
        saveChatHistory(newMessages)
      }, 1500)
    } catch (error) {
      setIsTyping(false)
      console.error("Welcome message error:", error)
    }
  }

  const handleThemeChange = (themeClass: string) => {
    const updatedProfile = { ...profile, theme: themeClass }
    onUpdateProfile(updatedProfile)
    setShowThemeModal(false)
  }

  return (
    <div className={`h-full flex flex-col ${profile.theme || "bg-animated-blue-purple"}`}>
      {/* Header */}
      <div className="chat-header flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center">
          {isMobile && (
            <button onClick={onBackToInbox} className="p-2 mr-3 hover:bg-white/10 rounded-full transition-colors">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img
            src={profile.img || `https://placehold.co/32x32/667eea/ffffff?text=${profile.name.charAt(0)}`}
            alt={profile.name}
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
          <div>
            <h2 className="text-white font-semibold text-lg">{profile.name}</h2>
            {profile.type === "individual" && (
              <p className="text-gray-300 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Active now
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setShowThemeModal(true)
                  setShowDropdown(false)
                }}
                className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                Change Theme
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {profile.isNew && (
          <div className="text-center p-4 text-gray-400 text-sm">
            <img
              src={profile.img || `https://placehold.co/96x96/667eea/ffffff?text=${profile.name.charAt(0)}`}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-700"
            />
            <h3 className="text-xl font-bold text-white">{profile.name}</h3>
            <p>You just created this companion.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role !== "user" && (
              <img
                src={profile.img || `https://placehold.co/28x28/667eea/ffffff?text=${profile.name.charAt(0)}`}
                alt={message.content.senderName || profile.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {message.content.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end space-x-2 justify-start">
            <img
              src={profile.img || `https://placehold.co/28x28/667eea/ffffff?text=${profile.name.charAt(0)}`}
              alt={profile.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="bg-gray-800 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(inputValue)
          }}
          className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white focus:outline-none px-3 py-2 placeholder-gray-300"
          />
          {inputValue.trim() && (
            <button type="submit" className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Theme Modal */}
      {showThemeModal && (
        <ThemeModal
          themes={themes}
          currentTheme={profile.theme}
          onThemeSelect={handleThemeChange}
          onClose={() => setShowThemeModal(false)}
        />
      )}
    </div>
  )
}
