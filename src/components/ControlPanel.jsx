/* ── 재사용 UI 컴포넌트들 ── */
function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-widest mb-3">
      <span className="text-lg">{icon}</span>
      {children}
    </h3>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-indigo-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
      </div>
    </label>
  )
}

function ColorPicker({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border-2 border-gray-600 cursor-pointer bg-transparent"
        />
      </div>
    </label>
  )
}

function Slider({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-indigo-400 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
      />
    </label>
  )
}

function SelectBox({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-400 block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
            value === opt.value
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ── 메인 제어판 ── */
export default function ControlPanel({
  state,
  actions,
  fontOptions,
  noiseOptions,
  exportMode,
  setExportMode,
  isExporting,
  exportProgress,
  onExportVideo,
  onCancelExport,
}) {
  const {
    minutes,
    bgMode, chromakeyColor, customBgColor,
    showDigitalTimer, fontFamily, fontSize, fontColor, timeFormat,
    showVisualTimer, visualShape, visualColor, visualTrackColor,
    noiseEnabled, noiseSource, noiseVolume,
    isRunning, secondsLeft,
  } = state

  const {
    setMinutes,
    setBgMode, setChromakeyColor, setCustomBgColor,
    setShowDigitalTimer, setFontFamily, setFontSize, setFontColor, setTimeFormat,
    setShowVisualTimer, setVisualShape, setVisualColor, setVisualTrackColor,
    setNoiseEnabled, setNoiseSource, setNoiseVolume,
    handleStart, handlePause, handleReset,
  } = actions

  // 남은 시간 텍스트용 포맷
  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0')
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  const formattedTime = formatTime(secondsLeft)

  return (
    <div className="p-5 space-y-6">
      {/* 헤더 */}
      <div className="pb-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">🍅 뽀모도로 설정</h2>
        <p className="text-xs text-gray-500 mt-1">ADHD Focus Timer & Overlay</p>
      </div>

      {/* ━━━━━━━ 0. 타이머 제어 ━━━━━━━ */}
      <section>
        <SectionTitle icon="▶️">타이머 제어</SectionTitle>
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={isExporting}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶ 시작
            </button>
          ) : (
            <button
              onClick={handlePause}
              disabled={isExporting}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-yellow-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏸ 일시정지
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={isExporting}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↺ 초기화
          </button>
        </div>
        <p className="text-center text-sm text-gray-400 mt-2 font-mono">
          남은 시간: {formattedTime}
        </p>
      </section>

      {/* ━━━━━━━ 1. 타이머 시간 ━━━━━━━ */}
      <section>
        <SectionTitle icon="⏱️">타이머 시간</SectionTitle>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1} max={180}
            value={minutes}
            disabled={isRunning}
            onChange={(e) => setMinutes(Math.max(1, Math.min(180, Number(e.target.value))))}
            className="w-24 bg-gray-800 border border-gray-700 text-center text-white text-lg font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-gray-400 text-sm">분</span>
          {/* 빠른 선택 */}
          <div className="flex gap-1.5 ml-auto">
            {[5, 15, 25, 45].map((m) => (
              <button
                key={m}
                disabled={isRunning}
                onClick={() => setMinutes(m)}
                className={`text-xs px-2 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  minutes === m
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━ 2. 배경 설정 ━━━━━━━ */}
      <section>
        <SectionTitle icon="🎨">배경 설정</SectionTitle>
        <RadioGroup
          options={[
            { label: '🔲 투명 (WebM)', value: 'transparent' },
            { label: '🟩 크로마키', value: 'chromakey' },
            { label: '🎨 커스텀', value: 'custom' },
          ]}
          value={bgMode}
          onChange={setBgMode}
        />
        <div className="mt-3 space-y-2">
          {bgMode === 'chromakey' && (
            <ColorPicker label="크로마키 색상" value={chromakeyColor} onChange={setChromakeyColor} />
          )}
          {bgMode === 'custom' && (
            <ColorPicker label="배경 색상" value={customBgColor} onChange={setCustomBgColor} />
          )}
        </div>
      </section>

      {/* ━━━━━━━ 3. 숫자 타이머 옵션 ━━━━━━━ */}
      <section>
        <SectionTitle icon="🔢">숫자 타이머</SectionTitle>
        <div className="space-y-4">
          <Toggle label="숫자 타이머 표시" checked={showDigitalTimer} onChange={setShowDigitalTimer} />

          {showDigitalTimer && (
            <div className="space-y-4 pl-2 border-l-2 border-indigo-500/30 ml-1">
              <SelectBox
                label="폰트"
                value={fontFamily}
                onChange={setFontFamily}
                options={fontOptions}
              />

              <Slider
                label="폰트 크기"
                value={fontSize}
                onChange={setFontSize}
                min={24} max={160} step={2}
                unit="px"
              />

              <ColorPicker label="폰트 색상" value={fontColor} onChange={setFontColor} />

              <div>
                <span className="text-sm text-gray-400 block mb-2">표시 형식</span>
                <RadioGroup
                  options={[
                    { label: 'HH:MM:SS', value: 'HH:MM:SS' },
                    { label: 'MM:SS', value: 'MM:SS' },
                    { label: 'SS', value: 'SS' },
                  ]}
                  value={timeFormat}
                  onChange={setTimeFormat}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━ 4. 시각 타이머 옵션 ━━━━━━━ */}
      <section>
        <SectionTitle icon="📊">시각 타이머</SectionTitle>
        <div className="space-y-4">
          <Toggle label="시각 타이머 표시" checked={showVisualTimer} onChange={setShowVisualTimer} />

          {showVisualTimer && (
            <div className="space-y-4 pl-2 border-l-2 border-indigo-500/30 ml-1">
              <div>
                <span className="text-sm text-gray-400 block mb-2">형태</span>
                <RadioGroup
                  options={[
                    { label: '⭕ 원형 그래프', value: 'circle' },
                    { label: '📏 막대바', value: 'bar' },
                  ]}
                  value={visualShape}
                  onChange={setVisualShape}
                />
              </div>

              <ColorPicker label="활성 색상" value={visualColor} onChange={setVisualColor} />
              <ColorPicker label="트랙 색상" value={visualTrackColor} onChange={setVisualTrackColor} />
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━ 5. 백색소음 ━━━━━━━ */}
      <section>
        <SectionTitle icon="🎧">백색소음</SectionTitle>
        <div className="space-y-4">
          <Toggle label="백색소음 켜기" checked={noiseEnabled} onChange={setNoiseEnabled} />

          {noiseEnabled && (
            <div className="space-y-4 pl-2 border-l-2 border-indigo-500/30 ml-1">
              <SelectBox
                label="소리 선택"
                value={noiseSource}
                onChange={setNoiseSource}
                options={noiseOptions}
              />

              <Slider
                label="볼륨"
                value={noiseVolume}
                onChange={setNoiseVolume}
                min={0} max={100}
                unit="%"
              />
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━ 6. 영상 추출 ━━━━━━━ */}
      <section>
        <SectionTitle icon="🎬">영상 추출</SectionTitle>
        <div className="space-y-4">
          {/* 배속 선택 */}
          <div>
            <span className="text-sm text-gray-400 block mb-2">추출 방식</span>
            <RadioGroup
              options={[
                { label: '⚡ 빠른 추출', value: 'fast' },
                { label: '🕐 실시간 (1배속)', value: 'realtime' },
              ]}
              value={exportMode}
              onChange={setExportMode}
            />
            <p className="text-xs text-gray-600 mt-1">
              {exportMode === 'fast'
                ? '타임랩스 방식으로 빠르게 영상을 생성합니다'
                : '실제 시간만큼 녹화합니다 (25분 = 25분 소요)'}
            </p>
          </div>

          {/* 포맷 정보 */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
            <p>📁 포맷: {bgMode === 'transparent' ? 'WebM (VP9, 투명 배경)' : 'WebM (VP8)'}</p>
            <p>📐 해상도: 640 × 360 (16:9)</p>
            <p>⏱️ 길이: {minutes}분 ({minutes * 60}초)</p>
            <p className="mt-1 text-gray-500">⚠️ Chrome / Edge / Firefox 권장 (Safari 미지원)</p>
          </div>

          {/* 추출 버튼 또는 진행 상태 */}
          {!isExporting ? (
            <button
              onClick={onExportVideo}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              <span>🎬</span>
              타이머 영상 추출 (다운로드)
            </button>
          ) : (
            <div className="space-y-2">
              {/* 진행률 바 */}
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-purple-400 font-mono">
                  {exportProgress}% 추출 중...
                </p>
                <button
                  onClick={onCancelExport}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  ✕ 취소
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 하단 정보 */}
      <div className="pt-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          🍅 ADHD Focus Timer & YouTube Overlay
        </p>
      </div>
    </div>
  )
}
