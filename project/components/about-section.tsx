import { BrainCircuit, ClipboardList, Dumbbell } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="h-8 w-8 text-chart-1" />,
    title: "1. Tell us about you",
    description:
      "Enter your age, gender, height, weight, experience level, and how many calories you want to burn.",
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-chart-2" />,
    title: "2. The models run",
    description:
      "We compute your BMI, then two Random Forest models trained on ~1,700 real gym sessions predict the best-fit workout type and session length.",
  },
  {
    icon: <Dumbbell className="h-8 w-8 text-chart-4" />,
    title: "3. Get your plan",
    description:
      "You get a recommended workout, how long to train, and the pace needed to hit your calorie target.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            FitSense-AI turns gym tracker data into a recommendation you can act on today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.title} className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
