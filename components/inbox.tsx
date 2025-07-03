"use client"

import type { Profile } from "@/types"

interface InboxProps {
  profiles: Profile[]
  activeChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onNewGroup: () => void
  setProfiles: (profiles: Profile[]) => void
}

export function Inbox({ profiles, activeChatId, onChatSelect, onNewChat, onNewGroup, setProfiles }: InboxProps) {
  const getChatHistory = (chatId: string) => {
    try {
      return JSON.parse(localStorage.getItem(`chatHistory_${chatId}`) || "[]")
    } catch {
      return []
    }
  }

  return (
    <div className="h-full bg-black border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Chats</h1>
        <div className="flex space-x-2">
          <button
            onClick={onNewGroup}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="New Group"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button onClick={onNewChat} className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="New Chat">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {profiles.map((profile) => {
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
              onClick={() => onChatSelect(profile.id)}
              className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-900 ${
                profile.id === activeChatId ? "bg-gray-800" : ""
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
  )
}
