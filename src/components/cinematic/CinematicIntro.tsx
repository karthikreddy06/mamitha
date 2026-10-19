import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Play, VolumeX, Sparkles, Volume2, RotateCcw } from 'lucide-react'
import { useAudio } from '../../lib/AudioContext'
import RainCanvas from './RainCanvas'
import CinematicButterflies from './CinematicButterflies'

import imgEncounter from '../../assets/cinematic/scene-1-encounter.jpg'
import imgEmbrace from '../../assets/cinematic/scene-2-embrace.jpg'
import imgQuiet from '../../assets/cinematic/scene-3-quiet.jpg'
import imgInterludeLeft from '../../assets/cinematic/interlude-left-saree.jpg'
import imgInterludeRight from '../../assets/cinematic/interlude-right-portrait.jpg'

interface SceneItem {
  id: string
  tag: string
  title: string
  quote: string
  image: string
  rainIntensity: number
}

const SCENES: SceneItem[] = [
  {
    id: 'encounter',
    tag: 'Scene I · The Encounter',
    title: 'Eyes in the Rain',
    quote: 'When eyes meet through the downpour, the entire world dissolves into quiet mist.',
    image: imgEncounter,
    rainIntensity: 0.8,
  },
  {
    id: 'embrace',
    tag: 'Scene II · The Embrace',
    title: 'Sheltered from the Storm',
    quote: 'Held close in the heavy rain, finding warmth in a protective embrace.',
    image: imgEmbrace,
    rainIntensity: 1.15,
  },
  {
    id: 'quiet',
    tag: 'Scene III · The Quiet Moment',
    title: 'When the Rain Softens',
    quote: 'In intimate stillness, unspoken emotions linger longer than any word.',
    image: imgQuiet,
    rainIntensity: 0.45,
  },
]

