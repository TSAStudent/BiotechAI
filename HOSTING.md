# Hosting BiotechAI Sleep on Vercel

You can host both the **frontend** and the **API** on Vercel. The API runs as a serverless function.

---

## 1. Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is enough)
- Your project in a **Git repository** (GitHub, GitLab, or Bitbucket)

---

## 2. Push your code to GitHub

If you haven’t already:

```bash
cd "c:\Users\Surya\OneDrive\Documents\MERN\BiotechAI"
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

(Do **not** commit `server/.env` — it’s in `.gitignore`. You’ll add the API key in Vercel.)

---

## 3. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. **Import** your Git repository (e.g. the BiotechAI repo).
4. Leave the default settings:
   - **Framework Preset:** Other
   - **Root Directory:** (leave blank)
   - **Build Command / Output / Install:** will be taken from `vercel.json` in the repo.

5. Before deploying, open **Environment Variables** and add:

   | Name             | Value                    | Environment   |
   |------------------|--------------------------|---------------|
   | `OPENAI_API_KEY` | Your OpenAI API key      | Production (and Preview if you want) |

6. Click **Deploy**.

---

## 4. After deploy

- Your app will be at: **`https://YOUR_PROJECT.vercel.app`**
- The frontend is served from the root.
- The **Analyze** button calls **`/api/analyze`**, which runs the serverless function in `api/analyze.js`.

No need to run a separate backend server; Vercel runs the API for you.

---

## 5. Optional: custom domain

In the Vercel project: **Settings** → **Domains** → add your domain and follow the DNS instructions.

---

## 6. Local vs Vercel

| Local (`npm run dev`)        | Vercel (production)              |
|-----------------------------|----------------------------------|
| Frontend: `http://localhost:5173` | `https://YOUR_PROJECT.vercel.app` |
| Backend: `http://localhost:3001`  | `https://YOUR_PROJECT.vercel.app/api/analyze` (serverless) |
| API key in `server/.env`     | API key in Vercel env var `OPENAI_API_KEY` |

The repo includes both:

- **`server/`** – for local dev with Express.
- **`api/analyze.js`** – same logic for Vercel’s serverless so the app works when hosted.

If you hit any deploy errors (e.g. build or env), check the **Deployments** tab and the build logs in Vercel.
