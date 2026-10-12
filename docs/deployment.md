# Deployment Guide

FitSense-AI runs as two separately hosted parts:

| Part | Host | Live URL |
|---|---|---|
| API (`ml-api/`) | Railway | https://fitsense-api-production.up.railway.app |
| Website (`project/`) | Vercel | https://fitsense-pi.vercel.app |

Both are deployed from a local folder with each host's command-line tool, so no Git connection is required.

**Always deploy the API first.** The website may send values (e.g. `Professional`) or expect fields (`recommendations`, `sessions`) that an older API doesn't have.

---

## 1. API on Railway

### First deployment

```bash
brew install railway            # or: npm install -g @railway/cli
railway login

cd ml-api
railway init                    # create a project, e.g. "fitsense-api"
railway up                      # upload and deploy this folder
railway domain                  # create the public URL
```

Railway reads these files in `ml-api/`:

| File | Purpose |
|---|---|
| `requirements.txt` | Python dependencies (scikit-learn pinned to 1.9.1 to match the saved model) |
| `.python-version` | Python 3.13 |
| `Procfile` | Start command: `gunicorn -b 0.0.0.0:$PORT app:app` |
| `fitinsight_calorie_rate_model.joblib`, `workout_profiles.json` | Model files loaded at startup |

### Environment variables

| Variable | Value | Why |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://fitsense-pi.vercel.app,http://localhost:3000` | Browsers may only call the API from these sites (CORS). Comma-separated, exact URLs, no trailing `/`. |
| `PORT` | set by Railway | gunicorn listens on it |

```bash
railway variables --set "ALLOWED_ORIGINS=https://fitsense-pi.vercel.app,http://localhost:3000"
```

If `ALLOWED_ORIGINS` isn't set, the API falls back to a built-in list in `app.py` that only covers the older deployments.

### Check

```bash
curl https://fitsense-api-production.up.railway.app/health
# {"model_version":"calorie-rate-v1","status":"ok"}
```

---

## 2. Website on Vercel

### First deployment

```bash
cd project
npx vercel login
npx vercel                      # answer the setup questions (below)
npx vercel env add NEXT_PUBLIC_API_URL production
#   value: https://fitsense-api-production.up.railway.app   (no trailing /)
npx vercel --prod
```

Setup answers:

| Question | Answer |
|---|---|
| Set up and deploy? | Y |
| Link to existing project? | N |
| Project name | lowercase only, e.g. `fitsense` |
| Connect Git repository? | N (or Y once `main` holds the current code) |
| Code directory | `./` |
| Customize settings? | N (Next.js is detected) |

`.vercelignore` keeps `node_modules`, build output and `.env.local` from being uploaded.

### Important: the API URL is fixed at build time

`next.config.js` uses `output: 'export'`, so the site is plain static files and `NEXT_PUBLIC_API_URL` is written into them during the build. **After changing the variable, deploy again** (`npx vercel --prod`, or Redeploy in the dashboard).

### Next.js security updates

Vercel refuses to deploy Next.js versions with known vulnerabilities ("Vulnerable version of Next.js detected"). Update within the same major version, then rebuild:

```bash
npm install next@15     # latest patched 15.x
npx tsc --noEmit && npm run build
```

---

## 3. Updating a running deployment

After changing code:

```bash
cd ml-api  && pytest && railway up        # API first
cd ../project && npm run build && npx vercel --prod
```

Then check:

```bash
curl https://fitsense-api-production.up.railway.app/health
```

Then open https://fitsense-pi.vercel.app and submit the form once.

---

## 4. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Site shows "Could not reach the recommendation service"; browser console (F12) shows a **CORS** error | The site's URL isn't in `ALLOWED_ORIGINS` | Add the exact URL (with `https://`, no trailing `/`) to `ALLOWED_ORIGINS` on Railway |
| Same message, no CORS error | API is down or still starting | Check `/health` and the Railway logs |
| "The recommendation service is not configured" | `NEXT_PUBLIC_API_URL` was missing when the site was built | Set it on Vercel and redeploy |
| Site still shows old behaviour | Website or API not redeployed, or browser cache | Redeploy both; hard-refresh (Cmd+Shift+R) |
| Railway build fails installing scikit-learn | Python older than 3.11 | Keep `ml-api/.python-version` at 3.11+ |
| API fails at startup loading the model | scikit-learn version differs from the one that saved the model | Keep `scikit-learn==1.9.1`, or retrain with the new version |
| Vercel: "Vulnerable version of Next.js detected" | Outdated Next.js | See *Next.js security updates* above |
| Vercel: project name rejected | Uppercase letters | Use a lowercase name |
| Local `npm run dev` crashes with `localStorage.getItem is not a function` | Node 25 | `NODE_OPTIONS=--no-experimental-webstorage npm run dev` |

---

## 5. Costs and uptime

- **Vercel:** free for personal projects.
- **Railway:** starts with trial credit, then a paid plan. If the credit runs out, the API stops and the site shows "Could not reach the recommendation service". Check the Railway dashboard before demos.

## 6. Older deployments

`fit-sense-ai.vercel.app` and `fit-sense-ai-kappa.vercel.app` (with APIs on Render) run the first version of the project and are managed from other accounts. They are not updated by the steps above.
