// This file provides mock data for testing the workout recommendation feature
// It can be used during development when the API is not available

export const mockWorkoutResponse = {
  workout_name: "High-Intensity Interval Training",
  description: "A fast-paced workout designed to burn maximum calories while improving cardiovascular health and building endurance.",
  exercises: [
    {
      name: "Jump Squats",
      sets: 3,
      reps: 15,
      rest: 30
    },
    {
      name: "Push-ups",
      sets: 3,
      reps: 12,
      rest: 30
    },
    {
      name: "Burpees",
      sets: 3,
      reps: 10,
      rest: 45
    },
    {
      name: "Mountain Climbers",
      sets: 3,
      reps: 20,
      rest: 30
    },
    {
      name: "Jumping Lunges",
      sets: 3,
      reps: 16,
      rest: 45
    }
  ],
  duration: 35,
  intensity: "High",
  calories_burned: 350
};

// For beginners
export const mockBeginnerWorkout = {
  workout_name: "Beginner Full-Body Workout",
  description: "An introductory workout focused on developing proper form and building foundational strength.",
  exercises: [
    {
      name: "Bodyweight Squats",
      sets: 3,
      reps: 12,
      rest: 60
    },
    {
      name: "Knee Push-ups",
      sets: 3,
      reps: 10,
      rest: 60
    },
    {
      name: "Glute Bridges",
      sets: 3,
      reps: 15,
      rest: 45
    },
    {
      name: "Bird Dogs",
      sets: 3,
      reps: 10,
      rest: 30
    }
  ],
  duration: 30,
  intensity: "Low",
  calories_burned: 200
};

// For intermediate
export const mockIntermediateWorkout = {
  workout_name: "Intermediate Circuit Training",
  description: "A balanced routine that combines strength and cardio exercises to improve overall fitness.",
  exercises: [
    {
      name: "Dumbbell Lunges",
      sets: 3,
      reps: 12,
      rest: 45
    },
    {
      name: "Dumbbell Rows",
      sets: 3,
      reps: 12,
      rest: 45
    },
    {
      name: "Bicycle Crunches",
      sets: 3,
      reps: 20,
      rest: 30
    },
    {
      name: "Plank",
      sets: 3,
      reps: 45,
      rest: 30
    },
    {
      name: "Lateral Raises",
      sets: 3,
      reps: 12,
      rest: 45
    }
  ],
  duration: 40,
  intensity: "Medium",
  calories_burned: 300
};