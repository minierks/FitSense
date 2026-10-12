# FitSense-AI — Deployed Workout Recommendation App

**FitSense-AI** is the production, user‑facing side of the FitSense ecosystem. It is a full‑stack web application that serves the machine‑learning models trained in [FitInsights](../FitInsights/readme.md) as a live API, wrapped in a modern Next.js frontend, so anyone can get a personalized workout recommendation in real time.

> Live app CORS origins configured in the API (`ml-api/app.py`) point to `fit-sense-ai-kappa.vercel.app` — the frontend is deployed on Vercel.

---

## 1. Real‑Life Problem

Many people struggle to find a workout that matches their body type, fitness goals, and experience level. Generic, one‑size‑fits‑all plans can be inefficient or even lead to injury. FitSense‑AI addresses this by using a trained ML model to generate a **customized workout type and session duration** from a handful of simple inputs.

## 2. Objectives

- **Ob_1:** Collect fitness‑related inputs from users (age, gender, weight, height, experience, calorie goal).
- **Ob_2:** Use the trained ML models to analyze the input and generate a tailored recommendation.
- **Ob_3:** Display the recommended workout, duration, and expected calorie burn.
- **Ob_4:** Provide a clean, responsive, interactive UI.
- **Ob_5:** Help users plan workouts aligned with their personal health goals.

---

## 3. Architecture

FitSense is a two‑service application: a **Next.js frontend** and a **Flask ML inference API**, connected over HTTP.

```
┌─────────────────────────┐        POST /predict         ┌──────────────────────────────┐
│   project/  (Next.js)    │ ───────────────────────────► │   ml-api/  (Flask + CORS)     │
│                          │   { age, gender, weight,     │                               │
│  WorkoutForm (react-     │     height, experience_level,│  1. Compute BMI + category    │
│  hook-form + zod)        │     target_calories }        │  2. Build feature DataFrame   │
│         │                │                               │  3. Run through both loaded   │
│         ▼                │ ◄─────────────────────────── │     sklearn pipelines         │
│  WorkoutResult (renders  │   { recommended_workout,     │  4. Return JSON prediction    │
│  recommendation + charts)│     recommended_duration,    │                               │
│                          │     expected_calorie_burn }  │  fitinsight_workout_model     │
└─────────────────────────┘                               │  fitinsight_seesion_model     │
                                                             │  (.joblib, trained in         │
                                                             │   FitInsights)                │
                                                             └──────────────────────────────┘
```

The **models themselves are not trained here** — they are trained and exported in [FitInsights](../FitInsights/readme.md) and copied into `ml-api/` as `.joblib` files. This app is purely the **serving/inference layer**.

---

## 4. Repository Structure

```
FitSense/
├── README.md                # this file
├── project/                 # Next.js (TypeScript) frontend
│   ├── app/                 # App Router pages (layout.tsx, page.tsx, globals.css)
│   ├── components/          # UI components
│   │   ├── header.tsx, footer.tsx, hero-section.tsx, features-section.tsx
│   │   ├── workout-form-section.tsx, workout-form.tsx, workout-result.tsx
│   │   ├── theme-provider.tsx, theme-toggle.tsx
│   │   └── ui/               # shadcn/ui + Radix UI primitives (button, card, form, select, ...)
│   ├── hooks/                # use-toast.ts
│   ├── lib/                  # mock-data.ts (fallback data), utils.ts
│   └── package.json
└── ml-api/                  # Flask backend (ML inference API)
    ├── app.py                # Flask app, /predict endpoint
    ├── requirements.txt
    ├── readme.md
    ├── fitinsight_workout_model.joblib   # trained RandomForestClassifier pipeline
    └── fitinsight_seesion_model.joblib   # trained RandomForestRegressor pipeline
```

---

## 5. Tech Stack

**Frontend (`project/`)**
- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS + `tailwindcss-animate`
- **Components:** shadcn/ui built on Radix UI primitives (accordion, dialog, select, tabs, toast, etc.)
- **Forms & validation:** `react-hook-form` + `zod` (`@hookform/resolvers`)
- **Charts:** `recharts`
- **Theming:** `next-themes`
- **Hosting:** Vercel

