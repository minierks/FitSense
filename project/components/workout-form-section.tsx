import { FeaturesSection } from "@/components/features-section";
import { WorkoutForm } from "@/components/workout-form";

export function WorkoutFormSection() {
  return (
    <>
      <FeaturesSection />
      
      <section id="workout-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Get Your Personalized Workout Plan
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below with your details and fitness goals to receive
                a customized workout recommendation.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <WorkoutForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}