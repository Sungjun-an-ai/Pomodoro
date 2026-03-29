import { useState, useRef, useCallback } from 'react'

export default function useVideoExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0) // 0~100
  const [exportMode, setExportMode] = useState('fast') // 'realtime' | 'fast'
  const abortRef = useRef(false)

  const exportVideo = useCallback(async ({ canvasRef, state, drawFrame }) => {
    // canvasRef: canvas DOM 요소
    // state: 현재 timerState
    // drawFrame: (ctx, canvas, secondsLeft, totalSeconds, state) => void — 한 프레임을 그리는 함수

    const canvas = canvasRef
    if (!canvas) return

    setIsExporting(true)
    setExportProgress(0)
    abortRef.current = false

    const totalSeconds = state.minutes * 60
    const fps = 30
    const mimeType = state.bgMode === 'transparent'
      ? 'video/webm; codecs=vp9'
      : 'video/webm; codecs=vp8'

    // canvas에서 스트림 캡처
    const stream = canvas.captureStream(fps)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4_000_000, // 4Mbps
    })

    const chunks = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    const downloadPromise = new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pomodoro-timer-${state.minutes}min.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        resolve()
      }
    })

    mediaRecorder.start()

    const ctx = canvas.getContext('2d')

    if (exportMode === 'fast') {
      // ── 빠른 추출 (타임랩스) ──
      // 실시간을 기다리지 않고 프레임을 빠르게 그려서 녹화
      for (let sec = totalSeconds; sec >= 0; sec--) {
        if (abortRef.current) break

        // 영상에서도 1초=1초가 되려면 fps 프레임을 그려야 함
        for (let f = 0; f < fps; f++) {
          if (abortRef.current) break
          drawFrame(ctx, canvas, sec, totalSeconds, state)
          // captureStream이 프레임을 잡을 수 있도록 약간의 딜레이
          await new Promise((r) => setTimeout(r, 0))
        }

        setExportProgress(Math.round(((totalSeconds - sec) / totalSeconds) * 100))
      }
    } else {
      // ── 실시간 녹화 (1배속) ──
      // 실제 1초마다 프레임을 그림
      for (let sec = totalSeconds; sec >= 0; sec--) {
        if (abortRef.current) break

        drawFrame(ctx, canvas, sec, totalSeconds, state)

        setExportProgress(Math.round(((totalSeconds - sec) / totalSeconds) * 100))

        // 실시간 1초 대기
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    mediaRecorder.stop()
    await downloadPromise

    setIsExporting(false)
    setExportProgress(abortRef.current ? 0 : 100)
  }, [exportMode])

  const cancelExport = useCallback(() => {
    abortRef.current = true
  }, [])

  return {
    isExporting,
    exportProgress,
    exportMode,
    setExportMode,
    exportVideo,
    cancelExport,
  }
}