export default function CinematicIntro({ onComplete }: { onComplete?: () => void }) {
  // Steps:
  // 0 = Scene 1 (Eyes in the Rain)
  // 1 = Scene 2 (Sheltered from the Storm)
  // 2 = Scene 3 (When the Rain Softens)
  // 3 = Video Interlude (/videos/mamitha-intro.mp4)
  // 4 = Indrajaalam Music Choice Screen
  const [currentStep, setCurrentStep] = useState(0)

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  const { play, pause, songTitle, subtitle, error } = useAudio()

  // Lock document body scroll while intro is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Cleanup video on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause()
          videoRef.current.src = ''
        } catch {}
      }
    }
  }, [])

  // Handle replay request
  useEffect(() => {
    const handleReplay = () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        } catch {}
      }
      setAutoplayBlocked(false)
      setVideoError(null)
      setCurrentStep(0)
    }
    window.addEventListener('replay-cinematic-intro', handleReplay)
    return () => window.removeEventListener('replay-cinematic-intro', handleReplay)
  }, [])

  // Start video playback attempting unmuted autoplay
  const attemptPlayVideo = (video: HTMLVideoElement) => {
    pause() // Stop any ongoing song audio
    video.muted = false
    video.volume = 1.0
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setAutoplayBlocked(false)
        })
        .catch((err) => {
          console.warn('Autoplay with sound blocked by browser policy:', err)
          setAutoplayBlocked(true)
        })
    }
  }

  // Trigger video playback whenever currentStep changes to 3
  useEffect(() => {
    if (currentStep === 3) {
      pause()
      setVideoError(null)
      setAutoplayBlocked(false)
      const v = videoRef.current
      if (v) {
        v.currentTime = 0
        attemptPlayVideo(v)
      }
    } else if (currentStep !== 3 && videoRef.current) {
      try {
        videoRef.current.pause()
      } catch {}
    }
  }, [currentStep, pause])

  const setVideoNode = (node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && currentStep === 3 && node.paused && !autoplayBlocked) {
      attemptPlayVideo(node)
    }
  }

  const handleVideoCanPlay = () => {
    if (currentStep === 3 && videoRef.current && videoRef.current.paused && !autoplayBlocked) {
      attemptPlayVideo(videoRef.current)
    }
  }

  const handlePlayIntroWithSound = () => {
    const v = videoRef.current
    if (v) {
      v.muted = false
      v.volume = 1.0
      v.play()
        .then(() => {
          setAutoplayBlocked(false)
        })
        .catch((e) => {
          console.error('Play attempt with sound failed:', e)
        })
    }
  }

  const handleVideoError = () => {
    console.error('Failed to load video: /videos/mamitha-intro.mp4')
    setVideoError('Unable to load video interlude. Please retry.')
  }

  const handleRetryVideo = () => {
    setVideoError(null)
    setAutoplayBlocked(false)
    const v = videoRef.current
    if (v) {
      v.src = '/videos/mamitha-intro.mp4'
      v.load()
      attemptPlayVideo(v)
    }
  }

  const handleVideoEnded = () => {
    // Stop video and audio cleanly before advancing to music choice
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      } catch {}
    }
    // Automatically transition to the Indrajaalam music choice screen
    setCurrentStep(4)
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1)
    } else if (currentStep === 2) {
      // Past Scene 3 -> transition directly to video interlude
      setCurrentStep(3)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0 && currentStep <= 2) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkipToVideo = () => {
    // Skip intro leads ONLY to the video stage, never directly to the portfolio or choice screen
    if (currentStep < 3) {
      setCurrentStep(3)
    }
  }

  const handlePlayMusic = () => {
    // 1. Ensure video audio is completely stopped
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      } catch {}
    }
    // 2. Start song playback
    play()
    // 3. Mark intro complete and enter main portfolio
    try {
      sessionStorage.setItem('mamitha_cinematic_intro', 'complete')
      window.dispatchEvent(new CustomEvent('cinematic-intro-status', { detail: { isOpen: false } }))
    } catch {}
    if (onComplete) onComplete()
  }

  const handleContinueSilent = () => {
    // 1. Ensure video audio is completely stopped
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      } catch {}
    }
    // 2. Ensure song playback is paused
    pause()
    // 3. Mark intro complete and enter main portfolio
    try {
      sessionStorage.setItem('mamitha_cinematic_intro', 'complete')
      window.dispatchEvent(new CustomEvent('cinematic-intro-status', { detail: { isOpen: false } }))
    } catch {}
    if (onComplete) onComplete()
  }

  const activeScene = SCENES[Math.min(currentStep, 2)]

  return (
    <div
      className={`fixed inset-0 h-svh w-screen bg-[#F7F5F1] text-[#242424] flex flex-col select-none z-50 ${
        currentStep === 3
          ? 'overflow-x-hidden overflow-y-auto overscroll-y-contain md:overflow-hidden md:justify-between'
          : 'overflow-hidden justify-between'
      }`}
      style={currentStep === 3 ? { WebkitOverflowScrolling: 'touch' } : undefined}
    >
      {/* =========================================================================
          ATMOSPHERIC BUTTERFLIES: Exactly two butterflies in outer margins
          Never covering Mamitha's face, the man's face, titles, or buttons
          ========================================================================= */}
      <CinematicButterflies />

      {/* =========================================================================
          TOP BAR: Brand Wordmark & Skip Intro Action (Only on Scenes 1, 2, 3)
          ========================================================================= */}
      <header className="relative z-30 flex w-full items-center justify-between px-6 pt-4 sm:pt-6 pb-2 max-w-6xl mx-auto shrink-0">
        <span className="font-editorial text-base sm:text-lg tracking-[0.24em] text-[#242424] font-medium">
          MAMITHA BAIJU
        </span>

        {currentStep < 3 && (
          <button
            type="button"
            onClick={handleSkipToVideo}
            className="label flex items-center gap-1.5 rounded-full border border-[rgba(36,36,36,0.14)] bg-white/90 px-4 py-1.5 text-[0.66rem] text-[#242424] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:border-[rgba(36,36,36,0.28)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            Skip intro
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </header>

      {/* =========================================================================
          CENTER VIEWPORT: Photographs (0-2) -> Video Interlude (3) -> Music Choice (4)
          ========================================================================= */}
      <div
        className={`relative z-20 flex flex-1 flex-col items-center w-full px-4 sm:px-6 ${
          currentStep === 3
            ? 'justify-start md:justify-center md:min-h-0'
            : 'justify-center min-h-0'
        }`}
      >
        <AnimatePresence mode="wait">
          {currentStep < 3 ? (
            /* =====================================================================
               STAGES 1 - 3: THREE PHOTOGRAPH SCENES
               - Sized to fit comfortably within viewport without cropping faces
               - Zero scroll-zoom, zero scrolling effects
               - Characters' faces 100% clearly visible
               ===================================================================== */
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.4, ease: [0.16, 0.7, 0.22, 1] }}
              className="relative flex flex-1 flex-col items-center justify-center min-h-0 w-full max-w-4xl mx-auto my-auto"
            >
              {/* Central Portrait Photograph */}
              <div className="relative mx-auto h-[52svh] sm:h-[58svh] md:h-[62svh] max-h-[620px] aspect-[576/1024] shrink-0 mb-3 sm:mb-4">
                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[rgba(36,36,36,0.08)] bg-[#E9EBEA] shadow-[0_20px_50px_-15px_rgba(36,36,36,0.16)]">
                  <img
                    src={activeScene.image}
                    alt={activeScene.title}
                    className="block h-full w-full object-contain select-none"
                    style={{
                      aspectRatio: '576 / 1024',
                    }}
                    draggable={false}
                  />

                  {/* Atmospheric rain overlay */}
                  <RainCanvas intensity={activeScene.rainIntensity} />
                </div>
              </div>

              {/* Scene Typography */}
              <div className="mx-auto flex max-w-xl flex-col items-center text-center px-4">
                <span className="label mb-1.5 sm:mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#D9A0AC]/35 bg-[#FBEAF0] px-3.5 py-0.5 sm:py-1 text-[0.62rem] sm:text-[0.66rem] tracking-[0.2em] text-[#A25B6C] uppercase font-semibold">
                  <Sparkles className="h-3 w-3 text-[#D9A0AC]" />
                  {activeScene.tag}
                </span>

                <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#242424] font-light tracking-wide leading-tight">
                  {activeScene.title}
                </h1>

                <p className="font-editorial mt-1 max-w-lg text-xs sm:text-sm md:text-base text-[#52565e] italic font-light line-clamp-2 sm:line-clamp-none">
                  “{activeScene.quote}”
                </p>
              </div>
            </motion.div>
          ) : currentStep === 3 ? (
            /* =====================================================================
               STAGE 4: VIDEO INTERLUDE
               - Plays /videos/mamitha-intro.mp4 once with original audio
               - No skip, no close, no next button
               - If blocked by browser autoplay policy, elegant 'Play Intro with Sound' button
               - On ended, automatically transitions to Indrajaalam music choice
               ===================================================================== */
            <motion.div
              key="video-interlude"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.45, ease: [0.16, 0.7, 0.22, 1] }}
              className="relative flex flex-col items-center w-full max-w-6xl mx-auto py-4 md:py-0 md:my-auto md:justify-center md:flex-1 md:min-h-0 px-2 sm:px-4 md:px-6"
            >
              {/* Three-part cinematic layout:
                  Mobile: Vertical stack (Top Photo -> Center Video -> Bottom Photo)
                  Desktop: Horizontal row (Left Photo | Center Video | Right Photo) */}
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-7 md:gap-5 lg:gap-7 w-full max-w-6xl mx-auto md:my-auto">
                {/* 1. Top Photo (Mobile) / Left Photo (Desktop):
                    Mamitha wearing green blouse and cream saree, looking to the side */}
                <motion.div
                  initial={{ opacity: 0, x: -16, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: [0, -4, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.6, ease: [0.16, 0.7, 0.22, 1] },
                    x: { duration: 0.6, ease: [0.16, 0.7, 0.22, 1] },
                    scale: { duration: 0.6, ease: [0.16, 0.7, 0.22, 1] },
                    y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative w-full max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none md:h-[48svh] lg:h-[52svh] md:max-h-[520px] aspect-[736/1308] shrink-0"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[rgba(36,36,36,0.09)] bg-[#EBE7DF] shadow-[0_18px_40px_-14px_rgba(36,36,36,0.15)] flex items-center justify-center">
                    <img
                      src={imgInterludeLeft}
                      alt="Mamitha Baiju in green blouse and cream saree looking to the side"
                      className="h-full w-full object-contain object-center block select-none"
                      draggable={false}
                    />
                  </div>
                </motion.div>

                {/* 2. Middle Video:
                    Mobile: Full-width container with 16/9 aspect ratio, watchable and large
                    Desktop: Primary focal point, larger than either photo */}
                <div className="relative flex items-center justify-center w-full max-w-[480px] sm:max-w-[540px] md:max-w-[560px] lg:max-w-[660px] aspect-video md:aspect-auto h-auto md:h-[56svh] lg:h-[60svh] md:max-h-[600px] md:flex-1 md:shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-[rgba(36,36,36,0.12)] bg-[#121316] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.32)]">
                  <video
                    ref={setVideoNode}
                    src="/videos/mamitha-intro.mp4"
                    playsInline
                    preload="auto"
                    onCanPlay={handleVideoCanPlay}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onPlay={() => {
                      setAutoplayBlocked(false)
                    }}
                    className="h-full w-full object-contain block select-none"
                  />

                  {/* Autoplay with sound blocked fallback */}
                  {autoplayBlocked && !videoError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center gap-3.5 max-w-xs"
                      >
                        <button
                          type="button"
                          onClick={handlePlayIntroWithSound}
                          className="group flex cursor-pointer items-center justify-center gap-3 rounded-full bg-white px-6 sm:px-7 py-3 sm:py-3.5 font-ui text-[0.8rem] sm:text-[0.82rem] font-medium tracking-wide text-[#242424] shadow-2xl transition-all hover:bg-[#F7F5F1] hover:scale-105 active:scale-95"
                        >
                          <Volume2 className="h-4 w-4 text-[#242424] transition-transform group-hover:scale-110" />
                          <span>Play Intro with Sound</span>
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* Error fallback with retry */}
                  {videoError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F7F5F1] p-4 sm:p-6 text-center">
                      <div className="max-w-xs rounded-2xl border border-[rgba(36,36,36,0.1)] bg-white p-5 sm:p-6 shadow-xl text-center">
                        <p className="font-editorial text-base sm:text-lg text-[#242424] mb-1 font-medium">
                          Unable to play video
                        </p>
                        <p className="font-ui text-xs text-[#60646c] mb-4 leading-relaxed">
                          {videoError}
                        </p>
                        <button
                          type="button"
                          onClick={handleRetryVideo}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-[#242424] px-5 py-2 font-ui text-xs font-medium text-white shadow-sm transition-all hover:bg-[#383838] active:scale-95"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Bottom Photo (Mobile) / Right Photo (Desktop):
                    Mamitha wearing cream-and-gold saree, looking toward camera */}
                <motion.div
                  initial={{ opacity: 0, x: 16, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: [0, 4, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.1, ease: [0.16, 0.7, 0.22, 1] },
                    x: { duration: 0.6, delay: 0.1, ease: [0.16, 0.7, 0.22, 1] },
                    scale: { duration: 0.6, delay: 0.1, ease: [0.16, 0.7, 0.22, 1] },
                    y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
                  }}
                  className="relative w-full max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none md:h-[48svh] lg:h-[52svh] md:max-h-[520px] aspect-[288/512] shrink-0"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[rgba(36,36,36,0.09)] bg-[#EBE7DF] shadow-[0_18px_40px_-14px_rgba(36,36,36,0.15)] flex items-center justify-center">
                    <img
                      src={imgInterludeRight}
                      alt="Mamitha Baiju in cream and gold saree looking toward camera"
                      className="h-full w-full object-contain object-center block select-none"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Video Typography Subtitle */}
              <div className="mx-auto mt-6 sm:mt-7 md:mt-4 flex max-w-xl flex-col items-center text-center px-4 pb-10 md:pb-0 shrink-0">
                <span className="label mb-1 sm:mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#D9A0AC]/35 bg-[#FBEAF0] px-3.5 py-0.5 sm:py-1 text-[0.62rem] sm:text-[0.66rem] tracking-[0.2em] text-[#A25B6C] uppercase font-semibold">
                  <Sparkles className="h-3 w-3 text-[#D9A0AC]" />
                  Cinematic Interlude
                </span>
                <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#242424] font-light tracking-wide leading-tight">
                  Mamitha Baiju
                </h2>
              </div>
            </motion.div>
          ) : (
            /* =====================================================================
               STAGE 5: INDRAJAALAM MUSIC CHOICE SCREEN
               ===================================================================== */
            <motion.div
              key="music-choice"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 0.7, 0.22, 1] }}
              className="relative flex flex-1 flex-col items-center justify-center min-h-0 w-full max-w-md mx-auto my-auto px-4"
            >
              <div className="relative w-full rounded-3xl border border-white/80 bg-white/95 p-6 sm:p-9 text-center shadow-[0_24px_60px_-15px_rgba(36,36,36,0.12)] backdrop-blur-xl">
                <span className="label mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#D9A0AC]/35 bg-[#FBEAF0] px-3.5 py-1 text-[0.62rem] tracking-[0.22em] text-[#A25B6C] uppercase font-semibold">
                  Premalu · Soundscape
                </span>

                <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#242424] font-normal leading-tight">
                  Stay in this moment
                </h2>

                <p className="font-ui mt-1.5 text-[0.82rem] sm:text-[0.86rem] text-[#60646c] leading-relaxed">
                  Would you like to experience it with music?
                </p>

                {/* Song info card */}
                <div className="my-5 flex items-center justify-start gap-3.5 rounded-2xl border border-[rgba(36,36,36,0.08)] bg-[#F7F5F1] px-4 py-3 text-left shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#242424] text-white">
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-editorial text-[0.98rem] sm:text-[1.02rem] leading-none text-[#242424] font-medium truncate">
                      {songTitle}
                    </div>
                    <div className="label text-[0.62rem] text-[#8b8e96] truncate mt-1">
                      {subtitle}
                    </div>
                  </div>
                </div>

                {/* Choice buttons */}
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePlayMusic}
                    className="group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#242424] px-6 py-3 sm:py-3.5 font-ui text-[0.8rem] sm:text-[0.82rem] font-medium tracking-wide text-[#F7F5F1] shadow-md transition-all hover:bg-[#383838] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current transition-transform group-hover:scale-110" />
                    <span>Play {songTitle}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueSilent}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[rgba(36,36,36,0.18)] bg-white px-6 py-2.5 sm:py-3 font-ui text-[0.78rem] sm:text-[0.8rem] text-[#242424] transition-all hover:bg-[#fafafa] hover:border-[rgba(36,36,36,0.32)] hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <VolumeX className="h-3.5 w-3.5 text-[#6b6f76]" />
                    <span>Continue without music</span>
                  </button>
                </div>

                {error && (
                  <div className="mt-3.5 rounded-xl border border-[#D9A0AC]/35 bg-[#FBEAF0] px-3.5 py-1.5 text-center">
                    <p className="font-ui text-[0.7rem] text-[#A25B6C] leading-snug">
                      Audio playback is currently restricted on this origin. You may continue without music.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          BOTTOM BAR: Navigation Controls & Progress Dots (Only on Scenes 1, 2, 3)
          ========================================================================= */}
      {currentStep < 3 && (
        <footer className="relative z-30 flex w-full items-center justify-between px-6 pb-4 sm:pb-6 pt-2 max-w-md mx-auto">
          {/* Previous button */}
          <div className="w-10 flex justify-start">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous scene"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(36,36,36,0.16)] bg-white text-[#242424] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <span className="w-9 h-9" />
            )}
          </div>

          {/* Progress indicator dots for 3 photo scenes */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((stepIdx) => (
              <button
                key={stepIdx}
                type="button"
                onClick={() => setCurrentStep(stepIdx)}
                aria-label={`Go to Scene ${stepIdx + 1}`}
                className="group relative py-2 cursor-pointer"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    currentStep === stepIdx
                      ? 'w-7 bg-[#242424]'
                      : 'w-2 bg-[#242424]/25 hover:bg-[#242424]/45'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Next button */}
          <div className="w-auto flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-full bg-[#242424] px-4 sm:px-5 py-2 font-ui text-[0.74rem] sm:text-[0.78rem] font-medium text-[#F7F5F1] shadow-sm transition-all hover:bg-[#383838] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Next Moment</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
