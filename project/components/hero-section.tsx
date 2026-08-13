"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const scrollToForm = () => {
    const formElement = document.getElementById("workout-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/10 to-background/40 z-10" />      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Your Personalized
            <br />
            <span className="text-green-600">Workout Plan</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-10 leading-relaxed">
            Achieve your fitness goals with customized workout recommendations
            tailored to your body type, experience level, and calories target.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 bg-primary hover:bg-primary/90 text-green-600"
              onClick={scrollToForm}
            >
              Get Recommendations
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30 hover:text-white"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="mt-16 animate-bounce text-white hover:text-white hover:bg-white/10"
            onClick={scrollToForm}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}