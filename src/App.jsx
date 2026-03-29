import { useState, useEffect, useRef } from 'react'
import TimerCanvas from './components/TimerCanvas'
import ControlPanel from './components/ControlPanel'

const FONT_OPTIONS = [
  { label: 'Roboto Mono', value: "'Roboto Mono', monospace" },
  { label: 'Orbitron', value: "'Orbitron', sans-serif" },
  { label: 'Press Start 2P', value: "'Press Start 2P', cursive" },
  { label: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
]

const NOISE_OPTIONS = [
  { label: '🌧️ 비 오는 소리', value: 'https://cdn.pixabay.com/audio/2022/10/30/audio_51e0a1e8c1.mp3' },
  { label: '☕ 카페 소음', value: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b4ece1.mp3' },
  { label: '🌊 파도 소리', value: 'https://cdn.pixabay.com/audio/2024/06/11/audio_461f907715.mp3' },
  { label: '🔥 모닥불', value: 'https://cdn.pixabay.com/audio/2024/03/18/audio_4cfccde6a5.mp3' },
]

export default function App() {
  // ── Timer Setting ──
  const [minutes, setMinutes] = useState(25)

  // ── Background Setting ──
  const [bgMode, setBgMode] = useState('transparent') // 'transparent' | 'chromakey' | 'custom'
  const [chromakeyColor, setChromakeyColor] = useState('#00FF00')
  const [customBgColor, setCustomBgColor] = useState('#1a1a2e')

  // ── Number Timer Options ──
  const [showDigitalTimer, setShowDigitalTimer] = useState(true)
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value)
  const [fontSize, setFontSize] = useState(72)
  const [fontColor, setFontColor] = useState('#FFFFFF')
  const [timeFormat, setTimeFormat] = useState('MM:SS') // 'HH:MM:SS' | 'MM:SS' | 'SS'

  // ── Visual Timer Options ──
  const [showVisualTimer, setShowVisualTimer] = useState(true)
  const [visualShape, setVisualShape] = useState('circle') // 'circle' | 'bar'
  const [visualColor, setVisualColor] = useState('#6366f1')
  const [visualTrackColor, setVisualTrackColor] = useState('#1e1b4b')

  // ── White Noise ──
  const [noiseEnabled, setNoiseEnabled] = useState(false)
  const [noiseSource, setNoiseSource] = useState(NOISE_OPTIONS[0].value)
  const [noiseVolume, setNoiseVolume] = useState(50)

  // ── Timer Logic State ──
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60)

  // ── Canvas Ref (for video capture) ──
  const canvasRef = useRef(null)

  // ── Audio Ref ──
  const audioRef = useRef(null)

  // ── Timer Countdown ──
  useEffect(() => {
    if (!isRunning) return
    if (secondsLeft <= 0) {
      setIsRunning(false)
      return
    }
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, secondsLeft])

  // ── Sync secondsLeft/totalSeconds when minutes changes (only when not running) ──
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(minutes * 60)
      setTotalSeconds(minutes * 60)
    }
  }, [minutes, isRunning])

  // ── White Noise Audio ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (isRunning && noiseEnabled) {
      const audio = new Audio(noiseSource)
      audio.loop = true
      audio.volume = noiseVolume / 100
      audio.play().catch((err) => { console.warn('Audio autoplay blocked:', err) })
      audioRef.current = audio
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [isRunning, noiseEnabled, noiseSource])

  // ── Volume real-time sync ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = noiseVolume / 100
    }
  }, [noiseVolume])

  // ── Handlers ──
  const handleStart = () => {
    if (secondsLeft > 0) {
      if (!isRunning) {
        setTotalSeconds(secondsLeft)
      }
      setIsRunning(true)
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(minutes * 60)
    setTotalSeconds(minutes * 60)
  }

  const timerState = {
    minutes,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
    noiseEnabled, noiseSource, noiseVolume,
    secondsLeft, totalSeconds, isRunning,
  }

  const timerActions = {
    setMinutes,
    setBgMode, setChromakeyColor, setCustomBgColor,
    setShowDigitalTimer, setFontFamily, setFontSize, setFontColor, setTimeFormat,
    setShowVisualTimer, setVisualShape, setVisualColor, setVisualTrackColor,
    setNoiseEnabled, setNoiseSource, setNoiseVolume,
    handleStart, handlePause, handleReset,
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 메인 캔버스 영역 */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <TimerCanvas
          ref={canvasRef}
          state={timerState}
          fontOptions={FONT_OPTIONS}
        />
      </div>

      {/* 옵션 제어판 */}
      <div className="w-full lg:w-[420px] lg:min-w-[420px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-900/80 backdrop-blur-sm overflow-y-auto max-h-screen">
        <ControlPanel
          state={timerState}
          actions={timerActions}
          fontOptions={FONT_OPTIONS}
          noiseOptions={NOISE_OPTIONS}
        />
      </div>
    </div>
  )
}
