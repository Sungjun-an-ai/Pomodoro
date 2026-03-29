import { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from 'react'

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 360 // 16:9 비율

const TimerCanvas = forwardRef(function TimerCanvas({ state }, ref) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)

  useImperativeHandle(ref, () => canvasRef.current)

  const {
    secondsLeft, totalSeconds,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
  } = state

  // 시간 포맷팅
  const formatTime = useCallback((totalSec) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    switch (timeFormat) {
      case 'HH:MM:SS': return `${h}:${m}:${s}`
      case 'MM:SS': return `${m}:${s}`
      case 'SS': return `${s}`
      default: return `${m}:${s}`
    }
  }, [timeFormat])

  // 메인 draw 함수
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = CANVAS_WIDTH
    const H = CANVAS_HEIGHT
    const cx = W / 2
    const cy = H / 2

    // ── 1. 배경 ──
    ctx.clearRect(0, 0, W, H)
    if (bgMode === 'chromakey') {
      ctx.fillStyle = chromakeyColor
      ctx.fillRect(0, 0, W, H)
    } else if (bgMode === 'custom') {
      ctx.fillStyle = customBgColor
      ctx.fillRect(0, 0, W, H)
    }
    // transparent: clearRect만 수행 (알파 채널 유지)

    const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0

    // ── 2. 시각 타이머 ──
    if (showVisualTimer) {
      if (visualShape === 'circle') {
        const radius = Math.min(W, H) * 0.3
        const lineWidth = 12
        const startAngle = -Math.PI / 2 // 12시 방향

        // 트랙 (배경 원)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = visualTrackColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.stroke()

        // 진행 호 (arc)
        if (progress > 0) {
          const endAngle = startAngle + Math.PI * 2 * progress
          ctx.beginPath()
          ctx.arc(cx, cy, radius, startAngle, endAngle)
          ctx.strokeStyle = visualColor
          ctx.lineWidth = lineWidth
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      } else if (visualShape === 'bar') {
        const barWidth = W * 0.8
        const barHeight = 24
        const barX = (W - barWidth) / 2
        const barY = cy + 60 // 텍스트 아래

        // 트랙
        ctx.fillStyle = visualTrackColor
        ctx.beginPath()
        ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2)
        ctx.fill()

        // 진행 바
        if (progress > 0) {
          const fillWidth = barWidth * progress
          ctx.fillStyle = visualColor
          ctx.beginPath()
          ctx.roundRect(barX, barY, fillWidth, barHeight, barHeight / 2)
          ctx.fill()
        }
      }
    }

    // ── 3. 숫자 타이머 ──
    if (showDigitalTimer) {
      const displayTime = formatTime(secondsLeft)
      ctx.font = `bold ${fontSize}px ${fontFamily}`
      ctx.fillStyle = fontColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 위치: 시각 타이머가 막대바면 중앙 위쪽, 그 외 중앙
      let textY = cy
      if (showVisualTimer && visualShape === 'bar') {
        textY = cy - 20
      }

      // 텍스트 그림자 (가독성)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(displayTime, cx, textY)

      // 그림자 리셋
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // 다음 프레임 요청
    animFrameRef.current = requestAnimationFrame(draw)
  }, [
    secondsLeft, totalSeconds,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
    formatTime,
  ])

  // requestAnimationFrame 루프 관리
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw)
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [draw])

  return (
    <div className="w-full max-w-[640px]">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full rounded-2xl shadow-2xl shadow-black/50"
        style={
          bgMode === 'transparent'
            ? {
                backgroundImage:
                  'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)',
                backgroundSize: '20px 20px',
              }
            : {}
        }
      />
      {/* 투명 모드 라벨 */}
      {bgMode === 'transparent' && (
        <p className="text-center text-xs text-gray-500 mt-2">
          🔲 투명 배경 (WebM 추출 시 알파 채널 유지)
        </p>
      )}
    </div>
  )
})

export default TimerCanvas
