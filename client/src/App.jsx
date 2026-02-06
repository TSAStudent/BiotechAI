import { useState } from "react";

const API_BASE = "/api";

/** Compute sleep hours from bed and wake time (HH:MM). Assumes overnight if wake <= bed. */
function sleepHoursFromTimes(bedTime, wakeTime) {
  const [bH, bM] = (bedTime || "00:00").split(":").map(Number);
  const [wH, wM] = (wakeTime || "00:00").split(":").map(Number);
  const bedMins = bH * 60 + (bM || 0);
  const wakeMins = wH * 60 + (wM || 0);
  const dayMins = 24 * 60;
  let mins = wakeMins <= bedMins ? dayMins - bedMins + wakeMins : wakeMins - bedMins;
  if (mins < 0 || mins > dayMins) mins = 0;
  return Math.round((mins / 60) * 2) / 2; // nearest 0.5
}

const defaultForm = {
  melatoninLevel: 20,
  heartRate: 65,
  bedTime: "23:00",
  wakeTime: "06:00",
  age: "",
  caffeineAfternoon: "no",
};

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sleepHoursLastNight = sleepHoursFromTimes(form.bedTime, form.wakeTime);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = { ...form, sleepHoursLastNight };
      const hr = payload.heartRate;
      if (hr === "" || hr == null || Number.isNaN(Number(hr))) {
        payload.heartRate = 65;
      } else {
        payload.heartRate = Math.min(120, Math.max(40, Number(hr)));
      }
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sleep-blue/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sleep-indigo/10 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-night-700/80 px-4 py-1.5 text-sm text-glow-cyan/90 font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-glow-cyan animate-pulse-soft" />
            Melatonin × Heart Rate × AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
            BiotechAI Sleep
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Enter your melatonin level and heart rate for a personalized sleep
            assessment and circadian insights.
          </p>
        </header>

        {/* Form card */}
        <section className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6 sm:p-8 mb-8 shadow-glow animate-fade-in">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-sleep-blue">◇</span> Your metrics
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Melatonin level (pg/mL)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.melatoninLevel}
                  onChange={(e) =>
                    update("melatoninLevel", Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="font-mono text-sleep-blue w-12 text-right">
                  {form.melatoninLevel} pg/mL
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Resting heart rate (bpm)
              </label>
              <input
                type="number"
                min="40"
                max="120"
                placeholder="40–120"
                value={form.heartRate === "" ? "" : form.heartRate}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    update("heartRate", "");
                    return;
                  }
                  const n = Number(v);
                  if (!Number.isNaN(n)) update("heartRate", n);
                }}
                onBlur={(e) => {
                  const v = form.heartRate;
                  if (v === "" || v == null) {
                    update("heartRate", 65);
                    return;
                  }
                  const n = Number(v);
                  update("heartRate", Math.min(120, Math.max(40, Number.isNaN(n) ? 65 : n)));
                }}
                className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 font-mono text-white placeholder:text-slate-500 focus:border-sleep-blue focus:ring-1 focus:ring-sleep-blue outline-none transition"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Sleep last night (hours)
              </label>
              <input
                type="text"
                readOnly
                value={sleepHoursLastNight}
                className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 font-mono text-white focus:ring-0 cursor-default opacity-90"
                title="Calculated from bed and wake time"
              />
              <p className="text-xs text-slate-500 mt-1">From bed and wake time</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Bed time
                </label>
                <input
                  type="time"
                  value={form.bedTime}
                  onChange={(e) => update("bedTime", e.target.value)}
                  className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 font-mono text-white focus:border-sleep-blue focus:ring-1 focus:ring-sleep-blue outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Wake time
                </label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={(e) => update("wakeTime", e.target.value)}
                  className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 font-mono text-white focus:border-sleep-blue focus:ring-1 focus:ring-sleep-blue outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Age (optional)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="—"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 font-mono text-white placeholder:text-slate-500 focus:border-sleep-blue focus:ring-1 focus:ring-sleep-blue outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Caffeine after 2pm?
              </label>
              <select
                value={form.caffeineAfternoon}
                onChange={(e) => update("caffeineAfternoon", e.target.value)}
                className="w-full rounded-xl bg-night-700 border border-night-600 px-4 py-3 text-white focus:border-sleep-blue focus:ring-1 focus:ring-sleep-blue outline-none transition"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="sometimes">Sometimes</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full sm:w-auto sm:min-w-[200px] py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-sleep-blue to-sleep-indigo text-white shadow-glow hover:opacity-95 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </span>
            ) : (
              "Analyze my sleep"
            )}
          </button>
        </section>

        {/* Results */}
        {result && (
          <section className="space-y-6 animate-fade-in">
            {/* Verdict banner */}
            <div
              className={`rounded-2xl border p-6 sm:p-8 ${
                result.needsMoreSleep
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-emerald-500/10 border-emerald-500/40"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                    result.needsMoreSleep
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {result.needsMoreSleep ? "⚠ Need more sleep" : "✓ Sleep OK"}
                </span>
                <span className="text-slate-500 text-sm font-mono">
                  Confidence: {result.confidence}
                </span>
              </div>
              <p className="text-lg text-white font-medium">
                {result.sleepVerdict}
              </p>
            </div>

            {/* Stress level (number from OpenAI API + fallback) — always show a number */}
            {(() => {
              const stressNum = Math.round(Number(result.stressLevelDetected)) || 5;
              const clamped = Math.min(10, Math.max(1, stressNum));
              return (
            <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-amber-400/90">◆</span> Stress level
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Calculated from your heart rate, sleep, and caffeine. AI may refine the explanation.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-amber-300">
                    {clamped}
                  </span>
                  <span className="text-slate-500 text-sm">/ 10</span>
                </div>
                <div
                  className="flex-1 min-w-[120px] h-2 rounded-full bg-night-700 overflow-hidden"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(clamped / 10) * 100}%`,
                      background:
                        clamped <= 3
                          ? "linear-gradient(90deg, #22c55e, #4ade80)"
                          : clamped <= 6
                          ? "linear-gradient(90deg, #eab308, #facc15)"
                          : "linear-gradient(90deg, #f97316, #ef4444)",
                    }}
                  />
                </div>
              </div>
              {result.stressInsight && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.stressInsight}
                </p>
              )}
            </div>
              );
            })()}

            {/* Quality score */}
            <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Sleep quality score
              </h3>
              <div className="flex items-end gap-4">
                <div
                  className="flex-1 max-w-[120px] h-24 rounded-xl bg-night-700 flex items-end justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(to top, ${
                      (result.qualityScore || 0) >= 70
                        ? "rgba(34, 197, 94, 0.5)"
                        : (result.qualityScore || 0) >= 40
                        ? "rgba(234, 179, 8, 0.5)"
                        : "rgba(239, 68, 68, 0.5)"
                    }, transparent)`,
                  }}
                >
                  <span className="text-3xl font-bold text-white font-mono mb-2">
                    {result.qualityScore ?? "—"}
                  </span>
                </div>
                <p className="text-slate-400 text-sm flex-1">
                  Out of 100. Higher is better rest and alignment with your
                  circadian rhythm.
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recommendations
                </h3>
                <ul className="space-y-5">
                  {result.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-slate-300 leading-relaxed"
                    >
                      <span className="text-sleep-blue font-mono shrink-0 font-semibold">
                        {i + 1}.
                      </span>
                      <span className="min-w-0">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ideal times */}
            {(result.idealBedtime || result.idealWakeTime) && (
              <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Suggested schedule
                </h3>
                <div className="flex flex-wrap gap-6">
                  {result.idealBedtime && (
                    <div>
                      <span className="text-slate-500 text-sm block">Bed</span>
                      <span className="font-mono text-sleep-blue text-xl">
                        {result.idealBedtime}
                      </span>
                    </div>
                  )}
                  {result.idealWakeTime && (
                    <div>
                      <span className="text-slate-500 text-sm block">Wake</span>
                      <span className="font-mono text-sleep-blue text-xl">
                        {result.idealWakeTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="grid sm:grid-cols-2 gap-6">
              {result.circadianInsight && (
                <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6">
                  <h3 className="text-sm font-semibold text-glow-cyan/90 mb-2">
                    Circadian insight
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.circadianInsight}
                  </p>
                </div>
              )}
              {result.heartRateInsight && (
                <div className="bg-night-800/60 backdrop-blur-xl rounded-2xl border border-night-600/50 p-6">
                  <h3 className="text-sm font-semibold text-glow-blue/90 mb-2">
                    Heart rate & recovery
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.heartRateInsight}
                  </p>
                </div>
              )}
            </div>

            {result.sleepDebtNote && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-amber-300/90 mb-2">
                  Sleep debt
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.sleepDebtNote}
                </p>
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 text-center text-slate-500 text-sm">
          BiotechAI Sleep · For guidance only. Not medical advice.
        </footer>
      </div>
    </div>
  );
}
