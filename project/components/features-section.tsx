import { Activity, Clock, UserCheck, Zap } from "lucide-react";

const features = [
  {
    icon: <UserCheck className="h-8 w-8 text-chart-1" />,
    title: "Personalized Plans",
    description:
      "Get workout recommendations tailored to your unique body type, fitness level, and goals.",
  },
  {
    icon: <Activity className="h-8 w-8 text-chart-2" />,
    title: "Effective Routines",
    description:
      "Science-backed workout routines designed to maximize results in minimal time.",
  },
  {
    icon: <Zap className="h-8 w-8 text-chart-4" />,
    title: "Goal Oriented",
    description:
      "Whether building muscle, losing weight, or improving endurance, we've got you covered.",
  },
  {
    icon: <Clock className="h-8 w-8 text-chart-5" />,
    title: "Time Optimized",
    description:
      "Efficient workouts that fit your schedule and burn exactly the calories you target.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose FitSense-AI?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our advanced algorithm creates customized workout plans based on your
            body metrics and fitness goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}