import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number using Indian digit grouping (e.g. 128434 -> "1,28,434"),
 * matching how Indian transit and government figures are conventionally
 * displayed. `toLocaleString("en-IN")` covers this in modern Node/browser
 * runtimes; this is a dependency-free fallback with the same output shape.
 */
export function formatIndianNumber(value: number): string {
  const str = Math.trunc(value).toString();
  if (str.length <= 3) return str;

  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${lastThree}`;
}
