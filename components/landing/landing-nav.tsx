"use client";

import { Github, Radar } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Docs", href: "/dashboard/documentation" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative flex size-3.5 shrink-0">
            <span className="absolute inline-flex size-full animate-signal-pulse rounded-full bg-accent" />
            <Radar className="relative size-3.5 text-accent" strokeWidth={2} />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">DARPAN</span>
          <Badge variant="outline" className="hidden sm:inline-flex">
            v0.1
          </Badge>
        </Link>

        <nav aria-label="Landing" className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="GitHub repository">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="size-4" />
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
