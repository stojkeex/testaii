"use client"

import { useState } from "react"

interface ApiKeySetupProps {
  onClose: () => void
}

export function ApiKeySetup({ onClose }: ApiKeySetupProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-4 text-white">API Key Required</h2>

        <div className="text-gray-300 text-sm space-y-3 mb-6">
          <p>To use Alterra, you need to configure your Gemini API key.</p>

          {!showInstructions ? (
            <button onClick={() => setShowInstructions(true)} className="text-blue-400 hover:text-blue-300 underline">
              Show setup instructions
            </button>
          ) : (
            <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-white">Setup Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Get your free Gemini API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google AI Studio
                  </a>
                </li>
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>
                  Add a new variable:
                  <div className="bg-gray-900 p-2 rounded mt-1 font-mono text-xs">
                    <div>
                      Name: <span className="text-green-400">GEMINI_API_KEY</span>
                    </div>
                    <div>
                      Value: <span className="text-yellow-400">your_api_key_here</span>
                    </div>
                  </div>
                </li>
                <li>Redeploy your application</li>
              </ol>

              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded">
                <p className="text-yellow-200 text-xs">
                  <strong>Note:</strong> The API key must be added as an environment variable in Vercel for security
                  reasons. Never put API keys directly in your code.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-4 btn-primary rounded-lg font-semibold text-center hover:scale-105 transition-transform"
          >
            Get API Key
          </a>
        </div>
      </div>
    </div>
  )
}
