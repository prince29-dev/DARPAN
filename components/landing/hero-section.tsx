"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, Github, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { AnimatedNetworkBackground } from "@/components/landing/animated-network-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-border">
      <AnimatedNetworkBackground />

      <div className="container relative py-24">
        <div className="flex max-w-3xl flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="accent" className="w-fit">
              Digital Twin Platform for Delhi Metro
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl font-semibold tracking-tight sm:text-7xl lg:text-8xl"
          >
            DARPAN
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-lg text-muted-foreground"
          >
            A research-grade digital twin for India&apos;s largest metro network — modeling
            stations, routes, and trips, with simulation and AI prediction built in from the
            start.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard/documentation">
                <BookOpen className="size-4" />
                Documentation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="#roadmap">
                <LayoutGrid className="size-4" />
                Architecture
              </Link>
            </Button>
            <Button variant="ghost" size="lg" disabled className="gap-2">
              <FileText className="size-4" />
              Research Paper
              <Badge variant="outline">Coming soon</Badge>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
