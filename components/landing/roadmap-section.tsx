import { Check, ExternalLink, FlaskConical } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { MILESTONES, RESEARCH_GOALS } from "@/constants/roadmap";
import { cn } from "@/lib/utils";

export function RoadmapSection() {
  return (
    <Section
      id="roadmap"
      eyebrow="Roadmap"
      title="Milestone progress"
      description="DARPAN ships in public, incremental milestones — each one architected so the next slots in cleanly."
      className="border-b border-border"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
          {MILESTONES.map((milestone) => (
            <li key={milestone.title} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.94rem] flex size-6 items-center justify-center rounded-full border",
                  milestone.status === "done" &&
                    "border-accent bg-accent text-accent-foreground",
                  milestone.status === "current" &&
                    "border-accent bg-background text-accent",
                  milestone.status === "upcoming" &&
                    "border-border bg-surface text-muted-foreground",
                )}
              >
                {milestone.status === "done" ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold">{milestone.title}</h3>
                {milestone.status === "current" && <Badge variant="accent">In progress</Badge>}
                {milestone.status === "upcoming" && <Badge variant="outline">Upcoming</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Architecture</CardTitle>
              <CardDescription>
                Every engine — GTFS, Realtime, Simulation, AI, Analytics — plugs into the
                platform as an isolated module behind a typed interface, documented as each
                milestone ships.
              </CardDescription>
              <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                <Link href="/dashboard/documentation">
                  Read the architecture docs
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-accent" />
                <CardTitle>Research goals</CardTitle>
              </div>
              <ul className="mt-2 flex flex-col gap-2.5">
                {RESEARCH_GOALS.map((goal) => (
                  <li key={goal} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {goal}
                  </li>
                ))}
              </ul>
            </CardHeader>
          </Card>
        </div>
      </div>
    </Section>
  );
}
