# Workout Recommendation API

A Flask-based API that recommends a workout type and duration based on user data.

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
