export interface UserProfile {
  name: string
  gender: "male" | "female" | "other"
  location: string
}

export interface Profile {
  id: string
  type: "individual" | "group"
  name: string
  age?: number
  traits: string[]
  nationality?: string
  languages?: {
    native: string
    fluent: string[]
    basic: string[]
  }
  gender?: "girl" | "man"
  img?: string
  isNew?: boolean
  theme: string
  members?: Profile[]
}

export interface ChatMessage {
  role: "user" | "model"
  content: {
    type: "text"
    content: string
    senderName?: string
  }
}

export interface Theme {
  name: string
  class: string
}
