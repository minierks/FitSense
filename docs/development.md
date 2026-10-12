# Development Guide

How to run FitSense-AI on your own machine, run the tests, and check changes before deploying.

## Requirements

| Tool | Version |
|---|---|
| Python | 3.11 or newer (scikit-learn 1.9.1 needs it) |
| Node.js | 20 or 22 LTS recommended. Node 25 works with the flag shown below. |
| npm | comes with Node |

---

## 1. API (`ml-api/`)

### Setup

```bash
cd ml-api
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
```

### Run the tests

```bash
pytest -v
```

All 32 tests should pass. They cover:

- `/health` and the response format of `/predict`
- the top-3 recommendations: unique workouts, valid intensity labels, `duration = sessions × minutes_per_session`
- beginners never getting HIIT or CrossFit
- the 800 kcal limit and splitting of long plans
- single-session plans ranking before split plans
- input validation: ranges, types, allowed categories, missing fields, non-JSON body
- BMI calculation and categories

### Start the API

```bash
python app.py        # http://localhost:5001  (set PORT to change)
```

Port 5001 is the default because macOS uses port 5000 for AirPlay.

### Try it by hand

```bash
# Health
curl http://localhost:5001/health

# Normal request
curl -s -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":25,"gender":"Male","weight":70,"height":175,"experience_level":"Intermediate","target_calories":300}' \
  | python3 -m json.tool

# 800 kcal beginner → plans split into 2 sessions
curl -s -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":25,"gender":"Male","weight":70,"height":175,"experience_level":"Beginner","target_calories":800}' \
  | python3 -m json.tool

# Invalid input → HTTP 400
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":25,"gender":"Male","weight":70,"height":175,"experience_level":"Intermediate","target_calories":900}'
```

---

## 2. Website (`project/`)

### Setup

```bash
cd project
npm install
cp .env.example .env.local     # contains NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Start the dev server

```bash
npm run dev
# On Node 25 or newer:
NODE_OPTIONS=--no-experimental-webstorage npm run dev
```

Open http://localhost:3000.

On Node 25, `npm run dev` crashes with `localStorage.getItem is not a function`. Node 25 adds an incomplete built-in `localStorage` that breaks the Next.js dev server; the flag turns it off. Vercel isn't affected.

If `NEXT_PUBLIC_API_URL` isn't set, the dev server uses the sample response in `lib/mock-data.ts`, so you can work on the UI without the API. A production build shows an error instead.

### Check types and build

```bash
npx tsc --noEmit
npm run build                  # static export into out/
```

### Test the production build locally

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001 npm run build
python3 -m http.server 3000 --directory out
```

---

## 3. Manual test checklist

Run both servers, open http://localhost:3000 and check:

| Input | Expected |
|---|---|
| 25, Male, 70 kg, 175 cm, Intermediate, 300 kcal | "Best match" Walking 50 min, plus Aerobics and Boxing under "Other good options" |
| Same, Beginner, 800 kcal | All three plans shown as `2 × 37 min` / `2 × 38 min`; no HIIT or CrossFit |
| Target 900 kcal | Form error "Target calories must be at most 800 per session"; nothing is sent |
| Age 10 | Form error under Age |
| Non-binary / Professional | Accepted, results shown |
| Stop the API, submit | Red toast "Could not reach the recommendation service" |
| Narrow the window to phone width | Cards stack; no horizontal scrolling |
| Share | Opens the share sheet or copies the text |

---

## 4. Keeping both sides in sync

The same limits exist in two places, and **both must change together**:

| Rule | API (`ml-api/app.py`) | Website (`project/components/workout-form.tsx`) |
|---|---|---|
| Numeric ranges (age, weight, height, target calories) | `NUMERIC_FIELDS` | `formSchema` (zod) |
| Allowed genders / experience levels | `CATEGORICAL_FIELDS` | `formSchema` + the `<SelectItem>` options |
| Response shape | `recommend_workouts()`, `build_response()` | `WorkoutRecommendation` / `WorkoutOption` in `lib/mock-data.ts` |

The recommendation rules in `app.py` are also duplicated in `FitInsights/ImprovedModel.ipynb` (section 4). Update both when changing them.

---

## 5. Changing the model

See [model.md → Retraining](model.md#8-retraining-and-updating-the-api).
