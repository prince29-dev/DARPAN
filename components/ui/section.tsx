import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { className, eyebrow, title, description, align = "left", children, ...props },
    ref,
  ) => {
    const hasHeader = Boolean(eyebrow ?? title ?? description);

    return (
      <section
        ref={ref}
        className={cn("py-16 sm:py-24", className)}
        {...props}
      >
        <div className="container">
          {hasHeader && (
            <div
              className={cn(
                "mb-12 flex max-w-2xl flex-col gap-3",
                align === "center" && "mx-auto items-center text-center",
              )}
            >
              {eyebrow && (
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-base text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    );
  },
);
Section.displayName = "Section";

export { Section };
