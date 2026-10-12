# Workout Recommendation API

A Flask-based API that recommends workouts and session durations for a calorie target.

## How it works

The model (`fitinsight_calorie_rate_model.joblib`, trained in `FitInsights/ImprovedModel.ipynb`) predicts **calories burned per minute** for a user profile and a workout type (test R² ≈ 0.86). For each request the API:

1. Predicts the burn rate for all 14 workout types and computes `minutes = target_calories / rate`.
2. Skips HIIT and CrossFit for beginners (a safety rule, not learned from data).
3. Returns the 3 workouts whose required time is closest to the usual session length for the user's experience level (from `workout_profiles.json`).

`gender` accepts `Male`, `Female`, `Non-binary`; `experience_level` accepts `Beginner`, `Intermediate`, `Advanced`, `Professional`.

## How to use

Send a POST request to `/predict` with the following JSON body:

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

Response:

```json
{
  "recommended_workout": "Walking",
  "recommended_duration": 50,
  "expected_calorie_burn": 302,
  "recommendations": [
    {"workout": "Walking", "duration_minutes": 50, "calories_per_minute": 6.0, "expected_calorie_burn": 302, "intensity": "Low"},
    {"workout": "Aerobics", "duration_minutes": 37, "calories_per_minute": 8.1, "expected_calorie_burn": 298, "intensity": "Moderate"},
    {"workout": "Boxing", "duration_minutes": 37, "calories_per_minute": 8.1, "expected_calorie_burn": 299, "intensity": "Moderate"}
  ],
  "bmi": 22.9,
  "bmi_category": "Normal",
  "model_version": "calorie-rate-v1"
}
```

The top-level `recommended_*` and `expected_calorie_burn` fields repeat the first recommendation. If even that one needs a longer session than anything in the training data (~70 min), the response also includes a `warning` string.

Invalid input returns `400` with `{"error": "..."}`; an unexpected server error returns `500`. `GET /health` returns `{"status": "ok", "model_version": "calorie-rate-v1"}`.

## Run locally

```bash
pip install -r requirements-dev.txt
pytest                      # run the tests
python app.py               # http://localhost:5001 (set PORT to change)
```

In production, run `gunicorn -b 0.0.0.0:$PORT app:app`. Set `ALLOWED_ORIGINS` (comma-separated) to override the CORS allow-list.
