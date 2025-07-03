"use client"

import type { Theme } from "@/types"

interface ThemeModalProps {
  themes: Theme[]
  currentTheme: string
  onThemeSelect: (themeClass: string) => void
  onClose: () => void
}

export function ThemeModal({ themes, currentTheme, onThemeSelect, onClose }: ThemeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-white/10">
        <h2 className="text-xl font-bold text-center mb-6 text-white">Choose Theme</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {themes.map((theme) => (
            <button
              key={theme.class}
              onClick={() => onThemeSelect(theme.class)}
              className={`h-16 flex items-center justify-center text-white font-semibold text-sm relative ${theme.class} rounded-lg transition-transform hover:scale-105 ${
                currentTheme === theme.class ? "ring-2 ring-white" : ""
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full btn-primary py-2 px-4 rounded-lg font-semibold">
          Close
        </button>
      </div>
    </div>
  )
}
