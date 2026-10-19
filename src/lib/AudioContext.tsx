import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          videoId?: string
          height?: string | number
          width?: string | number
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onError?: (event: { data: number; target: YTPlayerInstance }) => void
          }
        }
      ) => YTPlayerInstance
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface YTPlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  getPlayerState: () => number
  destroy: () => void
}

export interface AudioContextType {
  isPlaying: boolean
  isReady: boolean
  isBuffering: boolean
  error: string | null
  songTitle: string
  subtitle: string
  musicUrl: string
  togglePlay: () => void
  play: () => void
  pause: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export const SONG_TITLE = 'Indrajaalam'
export const SONG_SUBTITLE = 'Premalu · Telugu'
export const SONG_MUSIC_URL = 'https://music.youtube.com/watch?v=wLG9P297wLg'
export const SONG_VIDEO_ID = 'wLG9P297wLg'

function loadYouTubeIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return

    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    const prevOnReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') {
        try {
          prevOnReady()
        } catch {}
      }
      resolve()
    }

    if (!document.getElementById('youtube-iframe-api-script')) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api-script'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      } else {
        document.head.appendChild(script)
      }
    }
  })
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const pendingPlayRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const wrapper = containerRef.current
    if (!wrapper) return

    // Create a detached mount element so React VDOM is isolated from YouTube's iframe swap
    const mountEl = document.createElement('div')
    wrapper.appendChild(mountEl)

    loadYouTubeIframeApi().then(() => {
      if (isCancelled || !window.YT) return

      try {
        new window.YT.Player(mountEl, {
          height: '1',
          width: '1',
          videoId: SONG_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              if (isCancelled) {
                event.target.destroy()
                return
              }
              playerRef.current = event.target
              setIsReady(true)
              if (pendingPlayRef.current) {
                pendingPlayRef.current = false
                try {
                  event.target.playVideo()
                } catch (e) {
                  console.error('Failed to start queued playback:', e)
                }
              }
            },
            onStateChange: (event) => {
              if (isCancelled) return
              const state = event.data
              if (state === 1) {
                setIsPlaying(true)
                setIsBuffering(false)
              } else if (state === 2 || state === 0) {
                setIsPlaying(false)
                setIsBuffering(false)
              } else if (state === 3) {
                setIsBuffering(true)
              }
            },
            onError: (event) => {
              if (isCancelled) return
              console.warn('YouTube Player error code:', event.data)
              let message = 'Unable to embed this song on this origin.'
              if (event.data === 101 || event.data === 150) {
                message = 'Embedding is restricted by the content owner.'
              } else if (event.data === 100) {
                message = 'The requested video was not found.'
              }
              setError(message)
              setIsPlaying(false)
              setIsBuffering(false)
            },
          },
        })
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to initialize YouTube Player:', err)
          setError('Failed to initialize YouTube Player.')
        }
      }
    })

    return () => {
      isCancelled = true
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {}
        playerRef.current = null
      }
      if (wrapper) {
        wrapper.innerHTML = ''
      }
      setIsReady(false)
      setIsPlaying(false)
    }
  }, [])

  const play = useCallback(() => {
    if (error) {
      return
    }
    if (!isReady || !playerRef.current) {
      pendingPlayRef.current = true
      return
    }
    try {
      playerRef.current.playVideo()
    } catch (e) {
      console.warn('Failed to start playback:', e)
    }
  }, [error, isReady])

  const pause = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo()
      } catch (e) {
        console.warn('Failed to pause playback:', e)
      }
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (error) {
      return
    }
    if (!isReady || !playerRef.current) {
      pendingPlayRef.current = true
      return
    }
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    } catch (e) {
      console.warn('Failed to toggle playback:', e)
    }
  }, [error, isPlaying, isReady])

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isReady,
        isBuffering,
        error,
        songTitle: SONG_TITLE,
        subtitle: SONG_SUBTITLE,
        musicUrl: SONG_MUSIC_URL,
        togglePlay,
        play,
        pause,
      }}
    >
      {children}
      {/* Root unobtrusive YouTube player container — mounts once, never gets unmounted */}
      <div
        ref={containerRef}
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none fixed -bottom-10 left-0 h-px w-px overflow-hidden opacity-0"
      />
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return ctx
}
