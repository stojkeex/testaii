"use client"

import { useState } from "react"

interface GroupManagementModalProps {
  group: any
  allProfiles: any[]
  onClose: () => void
  onUpdateGroup: (updatedGroup: any) => void
}

export function GroupManagementModal({ group, allProfiles, onClose, onUpdateGroup }: GroupManagementModalProps) {
  const [groupName, setGroupName] = useState(group.name)
  const [selectedMembers, setSelectedMembers] = useState(group.members?.map((m) => m.id) || [])
  const [groupImage, setGroupImage] = useState(group.img || null)

  const availableProfiles = allProfiles.filter((p) => p.type === "individual")

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

  const toggleMember = (profileId) => {
    setSelectedMembers((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId],
    )
  }

  const handleSave = () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert("Group name is required and select at least 2 members")
      return
    }

    const updatedMembers = availableProfiles.filter((p) => selectedMembers.includes(p.id))

    const updatedGroup = {
      ...group,
      name: groupName.trim(),
      members: updatedMembers,
      img: groupImage,
    }

    onUpdateGroup(updatedGroup)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-6 text-white">Manage Group</h2>

        <div className="space-y-4">
          {/* Group Image */}
          <div className="text-center">
            <div className="relative inline-block">
              {groupImage ? (
                <img
                  src={groupImage || "/placeholder.svg"}
                  alt="Group"
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

          {/* Group Name */}
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

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Members * (minimum 2)</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => toggleMember(profile.id)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMembers.includes(profile.id)
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
                  {selectedMembers.includes(profile.id) && (
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

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!groupName.trim() || selectedMembers.length < 2}
            className={`flex-1 btn-primary py-2 px-4 rounded-lg font-semibold transition-all ${
              !groupName.trim() || selectedMembers.length < 2 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
