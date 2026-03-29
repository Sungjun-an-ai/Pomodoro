import { useState } from 'react'
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

  const timerState = {
    minutes,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
    noiseEnabled, noiseSource, noiseVolume,
  }

  const timerActions = {
    setMinutes,
    setBgMode, setChromakeyColor, setCustomBgColor,
    setShowDigitalTimer, setFontFamily, setFontSize, setFontColor, setTimeFormat,
    setShowVisualTimer, setVisualShape, setVisualColor, setVisualTrackColor,
    setNoiseEnabled, setNoiseSource, setNoiseVolume,
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 메인 캔버스 영역 */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <TimerCanvas
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
