"use client"

interface HomepageProps {
  onGetStarted: () => void
}

export function Homepage({ onGetStarted }: HomepageProps) {
  return (
    <div className="h-full w-full bg-animated-cosmic flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-6">
          Alterra
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-500 mx-auto rounded-full mb-8"></div>
        <p className="text-lg text-gray-300 mb-10 leading-relaxed">
          Create your perfect digital companion, powered by advanced AI.
        </p>
        <button
          onClick={onGetStarted}
          className="btn-primary px-10 py-3 rounded-full text-lg font-semibold shadow-lg w-full"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
