"use client";

import { useState } from "react";
import { Activity, Clock, Heart, Share2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  // CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface WorkoutResultProps {
  data: {
    recommended_workout: string;
    // description: string;
    // exercises: Array<{
    //   name: string;
    //   sets: number;
    //   reps: number;
    //   rest: number;
    // }>;
    recommended_duration: number;
    // intensity: string;
    expected_calorie_burn: number;
  };
}

export function WorkoutResult({ data }: WorkoutResultProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  // Mock function for sharing workout
  const handleShare = () => {
    // In a real app, this would be implemented with the Web Share API
    // or by generating a shareable link
    toast({
      title: "Share Feature",
      description: "Sharing functionality would be implemented here in production.",
    });
  };

  // Mock function for saving workout
  const handleSave = () => {
    toast({
      title: "Workout Saved!",
      description: "Your workout has been saved to your profile.",
    });
  };

  if (!data) return null;

  // const intensityColor = {
  //   "Low": "bg-green-500/10 text-green-600 dark:text-green-400",
  //   "Medium": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  //   "High": "bg-red-500/10 text-red-600 dark:text-red-400",
  // }[data.intensity] || "bg-blue-500/10 text-blue-600";

  return (
    <div className="mt-8 animate-in fade-in-50 duration-500">
      <h3 className="text-xl font-semibold mb-4">Your Personalized Workout Plan</h3>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-chart-1/20 to-chart-2/20 dark:from-chart-1/10 dark:to-chart-2/10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{data.recommended_workout}</CardTitle>
              {/* <CardDescription className="mt-2">{data.description}</CardDescription> */}
            </div>
            {/* <Badge variant="outline" className={`${intensityColor} px-3 py-1`}>
              {data.intensity} Intensity
            </Badge> */}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-chart-1" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{data.recommended_duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-chart-4" />
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="font-medium">{data.expected_calorie_burn} kcal</p>
              </div>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-chart-2" />
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                {/* <p className="font-medium">{data.intensity}</p> */}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <h4 className="font-medium text-lg mb-4">Exercise Details</h4>
          
          {/* <div className="space-y-4">
            {data.exercises.slice(0, expanded ? undefined : 3).map((exercise, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Dumbbell className="h-5 w-5 mr-3 text-chart-3" />
                  <span className="font-medium">{exercise.name}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Badge variant="outline" className="font-normal">
                    {exercise.sets} sets
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {exercise.reps} reps
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {exercise.rest}s rest
                  </Badge>
                </div>
              </div>
            ))}
          </div> */}
          
          {/* {data.exercises.length > 3 && (
            <Button 
              variant="ghost" 
              className="mt-4 w-full" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : `Show ${data.exercises.length - 3} More Exercises`}
            </Button> */}
          {/* )} */}
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/30 border-t">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            Save Workout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}