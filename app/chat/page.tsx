"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { InfoModal } from "@/components/info-modal"
import { GroupManagementModal } from "@/components/group-management-modal"
import { ApiKeySetup } from "@/components/api-key-setup"

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

export default function ChatPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [allProfiles, setAllProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showGroupManagement, setShowGroupManagement] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const groupConversationRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeProfile) {
      loadChatHistory()
      if (messages.length === 0 && activeProfile.type === "individual" && activeProfile.isNew) {
        sendWelcomeMessage()
        const updatedProfile = { ...activeProfile, isNew: false }
        setActiveProfile(updatedProfile)
        const updatedProfiles = allProfiles.map((p) => (p.id === activeProfile.id ? updatedProfile : p))
        setAllProfiles(updatedProfiles)
        localStorage.setItem("alterraProfiles", JSON.stringify(updatedProfiles))
      } else if (activeProfile.type === "group") {
        startGroupConversation()
      }
    }
  }, [activeProfile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadData = () => {
    try {
      const profile = localStorage.getItem("alterraUserProfile")
      const profiles = localStorage.getItem("alterraProfiles")
      const activeChatId = localStorage.getItem("alterraActiveChatId")

      if (!profile) {
        router.push("/profile-setup")
        return
      }

      setUserProfile(JSON.parse(profile))

      if (!profiles || JSON.parse(profiles).length === 0) {
        router.push("/gender-selection")
        return
      }

      const parsedProfiles = JSON.parse(profiles)
      setAllProfiles(parsedProfiles)

      let activeProf = null
      if (activeChatId) {
        activeProf = parsedProfiles.find((p) => p.id === activeChatId)
      }
      if (!activeProf && parsedProfiles.length > 0) {
        activeProf = parsedProfiles[0]
        localStorage.setItem("alterraActiveChatId", activeProf.id)
      }
      setActiveProfile(activeProf)
    } catch (error) {
      console.error("Error loading data:", error)
      router.push("/")
    }
  }

  const loadChatHistory = () => {
    if (!activeProfile) return
    try {
      const history = JSON.parse(localStorage.getItem(`chatHistory_${activeProfile.id}`) || "[]")
      setMessages(history)
    } catch {
      setMessages([])
    }
  }

  const saveChatHistory = (newMessages) => {
    if (!activeProfile) return
    localStorage.setItem(`chatHistory_${activeProfile.id}`, JSON.stringify(newMessages))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const calculateTypingDelay = (messageLength) => {
    const baseDelay = 1000
    const charDelay = 50
    const maxDelay = 5000
    return Math.min(baseDelay + messageLength * charDelay, maxDelay)
  }

  const sendMessage = async (content) => {
    if (!content.trim() || !activeProfile) return

    const userMessage = {
      role: "user",
      content: { type: "text", content: content.trim() },
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    saveChatHistory(newMessages)
    setInputValue("")

    await handleAIResponse(content.trim(), newMessages)
  }

  const handleAIResponse = async (prompt, currentMessages) => {
    if (activeProfile.type === "individual") {
      await handleIndividualResponse(prompt, currentMessages)
    } else {
      await handleGroupResponse(prompt, currentMessages)
    }
  }

  const handleIndividualResponse = async (prompt, currentMessages) => {
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          profile: activeProfile,
          userProfile,
          history: currentMessages,
          isGroup: false,
        }),
      })

      const data = await response.json()

      if (data.error === "MISSING_API_KEY") {
        setIsTyping(false)
        setShowApiKeySetup(true)
        return
      }

      const typingDelay = calculateTypingDelay(data.response?.length || 20)

      setTimeout(() => {
        setIsTyping(false)
        const aiMessage = {
          role: "model",
          content: {
            type: "text",
            content: data.response || "Something went wrong. Please try again.",
            senderName: activeProfile.name,
          },
        }

        const updatedMessages = [...currentMessages, aiMessage]
        setMessages(updatedMessages)
        saveChatHistory(updatedMessages)
      }, typingDelay)
    } catch (error) {
      setIsTyping(false)
      console.error("Chat error:", error)

      const errorMessage = {
        role: "model",
        content: {
          type: "text",
          content: "Sorry, I'm having trouble connecting. Please try again.",
          senderName: activeProfile.name,
        },
      }
      const updatedMessages = [...currentMessages, errorMessage]
      setMessages(updatedMessages)
      saveChatHistory(updatedMessages)
    }
  }

  const handleGroupResponse = async (prompt: string, currentMessages: any[]) => {
    const availableMembers = activeProfile.members ?? []
    if (!availableMembers.length) return

    const respondingMember = availableMembers[Math.floor(Math.random() * availableMembers.length)]

    setIsTyping(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Group "${activeProfile.name}". Last message: "${prompt}". Reply as ${respondingMember.name}.`,
          profile: respondingMember,
          userProfile,
          history: currentMessages,
          isGroup: true,
        }),
      })
      const data = await res.json()

      if (data.error === "MISSING_API_KEY") {
        setIsTyping(false)
        setShowApiKeySetup(true)
        return
      }

      const typingDelay = calculateTypingDelay(data.response?.length ?? 20)

      setTimeout(() => {
        setIsTyping(false)
        const aiMessage = {
          role: "model",
          content: { type: "text", content: data.response || "...", senderName: respondingMember.name },
        }
        const updated = [...currentMessages, aiMessage]
        setMessages(updated)
        saveChatHistory(updated)
      }, typingDelay)
    } catch (err) {
      setIsTyping(false)
      console.error("Group chat error:", err)
    }
  }

  const startGroupConversation = () => {
    if (activeProfile.type !== "group" || !activeProfile.members) return

    if (groupConversationRef.current) {
      clearInterval(groupConversationRef.current)
    }

    if (messages.length > 25) return

    groupConversationRef.current = setInterval(
      async () => {
        if (activeProfile.members.length < 2) return

        const randomMember = activeProfile.members[Math.floor(Math.random() * activeProfile.members.length)]

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: `Start a casual conversation in the group chat about something interesting from your life.`,
              profile: randomMember,
              userProfile,
              history: messages,
              isGroup: true,
            }),
          })

          const data = await response.json()

          if (data.error === "MISSING_API_KEY") {
            setShowApiKeySetup(true)
            return
          }

          const typingDelay = calculateTypingDelay(data.response?.length || 20)

          setTimeout(() => {
            const aiMessage = {
              role: "model",
              content: {
                type: "text",
                content: data.response || "...",
                senderName: randomMember.name,
              },
            }

            const updatedMessages = [...messages, aiMessage]
            setMessages(updatedMessages)
            saveChatHistory(updatedMessages)

            setTimeout(
              () => {
                handleGroupResponse(data.response, updatedMessages)
              },
              Math.random() * 5000 + 2000,
            )
          }, typingDelay)
        } catch (error) {
          console.error("Auto group conversation error:", error)
        }
      },
      Math.random() * 30000 + 90000,
    )
  }

  useEffect(() => {
    return () => {
      if (groupConversationRef.current) {
        clearInterval(groupConversationRef.current)
      }
    }
  }, [])

  const sendWelcomeMessage = async () => {
    if (!activeProfile || activeProfile.type !== "individual") return

    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Greet ${userProfile.name} casually, like you know them. Keep it short and friendly.`,
          profile: activeProfile,
          userProfile,
          history: [],
        }),
      })

      const data = await response.json()

      if (data.error === "MISSING_API_KEY") {
        setIsTyping(false)
        setShowApiKeySetup(true)
        return
      }

      const typingDelay = calculateTypingDelay(data.response?.length || 20)

      setTimeout(() => {
        setIsTyping(false)
        const welcomeMessage = {
          role: "model",
          content: {
            type: "text",
            content: data.response || "Hey! 👋",
            senderName: activeProfile.name,
          },
        }

        const newMessages = [welcomeMessage]
        setMessages(newMessages)
        saveChatHistory(newMessages)
      }, typingDelay)
    } catch (error) {
      setIsTyping(false)
      console.error("Welcome message error:", error)
    }
  }

  const handleChatSelect = (chatId) => {
    const profile = allProfiles.find((p) => p.id === chatId)
    if (profile) {
      if (groupConversationRef.current) {
        clearInterval(groupConversationRef.current)
      }

      setActiveProfile(profile)
      localStorage.setItem("alterraActiveChatId", chatId)
      setShowInbox(false)
    }
  }

  const handleThemeChange = (themeClass) => {
    if (!activeProfile) return

    const updatedProfile = { ...activeProfile, theme: themeClass }
    setActiveProfile(updatedProfile)

    const updatedProfiles = allProfiles.map((p) => (p.id === activeProfile.id ? updatedProfile : p))
    setAllProfiles(updatedProfiles)
    localStorage.setItem("alterraProfiles", JSON.stringify(updatedProfiles))
    setShowThemeModal(false)
  }

  const handleUpdateGroup = (updatedGroup) => {
    setActiveProfile(updatedGroup)
    const updatedProfiles = allProfiles.map((p) => (p.id === updatedGroup.id ? updatedGroup : p))
    setAllProfiles(updatedProfiles)
    localStorage.setItem("alterraProfiles", JSON.stringify(updatedProfiles))
  }

  const getChatHistory = (chatId) => {
    try {
      return JSON.parse(localStorage.getItem(`chatHistory_${chatId}`) || "[]")
    } catch {
      return []
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const imageMessage = {
        role: "user",
        content: { type: "image", content: `📷 Image: ${file.name}` },
      }
      const newMessages = [...messages, imageMessage]
      setMessages(newMessages)
      saveChatHistory(newMessages)
    }
  }

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      const voiceMessage = {
        role: "user",
        content: { type: "voice", content: "🎤 Voice message" },
      }
      const newMessages = [...messages, voiceMessage]
      setMessages(newMessages)
      saveChatHistory(newMessages)
    } else {
      setIsRecording(true)
      setTimeout(() => {
        setIsRecording(false)
        const voiceMessage = {
          role: "user",
          content: { type: "voice", content: "🎤 Voice message" },
        }
        const newMessages = [...messages, voiceMessage]
        setMessages(newMessages)
        saveChatHistory(newMessages)
      }, 5000)
    }
  }

  if (!userProfile || !activeProfile) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-container bg-black no-gap">
        {/* Mobile Inbox Overlay */}
        {showInbox && (
          <div className="fixed inset-0 bg-black z-50 mobile-container no-gap">
            {/* Mobile Inbox Header */}
            <div className="mobile-header bg-black border-b border-gray-800 no-gap">
              <div className="flex items-center justify-between px-4 py-3 h-full">
                <button
                  onClick={() => setShowInbox(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-white">{userProfile?.name}</h1>
                <div className="flex space-x-2">
                  <Link
                    href="/create-group"
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    title="New Group"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="/gender-selection"
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    title="New Chat"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Chat List */}
            <div className="mobile-messages bg-black no-gap">
              {allProfiles.map((profile) => {
                const history = getChatHistory(profile.id)
                const lastMessage = history[history.length - 1]
                const snippet = lastMessage
                  ? lastMessage.content.type === "text"
                    ? lastMessage.content.content
                    : "Sent an attachment"
                  : "No messages yet."

                return (
                  <div
                    key={profile.id}
                    onClick={() => handleChatSelect(profile.id)}
                    className="flex items-center p-4 active:bg-gray-900 transition-colors border-b border-gray-900"
                  >
                    <img
                      src={profile.img || `https://placehold.co/56x56/667eea/ffffff?text=${profile.name.charAt(0)}`}
                      alt={profile.name}
                      className="w-14 h-14 rounded-full object-cover mr-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">
                          {profile.name}
                          {profile.type === "group" ? " (Group)" : ""}
                        </h3>
                        <span className="text-xs text-gray-500">now</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{snippet}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mobile Chat Interface */}
        <div className={`mobile-container no-gap ${activeProfile.theme || "bg-animated-blue-purple"}`}>
          {/* Mobile Header - Instagram Style */}
          <div className="mobile-header bg-black/90 backdrop-blur-sm border-b border-white/10 no-gap">
            <div className="flex items-center justify-between px-4 py-3 h-full">
              <div className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setShowInbox(true)}
                  className="p-2 mr-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img
                  src={
                    activeProfile.img || `https://placehold.co/40x40/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                  }
                  alt={activeProfile.name}
                  className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-lg truncate">{activeProfile.name}</h2>
                  {activeProfile.type === "individual" && (
                    <p className="text-gray-300 text-sm flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Active now
                    </p>
                  )}
                  {activeProfile.type === "group" && (
                    <p className="text-gray-300 text-sm">{activeProfile.members?.length || 0} members</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 012 2z"
                    />
                  </svg>
                </button>

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
                      {activeProfile.type === "individual" && (
                        <button
                          onClick={() => {
                            setShowInfoModal(true)
                            setShowDropdown(false)
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        >
                          Info
                        </button>
                      )}
                      {activeProfile.type === "group" && (
                        <button
                          onClick={() => {
                            setShowGroupManagement(true)
                            setShowDropdown(false)
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        >
                          Manage Group
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Messages Area */}
          <div className="mobile-messages px-4 py-2 space-y-3 messages-container no-gap">
            {activeProfile.isNew && (
              <div className="text-center p-4 text-gray-400 text-sm">
                <img
                  src={
                    activeProfile.img || `https://placehold.co/96x96/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                  }
                  alt={activeProfile.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-700"
                />
                <h3 className="text-xl font-bold text-white">{activeProfile.name}</h3>
                <p>You just created this {activeProfile.type === "group" ? "group" : "companion"}.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role !== "user" && (
                  <img
                    src={
                      activeProfile.type === "group" && message.content.senderName
                        ? activeProfile.members?.find((m) => m.name === message.content.senderName)?.img ||
                          `https://placehold.co/32x32/667eea/ffffff?text=${message.content.senderName.charAt(0)}`
                        : activeProfile.img ||
                          `https://placehold.co/32x32/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                    }
                    alt={message.content.senderName || activeProfile.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex flex-col">
                  {message.role !== "user" && activeProfile.type === "group" && message.content.senderName && (
                    <span className="text-xs text-gray-400 mb-1 ml-2">{message.content.senderName}</span>
                  )}
                  <div
                    className={`max-w-[280px] px-4 py-2 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {message.content.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end space-x-2 justify-start">
                <img
                  src={
                    activeProfile.img || `https://placehold.co/32x32/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                  }
                  alt={activeProfile.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
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

          {/* Mobile Input Area - EXACT bottom positioning */}
          <div className="mobile-input bg-black/90 backdrop-blur-sm border-t border-white/10 no-gap full-width">
            <div className="mobile-input-container">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(inputValue)
                  }}
                  className="flex items-center flex-1"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-white focus:outline-none px-2 py-2 text-base placeholder-gray-300"
                    style={{ fontSize: "16px" }}
                  />

                  {inputValue.trim() ? (
                    <button
                      type="submit"
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                    >
                      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handleVoiceRecord}
                        className={`p-2 transition-colors flex-shrink-0 ${
                          isRecording ? "text-red-400 animate-pulse" : "text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => sendMessage("❤️")}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </form>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Modals */}
        {showThemeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-white/10">
              <h2 className="text-xl font-bold text-center mb-6 text-white">Choose Theme</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {themes.map((theme) => (
                  <button
                    key={theme.class}
                    onClick={() => handleThemeChange(theme.class)}
                    className={`h-16 flex items-center justify-center text-white font-semibold text-sm relative ${theme.class} rounded-lg transition-transform hover:scale-105 ${
                      activeProfile.theme === theme.class ? "ring-2 ring-white" : ""
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="mt-6 w-full btn-primary py-2 px-4 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showInfoModal && <InfoModal profile={activeProfile} onClose={() => setShowInfoModal(false)} />}

        {showGroupManagement && (
          <GroupManagementModal
            group={activeProfile}
            allProfiles={allProfiles}
            onClose={() => setShowGroupManagement(false)}
            onUpdateGroup={handleUpdateGroup}
          />
        )}

        {showApiKeySetup && <ApiKeySetup onClose={() => setShowApiKeySetup(false)} />}
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      {/* Desktop Inbox Panel */}
      {allProfiles.length > 0 && (
        <div className="w-80 flex-shrink-0">
          <div className="h-full bg-black border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Chats</h1>
              <div className="flex space-x-2">
                <Link
                  href="/create-group"
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  title="New Group"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
                <Link
                  href="/gender-selection"
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  title="New Chat"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {allProfiles.map((profile) => {
                const history = getChatHistory(profile.id)
                const lastMessage = history[history.length - 1]
                const snippet = lastMessage
                  ? lastMessage.content.type === "text"
                    ? lastMessage.content.content
                    : "Sent an attachment"
                  : "No messages yet."

                return (
                  <div
                    key={profile.id}
                    onClick={() => handleChatSelect(profile.id)}
                    className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-900 ${
                      profile.id === activeProfile.id ? "bg-gray-800" : ""
                    }`}
                  >
                    <img
                      src={profile.img || `https://placehold.co/56x56/667eea/ffffff?text=${profile.name.charAt(0)}`}
                      alt={profile.name}
                      className="w-14 h-14 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-white font-semibold truncate">
                        {profile.name}
                        {profile.type === "group" ? " (Group)" : ""}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">{snippet}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Chat Area */}
      <div className={`flex-1 flex flex-col ${activeProfile.theme || "bg-animated-blue-purple"}`}>
        {/* Desktop Header */}
        <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center flex-1 min-w-0">
            <img
              src={activeProfile.img || `https://placehold.co/40x40/667eea/ffffff?text=${activeProfile.name.charAt(0)}`}
              alt={activeProfile.name}
              className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-lg truncate">{activeProfile.name}</h2>
              {activeProfile.type === "individual" && (
                <p className="text-gray-300 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Active now
                </p>
              )}
              {activeProfile.type === "group" && (
                <p className="text-gray-300 text-sm">{activeProfile.members?.length || 0} members</p>
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
                {activeProfile.type === "individual" && (
                  <button
                    onClick={() => {
                      setShowInfoModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Info
                  </button>
                )}
                {activeProfile.type === "group" && (
                  <button
                    onClick={() => {
                      setShowGroupManagement(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Manage Group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeProfile.isNew && (
            <div className="text-center p-4 text-gray-400 text-sm">
              <img
                src={
                  activeProfile.img || `https://placehold.co/96x96/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                }
                alt={activeProfile.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-700"
              />
              <h3 className="text-xl font-bold text-white">{activeProfile.name}</h3>
              <p>You just created this {activeProfile.type === "group" ? "group" : "companion"}.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role !== "user" && (
                <img
                  src={
                    activeProfile.type === "group" && message.content.senderName
                      ? activeProfile.members?.find((m) => m.name === message.content.senderName)?.img ||
                        `https://placehold.co/32x32/667eea/ffffff?text=${message.content.senderName.charAt(0)}`
                      : activeProfile.img ||
                        `https://placehold.co/32x32/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                  }
                  alt={message.content.senderName || activeProfile.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col">
                {message.role !== "user" && activeProfile.type === "group" && message.content.senderName && (
                  <span className="text-xs text-gray-400 mb-1 ml-2">{message.content.senderName}</span>
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
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end space-x-2 justify-start">
              <img
                src={
                  activeProfile.img || `https://placehold.co/32x32/667eea/ffffff?text=${activeProfile.name.charAt(0)}`
                }
                alt={activeProfile.name}
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

        {/* Desktop Input */}
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

        {/* Desktop Modals */}
        {showThemeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-white/10">
              <h2 className="text-xl font-bold text-center mb-6 text-white">Choose Theme</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {themes.map((theme) => (
                  <button
                    key={theme.class}
                    onClick={() => handleThemeChange(theme.class)}
                    className={`h-16 flex items-center justify-center text-white font-semibold text-sm relative ${theme.class} rounded-lg transition-transform hover:scale-105 ${
                      activeProfile.theme === theme.class ? "ring-2 ring-white" : ""
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="mt-6 w-full btn-primary py-2 px-4 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showInfoModal && <InfoModal profile={activeProfile} onClose={() => setShowInfoModal(false)} />}

        {showGroupManagement && (
          <GroupManagementModal
            group={activeProfile}
            allProfiles={allProfiles}
            onClose={() => setShowGroupManagement(false)}
            onUpdateGroup={handleUpdateGroup}
          />
        )}

        {showApiKeySetup && <ApiKeySetup onClose={() => setShowApiKeySetup(false)} />}
      </div>
    </div>
  )
}
