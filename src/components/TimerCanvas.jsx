import { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from 'react'

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 360 // 16:9 비율

export function drawFrame(ctx, canvas, secondsLeft, totalSeconds, state) {
  const W = canvas.width
  const H = canvas.height
  const cx = W / 2
  const cy = H / 2

  const {
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
  } = state

  // 1. 배경
  ctx.clearRect(0, 0, W, H)
  if (bgMode === 'chromakey') {
    ctx.fillStyle = chromakeyColor
    ctx.fillRect(0, 0, W, H)
  } else if (bgMode === 'custom') {
    ctx.fillStyle = customBgColor
    ctx.fillRect(0, 0, W, H)
  }
  // transparent → clearRect만 (알파 유지)

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0

  // 2. 시각 타이머
  if (showVisualTimer) {
    if (visualShape === 'circle') {
      const radius = Math.min(W, H) * 0.3
      const lineWidth = 12
      const startAngle = -Math.PI / 2

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = visualTrackColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.stroke()

      if (progress > 0) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius, startAngle, startAngle + Math.PI * 2 * progress)
        ctx.strokeStyle = visualColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    } else if (visualShape === 'bar') {
      const barWidth = W * 0.8
      const barHeight = 24
      const barX = (W - barWidth) / 2
      const barY = cy + 60

      ctx.fillStyle = visualTrackColor
      ctx.beginPath()
      ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2)
      ctx.fill()

      if (progress > 0) {
        ctx.fillStyle = visualColor
        ctx.beginPath()
        ctx.roundRect(barX, barY, barWidth * progress, barHeight, barHeight / 2)
        ctx.fill()
      }
    }
  }

  // 3. 숫자 타이머
  if (showDigitalTimer) {
    const formatTime = (sec) => {
      const h = String(Math.floor(sec / 3600)).padStart(2, '0')
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
      const s = String(sec % 60).padStart(2, '0')
      switch (timeFormat) {
        case 'HH:MM:SS': return `${h}:${m}:${s}`
        case 'MM:SS': return `${m}:${s}`
        case 'SS': return `${s}`
        default: return `${m}:${s}`
      }
    }

    const displayTime = formatTime(secondsLeft)
    ctx.font = `bold ${fontSize}px ${fontFamily}`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let textY = cy
    if (showVisualTimer && visualShape === 'bar') textY = cy - 20

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.fillText(displayTime, cx, textY)

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

const TimerCanvas = forwardRef(function TimerCanvas({ state }, ref) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)

  useImperativeHandle(ref, () => canvasRef.current)

  const { secondsLeft, totalSeconds, bgMode } = state

  // 메인 draw 함수
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawFrame(ctx, canvas, secondsLeft, totalSeconds, state)
    animFrameRef.current = requestAnimationFrame(draw)
  }, [secondsLeft, totalSeconds, state])

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
