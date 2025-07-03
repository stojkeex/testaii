"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreateGroup() {
  const router = useRouter()
  const [groupName, setGroupName] = useState("")
  const [groupImage, setGroupImage] = useState(null)
  const [allProfiles, setAllProfiles] = useState([])
  const [selectedProfiles, setSelectedProfiles] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const profiles = localStorage.getItem("alterraProfiles")
      const user = localStorage.getItem("alterraUserProfile")

      if (!user) {
        router.push("/profile-setup")
        return
      }

      setUserProfile(JSON.parse(user))

      if (!profiles) {
        router.push("/gender-selection")
        return
      }

      const parsedProfiles = JSON.parse(profiles).filter((p) => p.type === "individual")
      setAllProfiles(parsedProfiles)
    } catch (error) {
      console.error("Error loading data:", error)
      router.push("/")
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      alert("Image is too large. Max 4MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setGroupImage(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const toggleProfile = (profileId) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId],
    )
  }

  const createGroup = () => {
    if (!groupName.trim() || selectedProfiles.length < 2) {
      alert("Group name is required and select at least 2 members")
      return
    }

    const selectedMembers = allProfiles.filter((p) => selectedProfiles.includes(p.id))

    const newGroup = {
      id: `group_${Date.now()}`,
      type: "group",
      name: groupName.trim(),
      members: selectedMembers,
      img: groupImage,
      theme: "bg-animated-cosmic",
      isNew: true,
    }

    try {
      const existingProfiles = JSON.parse(localStorage.getItem("alterraProfiles") || "[]")
      const updatedProfiles = [newGroup, ...existingProfiles]
      localStorage.setItem("alterraProfiles", JSON.stringify(updatedProfiles))
      localStorage.setItem("alterraActiveChatId", newGroup.id)

      router.push("/chat")
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const handleBack = () => {
    // Don't reset anything, just go back to chat
    router.push("/chat")
  }

  return (
    <div className="h-screen w-full bg-animated-aurora flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="p-2 mr-3 hover:bg-white/10 rounded-full transition-colors">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Create Group</h1>
        </div>

        <div className="setup-card p-6 rounded-2xl">
          {/* Group Image Upload */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {groupImage ? (
                <img
                  src={groupImage || "/placeholder.svg"}
                  alt="Group Preview"
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              ) : (
                <label
                  htmlFor="group-image-upload"
                  className="w-20 h-20 rounded-full bg-gray-700 cursor-pointer flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </label>
              )}
              <input
                type="file"
                id="group-image-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Group photo (optional)</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="input-style w-full rounded-lg py-3 px-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Members * (minimum 2)</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => toggleProfile(profile.id)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProfiles.includes(profile.id)
                        ? "bg-purple-600/30 border border-purple-500"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <img
                      src={profile.img || `https://placehold.co/40x40/667eea/ffffff?text=${profile.name.charAt(0)}`}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{profile.name}</h3>
                      <p className="text-gray-400 text-sm">{profile.nationality}</p>
                    </div>
                    {selectedProfiles.includes(profile.id) && (
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={createGroup}
            disabled={!groupName.trim() || selectedProfiles.length < 2}
            className={`btn-primary w-full py-3 rounded-lg text-lg font-semibold mt-6 transition-all ${
              !groupName.trim() || selectedProfiles.length < 2 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            Create Group ({selectedProfiles.length} members)
          </button>
        </div>
      </div>
    </div>
  )
}
