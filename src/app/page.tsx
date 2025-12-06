import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import CodeShowcase from "@/components/CodeShowcase";
import Features from "@/components/Features";
import Architecture from "@/components/Architecture";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <Header />
      <Hero />
      <WhySection />
      <CodeShowcase />
      <Features />
      <Architecture />
      <Footer />
    </main>
  );
}
