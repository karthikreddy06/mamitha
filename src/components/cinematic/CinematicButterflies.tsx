import { useEffect, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import ButterflyGlyph from '../butterfly/ButterflyArt'
import { useViewport } from '../../lib/heroMotion'

/**
 * Minimal & Natural Dual-Butterfly System:
 * Exactly two delicate, translucent pastel butterflies drifting gently through
 * the empty margins outside the central portrait.
 * They stay strictly clear of Mamitha's face, the man's face, the title, and buttons.
 */
export default function CinematicButterflies() {
  const { vw, vh } = useViewport()
  const isMobile = vw < 768

  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Butterfly 1 dynamic coordinates (Outer Left Margin)
  const b1X = useMotionValue(vw * 0.12)
  const b1Y = useMotionValue(vh * 0.45)
  const b1Rotate = useMotionValue(0)

  // Butterfly 2 dynamic coordinates (Outer Right Margin)
  const b2X = useMotionValue(vw * 0.88)
  const b2Y = useMotionValue(vh * 0.52)
  const b2Rotate = useMotionValue(0)

  useAnimationFrame((clockMs) => {
    if (reducedMotion) return

    const t = clockMs / 1000 // seconds

    // ---- BUTTERFLY 1: Translucent Dusty Rose (Left Margin: 5% - 24% vw) ----
    const marginL = isMobile ? 0.04 : 0.06
    const spanL = isMobile ? 0.16 : 0.18
    const normX1 = marginL + spanL * (0.5 + 0.36 * Math.sin(t * 0.11 + 0.5) + 0.14 * Math.cos(t * 0.06 + 1.2))
    const normY1 = 0.44 + 0.16 * Math.sin(t * 0.095 + 1.8) + 0.05 * Math.cos(t * 0.16 + 0.4)

    const targetX1 = normX1 * vw
    const targetY1 = normY1 * vh

    // Natural banking rotation
    const vx1 = spanL * (0.36 * 0.11 * Math.cos(t * 0.11 + 0.5) - 0.14 * 0.06 * Math.sin(t * 0.06 + 1.2)) * vw
    const vy1 = (0.16 * 0.095 * Math.cos(t * 0.095 + 1.8) - 0.05 * 0.16 * Math.sin(t * 0.16 + 0.4)) * vh
    const rawAng1 = (Math.atan2(vy1, vx1) * 180) / Math.PI
    const targetRot1 = Math.max(-24, Math.min(24, rawAng1 * 0.34)) + Math.sin(t * 0.4) * 4

    b1X.set(targetX1)
    b1Y.set(targetY1)
    b1Rotate.set(targetRot1)

    // ---- BUTTERFLY 2: Translucent Lavender (Right Margin: 76% - 95% vw) ----
    const marginR = isMobile ? 0.80 : 0.76
    const spanR = isMobile ? 0.16 : 0.18
    const normX2 = marginR + spanR * (0.5 + 0.34 * Math.cos(t * 0.1 + 2.4) + 0.15 * Math.sin(t * 0.055 + 0.7))
    const normY2 = 0.48 + 0.15 * Math.sin(t * 0.088 + 0.8) + 0.05 * Math.cos(t * 0.15 + 2.1)

    const targetX2 = normX2 * vw
    const targetY2 = normY2 * vh

    const vx2 = spanR * (-0.34 * 0.1 * Math.sin(t * 0.1 + 2.4) + 0.15 * 0.055 * Math.cos(t * 0.055 + 0.7)) * vw
    const vy2 = (0.15 * 0.088 * Math.cos(t * 0.088 + 0.8) - 0.05 * 0.15 * Math.sin(t * 0.15 + 2.1)) * vh
    const rawAng2 = (Math.atan2(vy2, vx2) * 180) / Math.PI
    const targetRot2 = Math.max(-24, Math.min(24, rawAng2 * 0.34)) + Math.sin(t * 0.38 + 1.1) * 4

    b2X.set(targetX2)
    b2Y.set(targetY2)
    b2Rotate.set(targetRot2)
  })

  const size1 = isMobile ? 24 : 34
  const size2 = isMobile ? 26 : 38

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {/* Butterfly 1: Translucent Dusty Rose (Left margin only) */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: b1X, y: b1Y }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2"
          style={{
            rotate: b1Rotate,
            width: size1,
            opacity: 0.88,
          }}
        >
          <ButterflyGlyph
            id="cinematic-bf-1"
            slot="BUTTERFLY_PINK"
            flap={0.92}
            detail={size1 > 20}
          />
        </motion.div>
      </motion.div>

      {/* Butterfly 2: Translucent Lavender (Right margin only) */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: b2X, y: b2Y }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2"
          style={{
            rotate: b2Rotate,
            width: size2,
            opacity: 0.88,
          }}
        >
          <ButterflyGlyph
            id="cinematic-bf-2"
            slot="BUTTERFLY_LAVENDER"
            flap={0.98}
            detail={size2 > 20}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
