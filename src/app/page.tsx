"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const FlowXRaySection = dynamic(() => import("@/components/FlowXRaySection"), { ssr: false });
const SimulationSection = dynamic(() => import("@/components/SimulationSection"), { ssr: false });
const GovernanceSection = dynamic(() => import("@/components/GovernanceSection"), { ssr: false });
const LineageSection = dynamic(() => import("@/components/LineageSection"), { ssr: false });
const MelEditorSection = dynamic(() => import("@/components/MelEditorSection"), { ssr: false });
import ArchitectureSection from "@/components/ArchitectureSection";
import ShowcaseSection from "@/components/ShowcaseSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ShowcaseSection />
      <GovernanceSection />
      <LineageSection />
      <SimulationSection />
      <FlowXRaySection />
      <MelEditorSection />
      <ArchitectureSection />
      <Footer />
    </main>
  );
}
