import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingNav } from "@/components/landing/landing-nav";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { StatsSection } from "@/components/landing/stats-section";
import { buildNetworkStats } from "@/constants/stats";
import { getGtfsStatistics } from "@/services/gtfs/statistics";

export default function Home() {
  const gtfsStats = getGtfsStatistics();
  const networkStats = buildNetworkStats(gtfsStats);

  return (
    <main>
      <LandingNav />
      <HeroSection />
      <StatsSection stats={networkStats} />
      <FeaturesSection />
      <RoadmapSection />
      <FooterSection />
    </main>
  );
}
