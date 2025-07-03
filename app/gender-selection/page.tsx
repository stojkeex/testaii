"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function GenderSelection() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    try {
      const profile = localStorage.getItem("alterraUserProfile")
      if (profile) {
        setUserProfile(JSON.parse(profile))
      } else {
        // No user profile, redirect to setup
        router.push("/profile-setup")
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      router.push("/profile-setup")
    }
  }, [router])

  const handleGenderSelect = (gender) => {
    localStorage.setItem("selectedCompanionGender", gender)
    router.push("/character-creation")
  }

  if (!userProfile) {
    return (
      <div className="h-screen w-full bg-animated-aurora flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-animated-aurora flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Choose Your Companion</h1>
        <p className="text-gray-300 mb-10">Hi {userProfile.name}! Who would you like to connect with?</p>
        <div className="space-y-4">
          <div
            onClick={() => handleGenderSelect("girl")}
            className="setup-card p-6 rounded-2xl cursor-pointer text-center hover:scale-105 transition-transform"
          >
            <img
              src="https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Female companion"
              className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/80x80/f093fb/ffffff?text=👩"
              }}
            />
            <h2 className="text-xl font-bold text-white mb-1">Female Companion</h2>
            <p className="text-gray-400 text-sm">Caring • Intelligent • Creative</p>
          </div>
          <div
            onClick={() => handleGenderSelect("man")}
            className="setup-card p-6 rounded-2xl cursor-pointer text-center hover:scale-105 transition-transform"
          >
            <img
              src="https://images.pexels.com/photos/5378700/pexels-photo-5378700.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Male companion"
              className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/80x80/667eea/ffffff?text=👨"
              }}
            />
            <h2 className="text-xl font-bold text-white mb-1">Male Companion</h2>
            <p className="text-gray-400 text-sm">Supportive • Wise • Adventurous</p>
          </div>
        </div>
      </div>
    </div>
  )
}
