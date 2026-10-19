import { useEffect, useRef, useState, useCallback } from 'react'

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

/**
 * Loads the official YouTube IFrame Player API script if not already present.
 */
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

export interface UseYouTubeAudioProps {
  videoId?: string
  musicUrl?: string
}

export function useYouTubeAudio({
  videoId = 'wLG9P297wLg',
  musicUrl = 'https://music.youtube.com/watch?v=wLG9P297wLg',
}: UseYouTubeAudioProps = {}) {
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

    // Create a detached mount element inside wrapper so React VDOM never attempts to reconcile it
    const mountEl = document.createElement('div')
    wrapper.appendChild(mountEl)

    loadYouTubeIframeApi().then(() => {
      if (isCancelled || !window.YT) return

      try {
        new window.YT.Player(mountEl, {
          height: '1',
          width: '1',
          videoId,
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
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
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
              let message = 'Unable to embed this track on this origin.'
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
  }, [videoId])

  const togglePlay = useCallback(() => {
    if (error) {
      window.open(musicUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (!isReady || !playerRef.current) {
      pendingPlayRef.current = true
      return
    }
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [error, isPlaying, isReady, musicUrl])

  return {
    containerRef,
    isPlaying,
    isReady,
    isBuffering,
    error,
    togglePlay,
    musicUrl,
  }
}
