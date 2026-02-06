# BiotechAI Sleep

AI-powered sleep analysis based on **melatonin levels** and **heart rate**, with circadian insights and personalized recommendations.

## Features

- **Melatonin & heart rate input** – Enter your relative melatonin level (1–10) and resting heart rate for a quick assessment.
- **Sleep need verdict** – AI tells you whether you need more sleep and with what confidence.
- **Sleep quality score** – A 1–100 score based on your inputs and last night’s sleep.
- **Recommendations** – Actionable tips (schedule, light, caffeine, etc.).
- **Ideal schedule** – Suggested bedtime and wake time.
- **Circadian insight** – Short explanation of your melatonin/circadian timing.
- **Heart rate & recovery** – What your HR suggests about recovery.
- **Sleep debt note** – When relevant, a note on sleep debt and how to improve.

Extra inputs (optional): sleep duration, bed/wake times, age, stress level, caffeine after 2pm.

## Setup

1. **Install dependencies** (root + server + client):

   ```bash
   npm run install:all
   ```

   Or manually:

   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **API key** – Your OpenAI API key is in `server/.env`.  
   **Important:** Never commit `.env` or share your key. If you shared it elsewhere, rotate it in the [OpenAI dashboard](https://platform.openai.com/api-keys).

3. **Run the app** (from project root):

   ```bash
   npm run dev
   ```

   This starts:
   - **Backend** at `http://localhost:3001`
   - **Frontend** at `http://localhost:5173` (proxies `/api` to the backend)

   Or run them separately:

   ```bash
   npm run server   # terminal 1
   npm run client   # terminal 2
   ```

4. Open **http://localhost:5173** in your browser and use the form to get your sleep analysis.

## Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** OpenAI API (GPT-4o-mini)

## Disclaimer

This app is for general guidance only and is not medical advice. Always consult a healthcare provider for sleep or health concerns.
