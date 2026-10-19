import { useEffect, useRef } from 'react'

interface RainDrop {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
  thickness: number
}

export default function RainCanvas({
  intensity = 1,
  className = '',
}: {
  intensity?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationId: number
    let width = 0
    let height = 0
    let isVisible = true

    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersReducedMotion = mediaQuery.matches

    // Responsive drop count: lighter on mobile to keep faces clear & save battery
    const getDropCount = () => {
      const isMobile = window.innerWidth < 768
      const base = isMobile ? 38 : 75
      return Math.round(base * intensity)
    }

    let drops: RainDrop[] = []

    const resetDrop = (initial = false): RainDrop => {
      const isFore = Math.random() < 0.25
      return {
        x: Math.random() * (width + 120) - 60,
        y: initial ? Math.random() * height : -30 - Math.random() * 40,
        length: isFore ? 18 + Math.random() * 16 : 9 + Math.random() * 12,
        speed: isFore ? 14 + Math.random() * 6 : 8 + Math.random() * 5,
        opacity: (isFore ? 0.22 + Math.random() * 0.14 : 0.1 + Math.random() * 0.12) * intensity,
        thickness: isFore ? 1.2 : 0.75,
      }
    }

    const initDrops = () => {
      drops = Array.from({ length: getDropCount() }, () => resetDrop(true))
    }

    const resize = () => {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.parentElement?.clientWidth || canvas.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || canvas.clientHeight || window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      initDrops()
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Render loop
    const render = () => {
      if (!isVisible || prefersReducedMotion) {
        animationId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Slant angle: -12 degrees (cos(-12°) ≈ 0.978, sin(-12°) ≈ -0.208)
      const angle = (-12 * Math.PI) / 180
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      ctx.lineCap = 'round'

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]

        ctx.strokeStyle = `rgba(235, 240, 245, ${d.opacity})`
        ctx.lineWidth = d.thickness

        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + sinA * d.length, d.y + cosA * d.length)
        ctx.stroke()

        // Move along slant
        d.x += sinA * d.speed
        d.y += cosA * d.speed

        // Reset when passing bottom or left edge
        if (d.y > height + 40 || d.x < -80) {
          drops[i] = resetDrop(false)
        }
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 h-full w-full ${className}`}
      style={{ willChange: 'transform' }}
    />
  )
}
