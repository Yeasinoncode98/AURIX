import { useEffect, useRef, useState } from 'react'

const TOTAL_FRAMES = 160
const FRAME_BASE = '/assets/aurix/exploded-views/'

function getFrameSrc(i) {
  const num   = String(i).padStart(3, '0')
  const delay = (i % 4 === 1) ? '0.07s' : '0.06s'
  return `${FRAME_BASE}frame_${num}_delay-${delay}.jpg`
}

export default function useExplodedView(canvasRef) {
  const frameImages   = useRef(new Array(TOTAL_FRAMES))
  const currentFrame  = useRef(0)
  const targetFrame   = useRef(0)
  const animFrameId   = useRef(null)
  const isAutoPlaying = useRef(true)
  const playDirection = useRef(1)
  const isPausedAtPeak = useRef(false)
  const playLoopId    = useRef(null)

  const [frame,      setFrame]      = useState(0)
  const [autoPlaying, setAutoPlaying] = useState(true)
  const [statusText,  setStatusText]  = useState('Normal: Assembled AURIX ONE')

  const getCtx = () => canvasRef.current?.getContext('2d')

  const renderFrame = (frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = getCtx()
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)))

    let img = null
    if (frameImages.current[idx]?.complete && frameImages.current[idx]?.naturalWidth > 0) {
      img = frameImages.current[idx]
    } else {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const p = idx - offset
        if (p >= 0 && frameImages.current[p]?.complete && frameImages.current[p]?.naturalWidth > 0) { img = frameImages.current[p]; break }
        const n = idx + offset
        if (n < TOTAL_FRAMES && frameImages.current[n]?.complete && frameImages.current[n]?.naturalWidth > 0) { img = frameImages.current[n]; break }
      }
    }

    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }

    currentFrame.current = frameIdx
    setFrame(Math.round(frameIdx))

    if (idx === 0) setStatusText('Normal: Assembled AURIX ONE')
    else if (idx === TOTAL_FRAMES - 1) setStatusText('Exploded View: Internal Components Revealed')
    else setStatusText(`Deconstructing: ${Math.round((idx / (TOTAL_FRAMES - 1)) * 100)}%`)
  }

  const tickAnimation = () => {
    const diff = targetFrame.current - currentFrame.current
    if (Math.abs(diff) < 0.5) { renderFrame(targetFrame.current); animFrameId.current = null; return }
    const speed = diff > 0 ? 0.95 : 1.25
    const next = diff > 0
      ? Math.min(targetFrame.current, currentFrame.current + speed)
      : Math.max(targetFrame.current, currentFrame.current - speed)
    renderFrame(next)
    animFrameId.current = requestAnimationFrame(tickAnimation)
  }

  const animateTo = (target) => {
    targetFrame.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, target))
    if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    animFrameId.current = requestAnimationFrame(tickAnimation)
  }

  const playLoop = () => {
    if (!isAutoPlaying.current || isPausedAtPeak.current) return
    const speed = playDirection.current > 0 ? 0.9 : 1.1
    let next = currentFrame.current + playDirection.current * speed

    if (next >= TOTAL_FRAMES - 1) {
      next = TOTAL_FRAMES - 1; playDirection.current = -1; renderFrame(next)
      isPausedAtPeak.current = true
      setTimeout(() => { isPausedAtPeak.current = false; if (isAutoPlaying.current) playLoopId.current = requestAnimationFrame(playLoop) }, 700)
      return
    } else if (next <= 0) {
      next = 0; playDirection.current = 1; renderFrame(next)
      isPausedAtPeak.current = true
      setTimeout(() => { isPausedAtPeak.current = false; if (isAutoPlaying.current) playLoopId.current = requestAnimationFrame(playLoop) }, 500)
      return
    }
    renderFrame(next)
    playLoopId.current = requestAnimationFrame(playLoop)
  }

  const startAutoPlay = () => {
    isAutoPlaying.current = true
    setAutoPlaying(true)
    if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    playLoop()
  }

  const stopAutoPlay = () => {
    isAutoPlaying.current = false
    setAutoPlaying(false)
    if (playLoopId.current) cancelAnimationFrame(playLoopId.current)
  }

  const toggleAutoPlay = () => {
    if (isAutoPlaying.current) stopAutoPlay()
    else startAutoPlay()
  }

  const scrubTo = (val) => {
    if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    renderFrame(parseFloat(val))
  }

  // Preload
  useEffect(() => {
    const loadFrame = (i) => new Promise(resolve => {
      const img = new Image()
      img.onload = () => { frameImages.current[i] = img; if (i === 0) renderFrame(0); resolve(img) }
      img.onerror = () => resolve(null)
      img.src = getFrameSrc(i)
    })

    ;(async () => {
      await Promise.all([loadFrame(0), loadFrame(TOTAL_FRAMES - 1)])
      const tier2 = []
      for (let i = 4; i < TOTAL_FRAMES - 1; i += 4) tier2.push(loadFrame(i))
      await Promise.all(tier2)
      for (let i = 1; i < TOTAL_FRAMES - 1; i++) if (!frameImages.current[i]) loadFrame(i)
    })()
  }, [])

  // IntersectionObserver auto-start
  useEffect(() => {
    const section = document.getElementById('engineering')
    if (!section) return
    let started = false
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started) {
          started = true
          setTimeout(() => startAutoPlay(), 150)
        }
      })
    }, { threshold: 0.25 })
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  return { frame, autoPlaying, statusText, animateTo, scrubTo, toggleAutoPlay, startAutoPlay, stopAutoPlay, TOTAL_FRAMES }
}
