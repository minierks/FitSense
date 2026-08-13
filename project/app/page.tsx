import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { WorkoutFormSection } from "@/components/workout-form-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <WorkoutFormSection />
      </main>
      <Footer />
    </div>
  );
}