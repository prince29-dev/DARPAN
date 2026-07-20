"use client";

import { motion } from "framer-motion";

const PATHS = [
  "M -50 120 C 150 40, 350 200, 550 90 S 850 20, 1050 110",
  "M -50 260 C 200 320, 400 180, 620 260 S 900 340, 1100 240",
  "M -50 380 C 250 300, 450 420, 680 360 S 950 300, 1150 400",
];

const NODES = [
  { cx: 120, cy: 96 },
  { cx: 340, cy: 168 },
  { cx: 560, cy: 108 },
  { cx: 780, cy: 220 },
  { cx: 260, cy: 300 },
  { cx: 640, cy: 288 },
  { cx: 900, cy: 340 },
];

export function AnimatedNetworkBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 size-full text-accent/25"
        viewBox="0 0 1100 460"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {PATHS.map((d, index) => (
          <motion.path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2.6,
              delay: index * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
        {NODES.map((node, index) => (
          <motion.circle
            key={`${node.cx}-${node.cy}`}
            cx={node.cx}
            cy={node.cy}
            r={4}
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 + index * 0.15 }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
    </div>
  );
}
