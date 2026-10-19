import { ExternalLink, Pause, Play } from 'lucide-react'
import { useAudio } from '../lib/AudioContext'

export default function DiscreetMusicPlayer({
  className = '',
  light = false,
}: {
  className?: string
  light?: boolean
}) {
  const { isPlaying, error, togglePlay, songTitle, musicUrl } = useAudio()

  return (
    <div
      className={`group flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 transition-all duration-300 ${
        light
          ? 'border-white/25 bg-black/35 text-white backdrop-blur-md hover:bg-black/50 hover:border-white/40'
          : 'border-[rgba(43,45,49,0.12)] bg-white/70 text-[#2b2d31] backdrop-blur-md hover:bg-white/90 hover:border-[rgba(43,45,49,0.22)]'
      } ${className}`}
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={
          error
            ? 'Open song on YouTube Music'
            : isPlaying
              ? `Pause ${songTitle}`
              : `Play ${songTitle}`
        }
        title={
          error
            ? 'Open song on YouTube Music'
            : isPlaying
              ? `Pause ${songTitle}`
              : `Play ${songTitle}`
        }
        className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95 ${
          light ? 'bg-white text-[#1c1e22]' : 'bg-[#2b2d31] text-white'
        }`}
      >
        {error ? (
          <ExternalLink className="h-3 w-3" />
        ) : isPlaying ? (
          <Pause className="h-2.5 w-2.5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
        )}
      </button>

      <button
        type="button"
        onClick={togglePlay}
        className="flex cursor-pointer items-center gap-2 text-left"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <span className="font-editorial text-[0.88rem] tracking-wide leading-none font-medium">
          {songTitle}
        </span>

        {/* Live micro-waveform indicator */}
        <span
          className="flex h-3.5 items-center gap-0.5"
          aria-hidden="true"
        >
          {[0.6, 1.0, 0.4, 0.85, 0.5].map((h, i) => (
            <span
              key={i}
              className={`w-[1.5px] rounded-full transition-all duration-300 ${
                light ? 'bg-white/90' : 'bg-[#2b2d31]'
              } ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
              style={{
                height: `${h * 100}%`,
                animationDuration: `${0.65 + i * 0.18}s`,
                animationPlayState: isPlaying ? 'running' : 'paused',
              }}
            />
          ))}
        </span>
      </button>

      <a
        href={musicUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Open on YouTube Music"
        aria-label="Open Indrajaalam on YouTube Music"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-100 ${
          light ? 'text-white/60 hover:text-white' : 'text-[#2b2d31]/50 hover:text-[#2b2d31]'
        }`}
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
