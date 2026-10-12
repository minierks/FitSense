export type Intensity = "Low" | "Moderate" | "High";

// One ranked option from the API's `recommendations` list
export interface WorkoutOption {
  workout: string;
  duration_minutes: number;
  calories_per_minute: number;
  expected_calorie_burn: number;
  intensity: Intensity;
}

// Shape of the response returned by the ML API's POST /predict endpoint (ml-api/app.py)
export interface WorkoutRecommendation {
  // Top-level fields repeat the best option (kept for older clients)
  recommended_workout: string;
  recommended_duration: number;
  expected_calorie_burn: number;
  // Missing when talking to an API deployed before the calorie-rate model
  recommendations?: WorkoutOption[];
  bmi: number;
  bmi_category: "Underweight" | "Normal" | "Overweight" | "Obese";
  model_version?: string;
  // Present when even the best option needs a longer session than the training data covers
  warning?: string;
}

// Sample response used in development when NEXT_PUBLIC_API_URL is not set,
// so the UI can be worked on without running the Flask API.
export const mockWorkoutResponse: WorkoutRecommendation = {
  recommended_workout: "Walking",
  recommended_duration: 50,
  expected_calorie_burn: 302,
  recommendations: [
    { workout: "Walking", duration_minutes: 50, calories_per_minute: 6.0, expected_calorie_burn: 302, intensity: "Low" },
    { workout: "Aerobics", duration_minutes: 37, calories_per_minute: 8.1, expected_calorie_burn: 298, intensity: "Moderate" },
    { workout: "Boxing", duration_minutes: 37, calories_per_minute: 8.1, expected_calorie_burn: 299, intensity: "Moderate" },
  ],
  bmi: 22.9,
  bmi_category: "Normal",
  model_version: "calorie-rate-v1",
};
