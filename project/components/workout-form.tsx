"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkoutResult } from "@/components/workout-result";
import { useToast } from "@/hooks/use-toast";
import { mockWorkoutResponse, type WorkoutRecommendation } from "@/lib/mock-data";

// Keep these limits and options in sync with NUMERIC_FIELDS / CATEGORICAL_FIELDS in ml-api/app.py
const formSchema = z.object({
  age: z.coerce.number().int().min(16, "Age must be at least 16").max(90, "Age must be at most 90"),
  gender: z.enum(["Male", "Female", "Non-binary"], { required_error: "Please select your gender" }),
  weight: z.coerce.number().min(30, "Weight must be at least 30kg").max(250, "Weight must be at most 250kg"),
  height: z.coerce.number().min(120, "Height must be at least 120cm").max(250, "Height must be at most 250cm"),
  experience_level: z.enum(["Beginner", "Intermediate", "Advanced", "Professional"], { required_error: "Please select your experience level" }),
  target_calories: z.coerce.number().min(100, "Target calories must be at least 100").max(1500, "Target calories must be at most 1500"),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkoutForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutRecommendation | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      experience_level: undefined,
      target_calories: undefined,
    },
  });

  async function fetchRecommendation(values: FormValues): Promise<WorkoutRecommendation> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      if (process.env.NODE_ENV === "development") {
        console.warn("NEXT_PUBLIC_API_URL is not set; using mock workout data.");
        return mockWorkoutResponse;
      }
      throw new Error("The recommendation service is not configured.");
    }

    const response = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error ?? `Request failed with status ${response.status}`);
    }
    return data;
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      setWorkoutData(null);

      setWorkoutData(await fetchRecommendation(values));

      toast({
        title: "Success!",
        description: "Your personalized workout has been generated",
      });
    } catch (error) {
      console.error("Error fetching workout recommendation:", error);
      toast({
        title: "Couldn't get a recommendation",
        description:
          error instanceof TypeError
            ? "Could not reach the recommendation service. Please try again in a moment."
            : error instanceof Error
              ? error.message
              : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your age" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your weight in kg" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your height in cm" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Calories to Burn</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter target calories" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Workout Plan...
              </>
            ) : (
              "Get Workout Recommendation"
            )}
          </Button>
        </form>
      </Form>

      {workoutData && <WorkoutResult data={workoutData} />}
    </div>
  );
}