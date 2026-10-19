import { motion, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Hero from '../Hero'
import RainCanvas from './RainCanvas'
import { INTRO_VH, ramp } from '../../lib/curve'
import { useJourney, useViewport } from '../../lib/heroMotion'

/**
 * Cinematic Hero Stage:
 *
 * Implements a 3-scene cinematic romantic film introduction using the three
 * supplied photographs, accompanied by atmospheric rain, subtle camera
 * push-in motion, restrained editorial typography, and seamless transition
 * into the existing portfolio Hero.
 *
 * Scene 1 (s ∈ [-3.0, -2.0]): The Encounter (Eye contact in the rain)
 * Scene 2 (s ∈ [-2.0, -1.0]): The Embrace (Protective downpour embrace)
 * Scene 3 (s ∈ [-1.0, -0.1]): The Quiet Moment (Intimate tender stillness)
 * Reveal  (s ∈ [-0.4, 0.0]): Transition into the portfolio Hero cards
 */
export default function CinematicHeroStage() {
  const journey = useJourney()
  const { vh } = useViewport()

  // Scene 1: The Encounter
  // Fades out as journey moves from -2.2 to -1.8
  const scene1Opacity = useTransform(journey, (s) => 1 - ramp(-2.25, -1.8, s))
  const scene1Scale = useTransform(journey, (s) => 1.0 + ramp(-3.0, -1.8, s) * 0.05)
  const scene1TextY = useTransform(journey, (s) => ramp(-3.0, -2.1, s) * -20)

  // Scene 2: The Embrace
  // Enters between -2.25 and -1.8, exits between -1.2 and -0.8
  const scene2Enter = useTransform(journey, (s) => ramp(-2.25, -1.8, s))
  const scene2Exit = useTransform(journey, (s) => ramp(-1.25, -0.8, s))
  const scene2Opacity = useTransform([scene2Enter, scene2Exit], ([en, ex]: number[]) => en * (1 - ex))
  const scene2Scale = useTransform(journey, (s) => 1.0 + ramp(-2.0, -0.9, s) * 0.05)
  const scene2TextY = useTransform(journey, (s) => ramp(-2.0, -1.0, s) * -18)

  // Scene 3: The Quiet Moment
  // Enters between -1.25 and -0.8, fades out into the portfolio between -0.45 and -0.02
  const scene3Enter = useTransform(journey, (s) => ramp(-1.25, -0.8, s))
  const scene3Exit = useTransform(journey, (s) => ramp(-0.45, -0.02, s))
  const scene3Opacity = useTransform([scene3Enter, scene3Exit], ([en, ex]: number[]) => en * (1 - ex))
  const scene3Scale = useTransform(journey, (s) => 1.0 + ramp(-1.0, -0.1, s) * 0.04)
  const scene3TextY = useTransform(journey, (s) => ramp(-1.0, -0.2, s) * -16)

  // Portfolio Hero Reveal
  // Pinned underneath; comes forward from scale 0.94 -> 1.0 as Scene 3 completes
  const heroReveal = useTransform(journey, (s) => ramp(-0.42, -0.02, s))
  const heroScale = useTransform(heroReveal, (a) => 0.94 + a * 0.06)
  const heroVeil = useTransform(journey, (s) => 1 - ramp(-0.35, -0.02, s))

  // Scroll indicator opacity: fades after user starts scrolling
  const scrollIndicatorOpacity = useTransform(journey, (s) => 1 - ramp(-3.0, -2.65, s))

  // Smooth scroll handler to skip straight to the portfolio cards
  const scrollToPortfolio = () => {
    window.scrollTo({
      top: INTRO_VH * (vh || window.innerHeight),
      behavior: 'smooth',
    })
  }

  return (
    <div
      className="relative w-full"
      style={{ height: `${(INTRO_VH + 1) * 100}vh` }}
      id="cinematic-hero"
    >
      <div
        className="sticky top-0 h-svh w-full overflow-hidden"
        style={{ background: '#f7f7f5' }}
      >
        {/* =========================================================================
            LAYER 0 · The Portfolio Hero (revealed as the film intro completes)
            ========================================================================= */}
        <motion.div
          className="absolute inset-0 h-full w-full"
          style={{
            scale: heroScale,
            transformOrigin: '50% 38%',
            willChange: 'transform',
          }}
        >
          <Hero />
        </motion.div>

        {/* =========================================================================
            LAYER 1 · The Three Cinematic Scenes
            ========================================================================= */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {/* ------------------------------------------------ SCENE 1: The Encounter */}
          <motion.div
            className="absolute inset-0 h-full w-full"
            style={{ opacity: scene1Opacity }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ scale: scene1Scale, transformOrigin: '50% 30%', willChange: 'transform' }}
            >
              {/* Desktop ambient blurred background extension */}
              <div
                className="absolute inset-0 hidden md:block bg-cover bg-center opacity-40 blur-2xl scale-110"
                style={{ backgroundImage: 'url(/images/cinematic/scene-1-encounter.jpg)' }}
              />

              {/* Main high-resolution photograph */}
              <img
                src="/images/cinematic/scene-1-encounter.jpg"
                alt="Mamitha Baiju - The Encounter"
                className="relative z-10 h-full w-full object-cover object-[50%_22%] md:object-contain lg:object-cover lg:object-[50%_25%]"
                draggable={false}
                loading="eager"
              />

              {/* Cinematic lighting & contrast overlays */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#14161a]/85 via-[#14161a]/25 to-transparent" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#14161a]/60 via-transparent to-transparent" />
              <div className="absolute inset-0 z-10 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(18,20,24,0.45)_100%)]" />

              {/* Rain ambience */}
              <RainCanvas intensity={0.9} />
            </motion.div>

            {/* Scene 1 Editorial Typography */}
            <motion.div
              className="pointer-events-auto absolute inset-x-0 bottom-0 z-25 flex flex-col items-center px-6 pb-16 text-center md:pb-20"
              style={{ y: scene1TextY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 0.7, 0.22, 1] }}
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center">
                <span className="label mb-3 inline-block rounded-full border border-white/25 bg-black/30 px-3.5 py-1 text-[0.62rem] tracking-[0.25em] text-[#eed2dc] uppercase backdrop-blur-md">
                  Scene I · The Encounter
                </span>

                <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-[#faf8f5] drop-shadow-lg font-light">
                  MAMITHA BAIJU
                </h1>

                <p className="font-editorial mt-3 max-w-xl text-base sm:text-lg md:text-xl text-[#f7e5eb]/85 italic font-light drop-shadow">
                  “When eyes meet in the rain, the entire world softens into mist.”
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ------------------------------------------------ SCENE 2: The Embrace */}
          <motion.div
            className="absolute inset-0 h-full w-full"
            style={{ opacity: scene2Opacity }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ scale: scene2Scale, transformOrigin: '50% 32%', willChange: 'transform' }}
            >
              {/* Desktop ambient blurred background extension */}
              <div
                className="absolute inset-0 hidden md:block bg-cover bg-center opacity-40 blur-2xl scale-110"
                style={{ backgroundImage: 'url(/images/cinematic/scene-2-embrace.jpg)' }}
              />

              <img
                src="/images/cinematic/scene-2-embrace.jpg"
                alt="Mamitha Baiju - The Embrace"
                className="relative z-10 h-full w-full object-cover object-[50%_22%] md:object-contain lg:object-cover lg:object-[50%_25%]"
                draggable={false}
                loading="lazy"
              />

              {/* Deeper rain downpour mood overlays */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#14161a]/90 via-[#14161a]/30 to-transparent" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#14161a]/65 via-transparent to-transparent" />
              <div className="absolute inset-0 z-10 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(16,18,22,0.55)_100%)]" />

              {/* Intensified rain ambience for downpour scene */}
              <RainCanvas intensity={1.25} />
            </motion.div>

            {/* Scene 2 Editorial Typography */}
            <motion.div
              className="pointer-events-auto absolute inset-x-0 bottom-0 z-25 flex flex-col items-center px-6 pb-16 text-center md:pb-20"
              style={{ y: scene2TextY }}
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center">
                <span className="label mb-3 inline-block rounded-full border border-white/25 bg-black/30 px-3.5 py-1 text-[0.62rem] tracking-[0.25em] text-[#dca8b2] uppercase backdrop-blur-md">
                  Scene II · The Embrace
                </span>

                <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#faf8f5] drop-shadow-lg font-light tracking-wide">
                  Sheltered From the Storm
                </h2>

                <p className="font-editorial mt-2 max-w-lg text-base sm:text-lg text-[#f7e5eb]/85 italic font-light drop-shadow">
                  “Held tight in the downpour, where every drop carries warmth.”
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ------------------------------------------- SCENE 3: The Quiet Moment */}
          <motion.div
            className="absolute inset-0 h-full w-full"
            style={{ opacity: scene3Opacity }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ scale: scene3Scale, transformOrigin: '50% 32%', willChange: 'transform' }}
            >
              {/* Desktop ambient blurred background extension */}
              <div
                className="absolute inset-0 hidden md:block bg-cover bg-center opacity-40 blur-2xl scale-110"
                style={{ backgroundImage: 'url(/images/cinematic/scene-3-quiet.jpg)' }}
              />

              <img
                src="/images/cinematic/scene-3-quiet.jpg"
                alt="Mamitha Baiju - The Quiet Moment"
                className="relative z-10 h-full w-full object-cover object-[50%_25%] md:object-contain lg:object-cover lg:object-[50%_28%]"
                draggable={false}
                loading="lazy"
              />

              {/* Softer, intimate warm ivory & blush atmospheric glow */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#18191d]/85 via-[#18191d]/20 to-transparent" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#14161a]/55 via-transparent to-transparent" />
              <div className="absolute inset-0 z-10 bg-[#fbeaf0]/5 mix-blend-soft-light" />

              {/* Softened, calming rain mist */}
              <RainCanvas intensity={0.45} />
            </motion.div>

            {/* Scene 3 Editorial Typography */}
            <motion.div
              className="pointer-events-auto absolute inset-x-0 bottom-0 z-25 flex flex-col items-center px-6 pb-16 text-center md:pb-20"
              style={{ y: scene3TextY }}
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center">
                <span className="label mb-3 inline-block rounded-full border border-white/25 bg-black/30 px-3.5 py-1 text-[0.62rem] tracking-[0.25em] text-[#eed2dc] uppercase backdrop-blur-md">
                  Scene III · The Quiet Moment
                </span>

                <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#faf8f5] drop-shadow-lg font-light tracking-wide">
                  When the Rain Softens
                </h2>

                <p className="font-editorial mt-2 max-w-lg text-base sm:text-lg text-[#f7e5eb]/85 italic font-light drop-shadow">
                  “Silence speaks what the storm began.”
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* =========================================================================
            LAYER 2 · Film Grain Overlay for Authentic 35mm Filmic Texture
            ========================================================================= */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-35 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 0)',
            backgroundSize: '4px 4px',
          }}
        />

        {/* =========================================================================
            LAYER 3 · Veil melting into the portfolio paper stage
            ========================================================================= */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[44]"
          style={{ background: '#f7f7f5', opacity: heroVeil }}
        />

        {/* =========================================================================
            Refined Scroll Indicator & Skip Button (Visible during opening hero)
            ========================================================================= */}
        <motion.div
          className="pointer-events-none absolute bottom-4 sm:bottom-6 inset-x-0 z-45 flex flex-col items-center gap-2"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="label text-[0.62rem] tracking-widest text-[#f5f2eb]/85 uppercase drop-shadow">
              Scroll to immerse
            </span>
            <span className="flex h-6 w-4 items-start justify-center rounded-full border border-white/40 pt-1">
              <span className="h-1.5 w-1 rounded-full bg-white/90 animate-bounce" />
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToPortfolio}
            className="pointer-events-auto mt-1 flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[0.6rem] text-white/70 backdrop-blur-sm transition-all hover:bg-black/45 hover:text-white"
          >
            Skip to portfolio
            <ChevronDown className="h-3 w-3" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