**Backend (`ml-api/`)**
- **Framework:** Flask + `flask-cors`
- **ML/Data:** `pandas`, `scikit-learn`, `joblib`
- **Serving:** loads two pre‑trained `sklearn` pipelines at startup and exposes a single `/predict` endpoint

---

## 6. API Contract

### `POST /predict`

**Request body (JSON):**

```json
{
  "age": 25,
  "gender": "Male",
  "weight": 70,
  "height": 175,
  "experience_level": "Intermediate",
  "target_calories": 300
}
```

| Field | Type | Constraints (enforced client‑side via `zod` and server‑side in `app.py`) |
|---|---|---|
| `age` | int | 16–90 |
| `gender` | string | `"Male"` \| `"Female"` |
| `weight` | float (kg) | 30–250 |
| `height` | float (cm) | 120–250 |
| `experience_level` | string | `"Beginner"` \| `"Intermediate"` \| `"Advanced"` |
| `target_calories` | float | 100–1500 |

**Server‑side processing (`ml-api/app.py`):**
1. Computes `BMI = weight / (height_m ** 2)`.
2. Buckets BMI into `BMI_Category` (`Underweight` / `Normal` / `Overweight` / `Obese`).
3. Assembles a single‑row `pandas.DataFrame` with `Age, Gender, Weight_kg, BMI, BMI_Category, Experience_Level, Calories_Burned`.
4. Runs it through `fitinsight_workout_model.joblib` (classifier) → `recommended_workout`.
5. Runs it through `fitinsight_seesion_model.joblib` (regressor) → `recommended_duration`.

**Response body (JSON):**

```json
{
  "recommended_workout": "Cycling",
  "recommended_duration": 44,
  "expected_calorie_burn": 300.0,
  "bmi": 22.9,
  "bmi_category": "Normal"
}
```

Errors: missing or invalid fields return HTTP `400` with a specific message, e.g. `{"error": "'age' must be between 16 and 90"}`. An unexpected model failure returns `500` with a generic message (details are logged server‑side, not leaked to the client).

### `GET /health`

Returns `{"status": "ok"}` — use it for uptime checks / platform health probes.

---

## 7. How to Run Locally

You need **two terminals** — one for the backend, one for the frontend.

### 7.1 Backend — `ml-api/` (Flask)

```bash
cd FitSense/ml-api

# create & activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# run the API (starts on http://localhost:5001)
python app.py
```

> Port 5001 is the local default because macOS's AirPlay Receiver occupies port 5000 and answers with `403`. Set `PORT` to override.

The models (`fitinsight_workout_model.joblib`, `fitinsight_seesion_model.joblib`) are loaded from the same folder at startup — they are already committed in this repo, so no extra training step is required to run the API. (Retrain and regenerate them via [FitInsights](../FitInsights/readme.md) if you want updated models.)

Run the test suite:

```bash
pip install -r requirements-dev.txt
pytest
```

Or call it directly:

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":25,"gender":"Male","weight":70,"height":175,"experience_level":"Intermediate","target_calories":300}'
```

### 7.2 Frontend — `project/` (Next.js)

```bash
cd FitSense/project

npm install

# point the frontend at your local backend
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:5001

