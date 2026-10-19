import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useJourney } from '../lib/heroMotion'
import DiscreetMusicPlayer from './DiscreetMusicPlayer'

interface NavItem {
  label: string
  target: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', target: '#home' },
  { label: 'About', target: '#moments' },
  { label: 'Movies', target: '#reel' },
  { label: 'Roles', target: '#screen' },
  { label: 'Gallery', target: '#gallery' },
  { label: 'Contact', target: '#finale' },
]

export default function Header() {
  const [active, setActive] = useState('Home')
  const [open, setOpen] = useState(false)
  const journey = useJourney()

  // Main header is only mounted when the cinematic intro is complete
  const [isIntroOpen, setIsIntroOpen] = useState(false)

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const custom = e as CustomEvent
      setIsIntroOpen(custom.detail?.isOpen ?? false)
    }
    window.addEventListener('cinematic-intro-status', handleStatus)
    return () => window.removeEventListener('cinematic-intro-status', handleStatus)
  }, [])

  // During the cinematic intro (s < -0.25), use light text for high contrast against photography
  const [isIntro, setIsIntro] = useState(false)

  useEffect(() => {
    return journey.on('change', (s: number) => {
      setIsIntro(s < -0.25)
    })
  }, [journey])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  const scrollToTarget = (target: string, label: string) => {
    setActive(label)
    setOpen(false)

    if (target === '#home' || target === '#cinematic-hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const el = document.querySelector(target)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isIntroOpen) return null

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 0.7, 0.22, 1] }}
    >
      {/* Background gradient blur when in intro mode for optimal legibility */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 transition-opacity duration-500 ${
          isIntro
            ? 'bg-gradient-to-b from-black/60 via-black/25 to-transparent opacity-100'
            : 'bg-gradient-to-b from-[#f7f7f5]/80 to-transparent opacity-0'
        }`}
      />

      <div className="relative mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-6 pt-5 pb-4 md:px-12 md:pt-7 md:pb-6">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => scrollToTarget('#home', 'Home')}
          className={`font-editorial text-left leading-[0.98] select-none transition-colors duration-300 ${
            isIntro
              ? 'text-[#faf8f5] [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]'
              : 'text-[#2b2d31]'
          }`}
        >
          <span className="block text-[1.05rem] tracking-[0.2em] md:text-[1.2rem]">MAMITHA</span>
          <span className="block pl-[0.9em] text-[1.05rem] tracking-[0.2em] md:text-[1.2rem]">
            BAIJU
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 min-[1040px]:flex xl:gap-10">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollToTarget(item.target, item.label)}
              className={`label relative py-1 text-[0.7rem] transition-opacity duration-300 hover:opacity-60 ${
                isIntro
                  ? 'text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]'
                  : 'text-[#2b2d31]'
              }`}
            >
              {item.label}
              {active === item.label && (
                <motion.span
                  layoutId="nav-dot"
                  className={`absolute -bottom-1.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full ${
                    isIntro ? 'bg-white shadow-[0_0_6px_white]' : 'bg-[#2b2d31]'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Actions: Discreet music player + Follow + Mobile menu button */}
        <div className="flex items-center gap-3">
          {/* Discreet music player toggle */}
          <DiscreetMusicPlayer light={isIntro} />

          <a
            href="https://www.instagram.com/karthikreddi__18/"
            target="_blank"
            rel="noopener noreferrer"
            className={`label group hidden items-center gap-2 rounded-full px-5 py-2.5 text-[0.66rem] transition-all duration-500 sm:inline-flex ${
              isIntro
                ? 'border border-white/30 bg-white/15 text-white backdrop-blur-md hover:bg-white/30'
                : 'bg-[#2b2d31] text-white hover:bg-[#43464d]'
            }`}
          >
            Follow
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.8}
            />
          </a>

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors min-[1040px]:hidden ${
              isIntro
                ? 'border-white/30 bg-black/35 text-white'
                : 'border-[rgba(43,45,49,0.14)] bg-white/60 text-[#2b2d31]'
            }`}
          >
            <Menu className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        className={`mx-auto h-px max-w-[1680px] transition-colors duration-500 md:mx-12 md:max-w-none ${
          isIntro ? 'bg-white/15' : 'bg-[rgba(43,45,49,0.09)]'
        }`}
      />

      {/* ---------------------------------------------- Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[80] flex flex-col bg-[#f7f7f5] min-[1040px]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 0.7, 0.22, 1] }}
          >
            <div className="flex items-center justify-between px-7 pt-7 pb-6">
              <span className="font-editorial leading-[0.98] text-[#2b2d31]">
                <span className="block text-[1.05rem] tracking-[0.2em]">MAMITHA</span>
                <span className="block pl-[0.9em] text-[1.05rem] tracking-[0.2em]">BAIJU</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(43,45,49,0.14)] text-[#2b2d31]"
              >
                <X className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToTarget(item.target, item.label)}
                  className="font-editorial flex items-baseline gap-4 py-2.5 text-left text-[2.2rem] leading-none text-[#2b2d31]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.16, 0.7, 0.22, 1] }}
                >
                  <span className="label w-7 text-[0.6rem] text-[#a5a8ae]">
                    0{i + 1}
                  </span>
                  {item.label}
                  {active === item.label && (
                    <span className="ml-1 h-[5px] w-[5px] rounded-full bg-[#2b2d31]" />
                  )}
                </motion.button>
              ))}
            </nav>

            <motion.div
              className="flex items-center justify-between px-8 pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.5 }}
            >
              <span className="label text-[0.6rem] text-[#8b8e96]">Actor / Performer / Artist</span>
              <a
                href="https://www.instagram.com/karthikreddi__18/"
                target="_blank"
                rel="noopener noreferrer"
                className="label inline-flex items-center gap-2 rounded-full bg-[#2b2d31] px-6 py-3 text-[0.66rem] text-white"
              >
                Follow
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
