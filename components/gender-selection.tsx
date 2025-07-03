"use client"

import type { UserProfile } from "@/types"

interface GenderSelectionProps {
  onGenderSelect: (gender: "girl" | "man") => void
  userProfile: UserProfile | null
}

export function GenderSelection({ onGenderSelect, userProfile }: GenderSelectionProps) {
  return (
    <div className="h-full w-full bg-animated-aurora flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Choose Your Companion</h1>
        <p className="text-gray-300 mb-10">
          {userProfile ? `Hi ${userProfile.name}! ` : ""}Who would you like to connect with?
        </p>
        <div className="space-y-4">
          <div
            onClick={() => onGenderSelect("girl")}
            className="setup-card p-6 rounded-2xl cursor-pointer text-center hover:scale-105 transition-transform"
          >
            <img
              src="https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Female companion"
              className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
            />
            <h2 className="text-xl font-bold text-white mb-1">Female Companion</h2>
            <p className="text-gray-400 text-sm">Caring • Intelligent • Creative</p>
          </div>
          <div
            onClick={() => onGenderSelect("man")}
            className="setup-card p-6 rounded-2xl cursor-pointer text-center hover:scale-105 transition-transform"
          >
            <img
              src="https://images.pexels.com/photos/5378700/pexels-photo-5378700.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Male companion"
              className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
            />
            <h2 className="text-xl font-bold text-white mb-1">Male Companion</h2>
            <p className="text-gray-400 text-sm">Supportive • Wise • Adventurous</p>
          </div>
        </div>
      </div>
    </div>
  )
}
