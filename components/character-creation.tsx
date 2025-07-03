"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Profile, UserProfile } from "@/types"

interface CharacterCreationProps {
  onComplete: (profile: Profile) => void
  userProfile: UserProfile | null
}

const countries = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Argentina", code: "AR" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Belgium", code: "BE" },
  { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Croatia", code: "HR" },
  { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Greece", code: "GR" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Ireland", code: "IE" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Mexico", code: "MX" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nigeria", code: "NG" },
  { name: "Norway", code: "NO" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Russia", code: "RU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Serbia", code: "RS" },
  { name: "Slovenia", code: "SI" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Turkey", code: "TR" },
  { name: "United Kingdom", code: "GB" },
  { name: "USA", code: "US" },
]

const languageKnowledge: Record<string, { native: string; fluent: string[]; basic: string[] }> = {
  Slovenia: { native: "sl", fluent: ["en", "hr", "sr", "bs"], basic: ["de", "it"] },
  Serbia: { native: "sr", fluent: ["en"], basic: ["ru", "de"] },
  Italy: { native: "it", fluent: ["en"], basic: ["es", "fr"] },
  Germany: { native: "de", fluent: ["en"], basic: ["fr"] },
  USA: { native: "en", fluent: [], basic: ["es"] },
  China: { native: "zh", fluent: [], basic: ["en"] },
  Japan: { native: "ja", fluent: [], basic: ["en"] },
  France: { native: "fr", fluent: ["en"], basic: ["es", "de"] },
  Spain: { native: "es", fluent: ["en"], basic: ["fr", "pt"] },
  Brazil: { native: "pt", fluent: ["es"], basic: ["en"] },
  Albania: { native: "sq", fluent: ["it"], basic: ["en", "el"] },
}

export function CharacterCreation({ onComplete, userProfile }: CharacterCreationProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [traits, setTraits] = useState("")
  const [nationality, setNationality] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [currentGender, setCurrentGender] = useState<"girl" | "man">("girl")

  useEffect(() => {
    setIsValid(name.trim() !== "" && age.trim() !== "" && !isNaN(Number(age)) && Number(age) > 0 && nationality !== "")
  }, [name, age, nationality])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      alert("Image is too large. Max 4MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!isValid) return

    const newProfile: Profile = {
      id: `profile_${Date.now()}`,
      type: "individual",
      name: name.trim(),
      age: Number(age),
      traits: traits
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      nationality,
      languages: languageKnowledge[nationality] || { native: "en", fluent: ["en"], basic: [] },
      gender: currentGender,
      img: uploadedImage || undefined,
      isNew: true,
      theme: "bg-animated-blue-purple",
    }

    onComplete(newProfile)
  }

  return (
    <div className="h-full w-full bg-animated-sunset flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
          Create Your {currentGender === "girl" ? "Female" : "Male"} Companion
        </h1>
        <div className="setup-card p-6 rounded-2xl">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {uploadedImage ? (
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              ) : (
                <label
                  htmlFor="image-upload"
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
                id="image-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Upload photo (optional)</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="input-style w-full rounded-lg py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                className="input-style w-full rounded-lg py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="traits" className="block text-sm font-medium text-gray-300 mb-2">
                Personality Traits
              </label>
              <input
                type="text"
                id="traits"
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                placeholder="e.g., funny, intelligent, caring"
                className="input-style w-full rounded-lg py-3 px-4"
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-300 mb-2">
                Nationality *
              </label>
              <select
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="input-style w-full rounded-lg py-3 px-4"
              >
                <option value="" disabled>
                  Select nationality
                </option>
                {countries
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`btn-primary w-full py-3 rounded-lg text-lg font-semibold mt-6 ${!isValid ? "opacity-50" : ""}`}
          >
            Create & Start Chatting
          </button>
        </div>
      </div>
    </div>
  )
}
