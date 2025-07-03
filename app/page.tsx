"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Homepage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [allProfiles, setAllProfiles] = useState([])

  useEffect(() => {
    // Check if user already has profile and companions
    try {
      const profile = localStorage.getItem("alterraUserProfile")
      const profiles = localStorage.getItem("alterraProfiles")

      if (profile) {
        setUserProfile(JSON.parse(profile))
      }

      if (profiles) {
        setAllProfiles(JSON.parse(profiles))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }, [])

  const handleGetStarted = () => {
    if (userProfile && allProfiles.length > 0) {
      // User already has everything set up, go to chat
      router.push("/chat")
    } else if (userProfile) {
      // User has profile but no companions, go to gender selection
      router.push("/gender-selection")
    } else {
      // New user, go to profile setup
      router.push("/profile-setup")
    }
  }

  return (
    <div className="h-screen w-full bg-animated-cosmic flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-6">
          Alterra
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-500 mx-auto rounded-full mb-8"></div>
        <p className="text-lg text-gray-300 mb-10 leading-relaxed">
          Create your perfect digital companion, powered by advanced AI.
        </p>
        <button
          onClick={handleGetStarted}
          className="btn-primary px-10 py-3 rounded-full text-lg font-semibold shadow-lg w-full hover:scale-105 transition-transform"
        >
          {userProfile && allProfiles.length > 0 ? "Continue Chatting" : "Get Started"}
        </button>

        {userProfile && <p className="text-gray-400 text-sm mt-4">Welcome back, {userProfile.name}!</p>}
      </div>
    </div>
  )
}
