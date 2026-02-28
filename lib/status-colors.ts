// Preset color palette for status columns.
// Each color has Tailwind classes for light & dark mode.

export interface StatusColor {
  name: string;
  color: string;       // text color
  bgColor: string;     // background color for column body
  borderColor: string; // border color for column header
  dotColor: string;    // solid dot color
}

const COLOR_PALETTE: StatusColor[] = [
  {
    name: "blue",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  {
    name: "amber",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  {
    name: "green",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50/50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
  },
  {
    name: "red",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50/50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
  {
    name: "purple",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
  },
  {
    name: "teal",
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-50/50 dark:bg-teal-950/20",
    borderColor: "border-teal-200 dark:border-teal-800",
    dotColor: "bg-teal-500",
  },
  {
    name: "pink",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-50/50 dark:bg-pink-950/20",
    borderColor: "border-pink-200 dark:border-pink-800",
    dotColor: "bg-pink-500",
  },
  {
    name: "indigo",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    dotColor: "bg-indigo-500",
  },
  {
    name: "orange",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50/50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    dotColor: "bg-orange-500",
  },
  {
    name: "cyan",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-50/50 dark:bg-cyan-950/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    dotColor: "bg-cyan-500",
  },
];

/** Get a color from the palette by index (wraps around). */
export function getColorByIndex(index: number): StatusColor {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/** Get a color from the palette by its name. Falls back to the first color. */
export function getColorByName(name: string): StatusColor {
  return COLOR_PALETTE.find((c) => c.name === name) ?? COLOR_PALETTE[0];
}

/** The full palette, for reference or iteration. */
export const PALETTE = COLOR_PALETTE;

/** Default statuses created for new users. */
export const DEFAULT_STATUSES = [
  { name: "APPLIED", label: "Applied", color: "blue", order: 0 },
  { name: "INTERVIEW", label: "Interview", color: "amber", order: 1 },
  { name: "OFFER", label: "Offer", color: "green", order: 2 },
  { name: "REJECTED", label: "Rejected", color: "red", order: 3 },
];
