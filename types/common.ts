import type { ReactNode } from "react";

export interface WithChildren {
  children: ReactNode;
}

export interface WithClassName {
  className?: string;
}

export type Size = "sm" | "md" | "lg";

export interface AsyncState<T> {
  status: "idle" | "loading" | "success" | "error";
  data: T | null;
  error: string | null;
}
