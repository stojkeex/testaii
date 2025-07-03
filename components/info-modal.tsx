"use client"

interface InfoModalProps {
  profile: any
  onClose: () => void
}

export function InfoModal({ profile, onClose }: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm border border-white/10 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <img
            src={profile.img || `https://placehold.co/96x96/667eea/ffffff?text=${profile.name.charAt(0)}`}
            alt={profile.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
          <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
          <p className="text-gray-400">{profile.age} years old</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-2">Nationality</h3>
            <p className="text-gray-300">{profile.nationality}</p>
          </div>

          {profile.traits && profile.traits.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {profile.traits.map((trait, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.languages && (
            <div>
              <h3 className="text-white font-semibold mb-2">Languages</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 text-sm">Native: </span>
                  <span className="text-white">{profile.languages.native}</span>
                </div>
                {profile.languages.fluent && profile.languages.fluent.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm">Fluent: </span>
                    <span className="text-white">{profile.languages.fluent.join(", ")}</span>
                  </div>
                )}
                {profile.languages.basic && profile.languages.basic.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm">Basic: </span>
                    <span className="text-white">{profile.languages.basic.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose} className="mt-6 w-full btn-primary py-2 px-4 rounded-lg font-semibold">
          Close
        </button>
      </div>
    </div>
  )
}
