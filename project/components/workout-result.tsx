"use client";

import { AlertTriangle, Clock, Flame, Gauge, Scale, Share2, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Intensity, WorkoutOption, WorkoutRecommendation } from "@/lib/mock-data";

interface WorkoutResultProps {
  data: WorkoutRecommendation;
}

const bmiCategoryColor: Record<WorkoutRecommendation["bmi_category"], string> = {
  Underweight: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Normal: "bg-green-500/10 text-green-600 dark:text-green-400",
  Overweight: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Obese: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const intensityColor: Record<Intensity, string> = {
  Low: "bg-green-500/10 text-green-600 dark:text-green-400",
  Moderate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  High: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function IntensityBadge({ intensity }: { intensity: Intensity }) {
  return (
    <Badge variant="outline" className={`${intensityColor[intensity]} px-2 py-0.5 shrink-0`}>
      {intensity} intensity
    </Badge>
  );
}

function AlternativeCard({ option, rank }: { option: WorkoutOption; rank: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardDescription>Option {rank}</CardDescription>
            <CardTitle className="text-lg mt-1">{option.workout}</CardTitle>
          </div>
          <IntensityBadge intensity={option.intensity} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1.5 text-chart-1" />
          {option.duration_minutes} min
        </span>
        <span className="flex items-center">
          <Flame className="h-4 w-4 mr-1.5 text-chart-4" />
          {option.expected_calorie_burn} kcal
        </span>
        <span className="flex items-center">
          <Gauge className="h-4 w-4 mr-1.5 text-chart-2" />
          {option.calories_per_minute.toFixed(1)} kcal/min
        </span>
      </CardContent>
    </Card>
  );
}

export function WorkoutResult({ data }: WorkoutResultProps) {
  const { toast } = useToast();

  const [best, ...alternatives] = data.recommendations ?? [];

  // Older API versions don't return a predicted burn rate, so fall back to the implied pace
  const caloriesPerMinute = best
    ? best.calories_per_minute.toFixed(1)
    : data.recommended_duration > 0
      ? String(Math.round(data.expected_calorie_burn / data.recommended_duration))
      : null;

  const stats = [
    {
      icon: <Clock className="h-5 w-5 mr-2 text-chart-1" />,
      label: "Duration",
      value: `${data.recommended_duration} minutes`,
    },
    {
      icon: <Flame className="h-5 w-5 mr-2 text-chart-4" />,
      label: "Calories",
      value: `${Math.round(data.expected_calorie_burn)} kcal`,
    },
    ...(caloriesPerMinute !== null
      ? [
          {
            icon: <Gauge className="h-5 w-5 mr-2 text-chart-2" />,
            label: best ? "Predicted burn rate" : "Target pace",
            value: `~${caloriesPerMinute} kcal/min`,
          },
        ]
      : []),
    {
      icon: <Scale className="h-5 w-5 mr-2 text-chart-5" />,
      label: "Your BMI",
      value: data.bmi.toFixed(1),
    },
  ];

  const handleShare = async () => {
    const text = `My FitSense-AI workout: ${data.recommended_workout} for ${data.recommended_duration} minutes to burn ~${Math.round(data.expected_calorie_burn)} kcal.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My FitSense-AI workout", text, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      toast({ title: "Copied to clipboard", description: "Paste it anywhere to share your workout." });
    } catch (error) {
      // The user dismissing the native share sheet is not an error worth reporting
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({
        title: "Couldn't share",
        description: "Your browser blocked sharing. Try copying the details manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 animate-in fade-in-50 duration-500" aria-live="polite">
      <h3 className="text-xl font-semibold mb-4">Your Personalized Workout Plan</h3>

      {data.warning && (
        <Alert className="mb-4 border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>That's a long session</AlertTitle>
          <AlertDescription>{data.warning}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-chart-1/20 to-chart-2/20 dark:from-chart-1/10 dark:to-chart-2/10">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardDescription>{best ? "Best match" : "Recommended workout"}</CardDescription>
              <CardTitle className="text-2xl mt-1">{data.recommended_workout}</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={`${bmiCategoryColor[data.bmi_category]} px-3 py-1 shrink-0`}>
                BMI: {data.bmi_category}
              </Badge>
              {best && <IntensityBadge intensity={best.intensity} />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center">
                {stat.icon}
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-medium">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Recommendations come from a machine-learning model trained on gym tracker data and are
            not medical advice. Check with a healthcare professional before starting a new exercise
            program.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end bg-muted/30 border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </CardFooter>
      </Card>

      {alternatives.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-lg flex items-center">
            <Zap className="h-5 w-5 mr-2 text-chart-3" />
            Other good options
          </h4>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Each one reaches your calorie target. They're ranked by how closely the time needed
            matches a typical session at your experience level.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alternatives.map((option, index) => (
              <AlternativeCard key={option.workout} option={option} rank={index + 2} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
