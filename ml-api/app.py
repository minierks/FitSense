import json
import logging
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DEFAULT_ORIGINS = [
    "https://fit-sense-ai-kappa.vercel.app",
    "https://fit-sense-ai-git-main-aniketchaurasia97s-projects.vercel.app",
    "https://fit-sense-hlvb9409j-aniketchaurasia97s-projects.vercel.app",
    "http://localhost:3000",
]
# Comma-separated override, e.g. ALLOWED_ORIGINS="https://a.app,https://b.app"
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()
] or DEFAULT_ORIGINS

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS)

MODEL_VERSION = "calorie-rate-v1"

# Trained in FitInsights/ImprovedModel.ipynb (paths relative to this file so the app can start from any cwd).
# The pipeline predicts calories burned per minute for a user profile + workout type.
calorie_rate_model = joblib.load(os.path.join(BASE_DIR, "fitinsight_calorie_rate_model.joblib"))
with open(os.path.join(BASE_DIR, "workout_profiles.json")) as f:
    workout_profiles = json.load(f)

WORKOUT_INTENSITY = workout_profiles["intensity"]
TYPICAL_MINUTES = workout_profiles["typical_minutes"]
HIGH_INTENSITY_THRESHOLD = workout_profiles["high_intensity_threshold"]
MAX_MINUTES_OBSERVED = workout_profiles["max_minutes_observed"]
TOP_N = 3

# Ranges match the zod schema in project/components/workout-form.tsx. The categories are
# everything the model was trained on; the form may offer a subset.
NUMERIC_FIELDS = {
    "age": (16, 90),
    "weight": (30, 250),
    "height": (120, 250),
    "target_calories": (100, 1500),
}
CATEGORICAL_FIELDS = {
    "gender": ("Male", "Female", "Non-binary"),
    "experience_level": ("Beginner", "Intermediate", "Advanced", "Professional"),
}


class ValidationError(ValueError):
    pass


def parse_input(data):
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object")

    missing = [f for f in (*NUMERIC_FIELDS, *CATEGORICAL_FIELDS) if data.get(f) in (None, "")]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}")

    values = {}
    for field, (low, high) in NUMERIC_FIELDS.items():
        raw = data[field]
        if isinstance(raw, bool):
            raise ValidationError(f"'{field}' must be a number")
        try:
            value = float(raw)
        except (TypeError, ValueError):
            raise ValidationError(f"'{field}' must be a number")
        if not low <= value <= high:
            raise ValidationError(f"'{field}' must be between {low} and {high}")
        values[field] = value
    if not values["age"].is_integer():
        raise ValidationError("'age' must be a whole number")
    values["age"] = int(values["age"])

    for field, allowed in CATEGORICAL_FIELDS.items():
        if data[field] not in allowed:
            raise ValidationError(f"'{field}' must be one of: {', '.join(allowed)}")
        values[field] = data[field]

    return values


def get_bmi(weight, height_cm):
    height_m = height_cm / 100
    return weight / (height_m ** 2)

def get_bmi_category(bmi):
    if bmi < 18.5:
        return 'Underweight'
    elif bmi < 25:
        return 'Normal'
    elif bmi < 30:
        return 'Overweight'
    else:
        return 'Obese'

def get_intensity_label(intensity):
    if intensity >= HIGH_INTENSITY_THRESHOLD:
        return 'High'
    elif intensity >= 0.70:
        return 'Moderate'
    return 'Low'

def recommend_workouts(age, gender, weight, bmi, experience_level, target_calories, top_n=TOP_N):
    """Score every workout type and return the top_n whose required time is closest
    to the usual session length for the user's experience level."""
    candidates = pd.DataFrame({
        'Age': age,
        'Gender': gender,
        'Weight_kg': weight,
        'BMI': bmi,
        'Experience_Level': experience_level,
        'Workout_Type': sorted(WORKOUT_INTENSITY),
    })
    # Floor the rate so an odd prediction can never cause a divide-by-zero or absurd duration
    candidates['calories_per_min'] = calorie_rate_model.predict(candidates)
    candidates['calories_per_min'] = candidates['calories_per_min'].clip(lower=1.0)
    candidates['minutes'] = target_calories / candidates['calories_per_min']
    candidates['intensity'] = candidates['Workout_Type'].map(WORKOUT_INTENSITY)

    # Safety rule from domain knowledge (not learned from data): no very high-intensity workouts for beginners
    if experience_level == 'Beginner':
        candidates = candidates[candidates['intensity'] < HIGH_INTENSITY_THRESHOLD]

    usual_minutes = TYPICAL_MINUTES[experience_level]
    candidates['distance_from_usual'] = (candidates['minutes'] - usual_minutes).abs()
    best = candidates.nsmallest(top_n, 'distance_from_usual')

    recommendations = []
    for row in best.itertuples():
        duration = max(1, int(round(row.minutes)))
        recommendations.append({
            'workout': row.Workout_Type,
            'duration_minutes': duration,
            'calories_per_minute': round(float(row.calories_per_min), 1),
            'expected_calorie_burn': int(round(row.calories_per_min * duration)),
            'intensity': get_intensity_label(row.intensity),
        })
    return recommendations

def build_response(age, gender, weight, bmi, experience_level, target_calories):
    recommendations = recommend_workouts(age, gender, weight, bmi, experience_level, target_calories)
    top = recommendations[0]

    result = {
        # Top-level fields describe the best recommendation (kept for existing clients)
        'recommended_workout': top['workout'],
        'recommended_duration': top['duration_minutes'],
        'expected_calorie_burn': top['expected_calorie_burn'],
        'recommendations': recommendations,
        'bmi': round(bmi, 1),
        'bmi_category': get_bmi_category(bmi),
        'model_version': MODEL_VERSION,
    }
    if top['duration_minutes'] > MAX_MINUTES_OBSERVED:
        result['warning'] = (
            f"Burning {int(target_calories)} kcal needs about {top['duration_minutes']} minutes, "
            f"longer than any session in our data (~{int(MAX_MINUTES_OBSERVED)} min). "
            "Consider splitting it into two sessions or lowering the target."
        )
    return result

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_version": MODEL_VERSION})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        values = parse_input(request.get_json(silent=True))
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    bmi = get_bmi(values['weight'], values['height'])

    try:
        result = build_response(
            values['age'], values['gender'], values['weight'], bmi,
            values['experience_level'], values['target_calories'],
        )
    except Exception:
        logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed. Please try again later."}), 500

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
