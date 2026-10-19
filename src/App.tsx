import { useState, useEffect } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import CinematicIntro from './components/cinematic/CinematicIntro'
import MomentsSection from './components/MomentsSection'
import ReelSection from './components/ReelSection'
import ScreenSection from './components/ScreenSection'
import GallerySection from './components/GallerySection'
import FinaleSection from './components/FinaleSection'
import ButterflyStream from './components/ButterflyStream'
import { JourneyProvider, PointerParallaxProvider, useViewport } from './lib/heroMotion'
import { AudioProvider } from './lib/AudioContext'

export default function App() {
  const [isIntroComplete, setIsIntroComplete] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mamitha_cinematic_intro') === 'complete'
    } catch {
      return false
    }
  })

  // Support replaying intro if triggered anywhere (e.g. from nav or console)
  useEffect(() => {
    const handleReplay = () => {
      try {
        sessionStorage.removeItem('mamitha_cinematic_intro')
      } catch {}
      setIsIntroComplete(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('replay-cinematic-intro', handleReplay)
    return () => window.removeEventListener('replay-cinematic-intro', handleReplay)
  }, [])

  const handleCompleteIntro = () => {
    try {
      sessionStorage.setItem('mamitha_cinematic_intro', 'complete')
      window.dispatchEvent(new CustomEvent('cinematic-intro-status', { detail: { isOpen: false } }))
    } catch {}
    setIsIntroComplete(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const { vh } = useViewport()

  /* One value drives the entire page: viewports scrolled, anchored at the Hero.
   * As the user scrolls, journey (s) advances smoothly from 0 onwards,
   * driving the butterfly ribbon and all section marks. */
  const { scrollY } = useScroll()
  const journey = useTransform(scrollY, (v) => (vh > 0 ? v / vh : 0))

  return (
    <AudioProvider>
      <PointerParallaxProvider>
        <JourneyProvider progress={journey}>
          {!isIntroComplete ? (
            <CinematicIntro onComplete={handleCompleteIntro} />
          ) : (
            <>
              {/* Restored original portfolio butterfly stream (20-butterfly ribbon) */}
              <ButterflyStream />
              <Header />
              <main className="relative w-full">
                <div id="home">
                  <Hero />
                </div>
                <div id="moments">
                  <MomentsSection />
                </div>
                <div id="reel">
                  <ReelSection />
                </div>
                <div id="screen">
                  <ScreenSection />
                </div>
                <div id="gallery">
                  <GallerySection />
                </div>
                <div id="finale">
                  <FinaleSection />
                </div>
              </main>
            </>
          )}
        </JourneyProvider>
      </PointerParallaxProvider>
    </AudioProvider>
  )
}
