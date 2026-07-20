import { Github, Radar } from "lucide-react";
import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documentation", href: "/dashboard/documentation" },
  { label: "Architecture", href: "#roadmap" },
];

const RESOURCE_LINKS = [
  { label: "GitHub", href: "https://github.com", external: true },
  { label: "Research paper", href: "#roadmap" },
];

export function FooterSection() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col gap-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-3 shrink-0">
                <span className="absolute inline-flex size-full animate-signal-pulse rounded-full bg-accent" />
                <Radar className="relative size-3 text-accent" strokeWidth={2} />
              </span>
              <span className="font-display text-sm font-semibold">DARPAN</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              An open-source digital twin platform for Delhi Metro — modeling stations,
              routes, and trips, built to extend across urban transit.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/70">
              Product
            </span>
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/70">
              Resources
            </span>
            {RESOURCE_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="size-3.5" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} DARPAN. Open source under MIT.</span>
          <span>Delhi Metro digital twin — research-grade, community-built.</span>
        </div>
      </div>
    </footer>
  );
}
