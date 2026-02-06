import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Calculate stress level 1-10 from metrics (used when AI doesn't return it). */
function calculateStressLevel({ heartRate, sleepHoursLastNight, caffeineAfternoon, melatoninLevel }) {
  let score = 5; // baseline
  // Heart rate: elevated HR suggests higher stress (60-80 typical rest, 80+ elevated)
  if (heartRate >= 85) score += 2;
  else if (heartRate >= 75) score += 1;
  else if (heartRate <= 55) score -= 1;
  // Sleep: short sleep increases stress
  if (sleepHoursLastNight < 5) score += 2;
  else if (sleepHoursLastNight < 6) score += 1;
  else if (sleepHoursLastNight >= 8 && sleepHoursLastNight <= 9) score -= 0.5;
  // Caffeine
  if (caffeineAfternoon === "yes") score += 1;
  else if (caffeineAfternoon === "sometimes") score += 0.5;
  const level = Math.round(Math.min(10, Math.max(1, score)));
  const insight = `Calculated from your resting heart rate (${heartRate} bpm), sleep (${sleepHoursLastNight} hrs), and caffeine. ${heartRate > 75 ? "Elevated heart rate suggests elevated stress or poor recovery." : "Heart rate is in a relaxed range."} ${sleepHoursLastNight < 6 ? "Short sleep can raise stress." : ""}`.trim();
  return { level, insight };
}

app.post("/api/analyze", async (req, res) => {
  try {
    const {
      melatoninLevel,
      heartRate,
      sleepHoursLastNight,
      bedTime,
      wakeTime,
      age,
      caffeineAfternoon,
    } = req.body;

    const prompt = `You are a sleep and circadian rhythm expert. Analyze this user data and respond in valid JSON only, no markdown or extra text.

User data (no stress level given - you must infer it):
- Melatonin level: ${melatoninLevel} pg/mL (picograms per milliliter, typical range ~0-100)
- Resting heart rate: ${heartRate} bpm
- Sleep last night: ${sleepHoursLastNight} hours (bed: ${bedTime}, wake: ${wakeTime})
- Age: ${age || "not provided"}
- Caffeine after 2pm: ${caffeineAfternoon ?? "not provided"}

You MUST infer and return stress level (1-10) from: elevated heart rate, short or fragmented sleep, late/irregular schedule, caffeine, age, and melatonin. 1 = very relaxed, 10 = very stressed. Always include stressLevelDetected and stressInsight.

Give 3 recommendations. Each recommendation must be 2-4 sentences: explain why it matters for their data, then what to do and how. Be specific to their melatonin, heart rate, sleep amount, and schedule. Escape any double quotes inside strings with backslash.

Respond with this exact JSON structure (use double quotes, escape any quotes in strings):
{
  "needsMoreSleep": true or false,
  "confidence": "high" or "medium" or "low",
  "sleepVerdict": "One short sentence: do they need more sleep?",
  "qualityScore": number 1-100,
  "stressLevelDetected": number 1-10,
  "stressInsight": "One or two sentences explaining why you inferred this stress level from their metrics",
  "recommendations": ["Full first recommendation paragraph here.", "Full second recommendation paragraph here.", "Full third recommendation paragraph here."],
  "idealBedtime": "HH:MM format suggestion",
  "idealWakeTime": "HH:MM format suggestion",
  "circadianInsight": "One paragraph on their circadian/melatonin timing",
  "heartRateInsight": "One sentence on what their HR suggests for recovery",
  "sleepDebtNote": "One sentence on sleep debt if relevant"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You respond only with valid JSON. No markdown code blocks, no explanation outside the JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, "").trim();
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      data = {
        needsMoreSleep: true,
        confidence: "low",
        sleepVerdict: "Unable to parse detailed analysis. Consider getting more sleep and re-checking your metrics.",
        qualityScore: 50,
        recommendations: ["Ensure 7–9 hours of sleep.", "Keep a consistent sleep schedule.", "Limit caffeine after 2pm."],
        idealBedtime: "22:30",
        idealWakeTime: "06:30",
        circadianInsight: "Consistent bed and wake times help align melatonin with your schedule.",
        heartRateInsight: "Resting heart rate can reflect recovery; lower often indicates better rest.",
        sleepDebtNote: "Try to catch up gradually with slightly earlier bedtimes.",
      };
    }

    // Always set a number 1-10 for stress (OpenAI + fallback calculation)
    const calculatedStress = calculateStressLevel({
      heartRate: Number(heartRate) || 70,
      sleepHoursLastNight: Number(sleepHoursLastNight) || 7,
      caffeineAfternoon: caffeineAfternoon || "no",
      melatoninLevel: Number(melatoninLevel) || 20,
    });
    const aiStress = Number(data.stressLevelDetected);
    const validAi = !Number.isNaN(aiStress) && aiStress >= 1 && aiStress <= 10;
    data.stressLevelDetected = validAi ? Math.round(aiStress) : calculatedStress.level;
    data.stressInsight = data.stressInsight || calculatedStress.insight;

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Analysis failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
