import { FeatureCard } from "@/components/common/feature-card";
import { Section } from "@/components/ui/section";
import { FEATURES } from "@/constants/features";

export function FeaturesSection() {
  return (
    <Section
      id="features"
      eyebrow="Platform"
      title="Built for the whole network, not just a map"
      description="Six capabilities that make DARPAN a digital twin rather than a dashboard."
      className="border-b border-border"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}
