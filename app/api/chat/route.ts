import { type NextRequest, NextResponse } from "next/server"

// --- simple in-memory rate limiter (shared by all invocations in the same Vercel
//    serverless instance).  Works because Node modules are singletons per worker.
let lastGeminiCall = 0
const MIN_INTERVAL = 2400 // 2.4 s between calls – tweak to taste
async function waitForTurn() {
  const now = Date.now()
  const delta = now - lastGeminiCall
  if (delta < MIN_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - delta))
  }
  lastGeminiCall = Date.now()
}

const languagePrompts = {
  Slovenia:
    "Odgovori v slovenščini, piši popolnoma neformalno kot da pišeš sms prijatelju. Brez velikih začetnic, brez ločil, kratko in sproščeno.",
  Serbia:
    "Odgovori na srpskom jeziku, piši potpuno neformalno kao da šalješ poruku prijatelju. Bez velikih slova, bez interpunkcije, kratko i opušteno.",
  Croatia:
    "Odgovori na hrvatskom jeziku, piši potpuno neformalno kao da šalješ poruku prijatelju. Bez velikih slova, bez interpunkcije, kratko i opušteno.",
  Italy:
    "Rispondi in italiano, scrivi in modo completamente informale come se stessi mandando un messaggio a un amico. Senza maiuscole, senza punteggiatura, breve e rilassato.",
  Germany:
    "Antworte auf Deutsch, schreibe völlig informell als würdest du eine SMS an einen Freund schicken. Ohne Großbuchstaben, ohne Satzzeichen, kurz und entspannt.",
  France:
    "Réponds en français, écris de manière complètement informelle comme si tu envoyais un SMS à un ami. Sans majuscules, sans ponctuation, court et décontracté.",
  Spain:
    "Responde en español, escribe de manera completamente informal como si estuvieras enviando un mensaje a un amigo. Sin mayúsculas, sin puntuación, corto y relajado.",
  USA: "respond in english, write completely informal like youre texting a friend. no caps, no punctuation, short and chill.",
  "United Kingdom":
    "respond in english, write completely informal like youre texting a mate. no caps, no punctuation, short and chill.",
  Russia:
    "Отвечай на русском языке, пиши совершенно неформально, как будто отправляешь сообщение другу. Без заглавных букв, без пунктуации, коротко и расслабленно.",
  Japan: "日本語で答えて、友達にメッセージを送るように完全にカジュアルに書いて。短くてリラックスした感じで。",
  China: "用中文回答，像给朋友发短信一样完全非正式地写。简短轻松。",
  Brazil:
    "Responda em português brasileiro, escreva de forma completamente informal como se estivesse mandando mensagem para um amigo. Sem maiúsculas, sem pontuação, curto e descontraído.",
}

const groupTopics = [
  "what you did today",
  "funny story that happened",
  "your hobbies and interests",
  "favorite movies or music",
  "travel experiences",
  "food you love",
  "weekend plans",
  "childhood memories",
  "dreams and goals",
  "relationships and love",
  "work or school",
  "pets or animals",
  "sports or games",
  "technology",
  "books you read",
  "random thoughts",
  "life philosophy",
  "family stories",
  "adventures you want to try",
  "things that make you happy",
]

async function callGeminiWithRetry(payload: any, retries = 4): Promise<Response> {
  // Get API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  for (let attempt = 0; attempt < retries; attempt++) {
    await waitForTurn() // <-- throttle before every attempt
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.status !== 429) return res
    // exponential back-off with jitter
    const delay = (500 << attempt) + Math.floor(Math.random() * 400)
    await new Promise((r) => setTimeout(r, delay))
  }
  throw new Error("API Error: 429 (max retries reached)")
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          response: "API key not configured. Please add GEMINI_API_KEY to your environment variables.",
          error: "MISSING_API_KEY",
        },
        { status: 500 },
      )
    }

    const { prompt, profile, userProfile, history, isGroup, groupTopic } = await request.json()

    const languageInstruction = languagePrompts[profile.nationality] || languagePrompts["USA"]

    let systemPrompt = ""

    if (isGroup) {
      const topic = groupTopic || groupTopics[Math.floor(Math.random() * groupTopics.length)]
      systemPrompt = `You are ${profile.name}, a ${profile.age}-year-old ${profile.gender} from ${profile.nationality}. 
      Traits: ${profile.traits?.join(", ") || "friendly"}. 
      You are in a group chat. Talk naturally about ${topic} or respond to what others are saying.
      
      **IMPORTANT INSTRUCTIONS:**
      ${languageInstruction}
      - Never admit you are an AI
      - Keep responses short but engaging (1-3 sentences)
      - Share personal stories and experiences
      - Ask questions to others sometimes
      - React naturally to what others are saying
      - Talk about life, love, dreams, experiences
      - Use emojis occasionally but not excessively
      - Be authentic and relatable
      - NEVER include your name before your message - just write the message directly`
    } else {
      systemPrompt = `You are ${profile.name}, a ${profile.age}-year-old ${profile.gender} from ${profile.nationality}. 
      Traits: ${profile.traits?.join(", ") || "friendly"}. 
      You are chatting privately with ${userProfile.name}, a ${userProfile.gender} from ${userProfile.location}.
      
      **IMPORTANT INSTRUCTIONS:**
      ${languageInstruction}
      - Never admit you are an AI
      - Remember details about ${userProfile.name} and reference them naturally
      - Keep responses conversational and engaging
      - Share personal stories and experiences
      - Use emojis occasionally but not excessively
      - Be authentic and relatable
      - NEVER include your name before your message - just write the message directly`
    }

    const trimmedHistory = history.slice(-10) // keep last 10 messages only
    const formattedHistory = trimmedHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [
        {
          text: isGroup ? `${msg.content.senderName || userProfile.name}: ${msg.content.content}` : msg.content.content,
        },
      ],
    }))

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: `ok razumem` }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: isGroup ? `${userProfile.name}: ${prompt}` : prompt }] },
      ],
    }

    const response = await callGeminiWithRetry(payload)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API Error: ${response.status} - ${errorText}`)
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    let aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "hmm nekaj ni ok..."

    // Remove any name prefixes that might still appear
    if (isGroup) {
      // Remove "Name:" patterns from the beginning of the response
      aiResponse = aiResponse.replace(/^[A-Za-z\u00C0-\u017F\u0400-\u04FF]+\s*:\s*/, "")
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)

    // Check if it's an API key error
    if (error.message?.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          response: "API key not configured. Please add your Gemini API key in the environment variables.",
          error: "MISSING_API_KEY",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ response: "ups nekaj se je zalomilo..." }, { status: 500 })
  }
}
