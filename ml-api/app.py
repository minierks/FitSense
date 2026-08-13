from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app, origins=["https://fit-sense-ai-kappa.vercel.app","https://fit-sense-ai-git-main-aniketchaurasia97s-projects.vercel.app","https://fit-sense-hlvb9409j-aniketchaurasia97s-projects.vercel.app", "http://localhost:3000"])

# Load trained models
best_workout_classifier = joblib.load("fitinsight_workout_model.joblib")
duration_regressor = joblib.load("fitinsight_seesion_model.joblib")

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

def recommend_workout(age, gender, weight, bmi, experience_level, target_calories):
    user_data = pd.DataFrame({
        'Age': [age],
        'Gender': [gender],
        'Weight_kg': [weight],
        'BMI': [bmi],
        'BMI_Category': [get_bmi_category(bmi)],
        'Experience_Level': [experience_level],
        'Calories_Burned': [target_calories],
    })

    workout_type = best_workout_classifier.predict(user_data)[0]
    session_duration = duration_regressor.predict(user_data)[0]

    return {
        'recommended_workout': workout_type,
        'recommended_duration': round(session_duration),
        'expected_calorie_burn': target_calories
    }

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        age = int(data['age'])
        gender = data['gender']
        weight = float(data['weight'])
        height = float(data['height'])
        experience_level = data['experience_level']
        target_calories = float(data['target_calories'])

        bmi = get_bmi(weight, height)

        result = recommend_workout(
            age, gender, weight, bmi, experience_level, target_calories
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
