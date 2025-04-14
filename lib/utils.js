import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Function to get the ISO week number for a given date
// Source: https://stackoverflow.com/a/6117889/1161362
export function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return week number
  return weekNo;
}

// Function to get the current ISO week number
export function getCurrentWeekNumber() {
  return getWeekNumber(new Date());
}

// Function to get initials from a name string
export function getInitials(name) {
  if (!name) return "";
  const words = name.split(" ");
  const initials = words
    .slice(0, 2) // Take the first two words
    .map((word) => word[0]) // Get the first letter
    .join(""); // Join them together
  return initials.toUpperCase();
}