npm run dev
```

Open **http://localhost:3000**, fill in the workout form, and submit — it calls the local Flask API and renders the recommendation.

> If `NEXT_PUBLIC_API_URL` is not set, the dev server returns the sample response from `lib/mock-data.ts` so you can work on the UI without the API. Production builds show an error instead.
>
> On **Node 25+**, `npm run dev` fails with `localStorage.getItem is not a function`. Use Node 20/22 LTS, or run `NODE_OPTIONS=--no-experimental-webstorage npm run dev`.

---

## 8. Deployment

- **Frontend:** deployed to **Vercel** (production + preview URLs are whitelisted in the backend's CORS config: `fit-sense-ai-kappa.vercel.app`, plus per‑branch/preview Vercel URLs, and `http://localhost:3000` for local dev).
- **Backend:** run with gunicorn on any standard Python host (e.g. Render/Railway/Fly.io/EC2): `gunicorn -b 0.0.0.0:$PORT app:app`. Point `NEXT_PUBLIC_API_URL` on the frontend at that host's public URL.
- **CORS:** explicitly restricted (`flask-cors`) to the known frontend origins listed above, plus localhost for development. Override with a comma‑separated `ALLOWED_ORIGINS` env var (e.g. for a new Vercel preview URL) without editing code.
- **Model/library versions:** the `.joblib` files were pickled with scikit‑learn **1.4.2**. Newer versions still load them, with an `InconsistentVersionWarning`. To remove that risk, retrain in FitInsights against the scikit‑learn version you deploy, or pin `scikit-learn==1.4.2` on a Python version it supports (≤ 3.12).

---

## 9. How This Is Beneficial for the Data Science Project

FitSense is what turns FitInsights from a set of notebooks into a **usable, evaluable product** — closing the loop of the data science lifecycle:

- **Model productionization:** the exact `sklearn` `Pipeline` objects trained in FitInsights (preprocessing + model bundled together) are serialized once with `joblib` and loaded as‑is in production, so there is **zero train/serve skew** — the transformation logic never has to be reimplemented by hand in the API.
- **Real inference, real feedback:** instead of static notebook predictions on a held‑out test set, FitSense exposes the models as a live, callable service — the natural next step for validating a model against real, unseen user inputs.
- **End‑to‑end MLOps demonstration:** the two‑repo split (FitInsights = training/experimentation, FitSense = serving/product) mirrors how ML systems are structured in industry — a clean separation between the offline pipeline that produces model artifacts and the online service that consumes them.
- **Full‑stack framing for a DS project:** pairing a Flask inference API with a modern TypeScript/Next.js frontend shows the models aren't just accurate on paper — they're integrated into an interactive product with input validation, error handling, and a real UI, which is what stakeholders actually see and use.
- **Foundation for iteration:** because inference is decoupled behind `NEXT_PUBLIC_API_URL` and the models are just files the API loads, retraining in FitInsights and dropping in new `.joblib` files is enough to upgrade the live product without touching the frontend.

---

## 10. Request‑Time Data Flow ("Online ETL")

FitInsights' ETL pipeline (see its [README](../FitInsights/readme.md#5-etl-pipeline)) is a **batch** process that cleans historical data and engineers features to train the models. FitSense performs the equivalent transformation **per‑request, in real time**, on a single user's input instead of a full dataset:

```
Frontend form input                Backend (/predict)
────────────────────                ──────────────────
{ age, gender, weight,     ──►      Extract  : parse & type-cast JSON body
  height, experience_level,          │
  target_calories }                  Transform: compute BMI, derive BMI_Category
                                      │          (same feature-engineering formula
                                      │           used in FitInsights)
                                      ▼
                                     Load     : build 1-row DataFrame → feed into the
                                                two pre-trained sklearn pipelines
                                      │
{ recommended_workout,     ◄──      Return   : JSON response back to the browser
  recommended_duration,
  expected_calorie_burn }
```

This keeps the feature logic (BMI/BMI_Category derivation) consistent with what the models were trained on in FitInsights, just applied to one row at request time instead of a full CSV in batch.

---

## 11. Deliverables

- ✅ Source code (frontend + backend)
- 🌐 Deployed web application (Vercel)
- 🧠 Trained ML models for workout & duration recommendation (from FitInsights)
- 📄 Documentation (this README + [`ml-api/readme.md`](ml-api/readme.md))
- 👤 Interactive user console/UI

## 12. Possible Future Improvements

- Add authentication + persisted user history so recommendations can improve over time.
- Add a feedback loop (users rate recommendations) to collect labeled data for retraining in FitInsights.
- Containerize `ml-api/` (Dockerfile) for more portable deployment.
- Add automated tests for the frontend form validation (the `/predict` endpoint is covered in `ml-api/tests/`).
- Retrain/re‑export the models with a pinned scikit‑learn version and record it alongside the `.joblib` files.
