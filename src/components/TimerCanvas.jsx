export default function TimerCanvas({ state }) {
  const {
    minutes,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
  } = state

  // 배경색 결정
  const getBgStyle = () => {
    switch (bgMode) {
      case 'transparent':
        return {
          backgroundImage:
            'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)',
          backgroundSize: '20px 20px',
        }
      case 'chromakey':
        return { backgroundColor: chromakeyColor }
      case 'custom':
        return { backgroundColor: customBgColor }
      default:
        return {}
    }
  }

  // 시간 포맷팅 (미리보기용 — 실제 타이머 로직은 나중에)
  const formatTime = (totalSeconds) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const s = String(totalSeconds % 60).padStart(2, '0')
    switch (timeFormat) {
      case 'HH:MM:SS': return `${h}:${m}:${s}`
      case 'MM:SS': return `${m}:${s}`
      case 'SS': return `${s}`
      default: return `${m}:${s}`
    }
  }

  const totalSeconds = minutes * 60
  const displayTime = formatTime(totalSeconds)

  // 원형 그래프 SVG 파라미터
  const circleRadius = 90
  const circleCircumference = 2 * Math.PI * circleRadius
  const progress = 0.75 // 미리보기용 75%

  return (
    <div
      className="w-full max-w-[640px] aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative flex flex-col items-center justify-center gap-4"
      style={getBgStyle()}
    >
      {/* 투명 모드 라벨 */}
      {bgMode === 'transparent' && (
        <div className="absolute top-3 left-3 bg-black/60 text-xs text-gray-300 px-2 py-1 rounded">
          투명 배경 (WebM)
        </div>
      )}

      {/* 시각 타이머 */}
      {showVisualTimer && visualShape === 'circle' && (
        <svg width="220" height="220" className="drop-shadow-lg">
          <circle
            cx="110" cy="110" r={circleRadius}
            fill="none"
            stroke={visualTrackColor}
            strokeWidth="12"
          />
          <circle
            cx="110" cy="110" r={circleRadius}
            fill="none"
            stroke={visualColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circleCircumference}
            strokeDashoffset={circleCircumference * (1 - progress)}
            transform="rotate(-90 110 110)"
            className="transition-all duration-300"
          />
        </svg>
      )}

      {showVisualTimer && visualShape === 'bar' && (
        <div className="w-4/5 h-6 rounded-full overflow-hidden" style={{ backgroundColor: visualTrackColor }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%`, backgroundColor: visualColor }}
          />
        </div>
      )}

      {/* 숫자 타이머 */}
      {showDigitalTimer && (
        <div
          className="tabular-nums tracking-wider drop-shadow-lg"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            color: fontColor,
          }}
        >
          {displayTime}
        </div>
      )}

      {/* 아무것도 표시 안 될 때 */}
      {!showDigitalTimer && !showVisualTimer && (
        <p className="text-gray-400 text-sm">타이머 표시가 모두 꺼져 있습니다</p>
      )}
    </div>
  )
}
