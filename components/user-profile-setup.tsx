"use client"

import { useState, useEffect } from "react"
import type { UserProfile } from "@/types"

interface UserProfileSetupProps {
  onComplete: (profile: UserProfile) => void
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

export function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("")
  const [location, setLocation] = useState("")
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    setIsValid(name.trim() !== "" && gender !== "" && location !== "")
  }, [name, gender, location])

  const handleSubmit = () => {
    if (isValid) {
      onComplete({
        name: name.trim(),
        gender: gender as "male" | "female" | "other",
        location,
      })
    }
  }

  return (
    <div className="h-full w-full bg-animated-aurora flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">Tell us about yourself</h1>
        <div className="setup-card p-6 rounded-2xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-style w-full rounded-lg py-3 px-4"
              />
            </div>
            <div>
              <label htmlFor="user-gender" className="block text-sm font-medium text-gray-300 mb-2">
                Gender *
              </label>
              <select
                id="user-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="input-style w-full rounded-lg py-3 px-4"
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="user-location" className="block text-sm font-medium text-gray-300 mb-2">
                Where are you from? *
              </label>
              <select
                id="user-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-style w-full rounded-lg py-3 px-4"
              >
                <option value="" disabled>
                  Select your country
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
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
