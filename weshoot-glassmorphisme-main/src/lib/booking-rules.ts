export const PROJECT_DESCRIPTION_MAX = 500;

export function isProjectDescriptionValid(value: string): boolean {
  return value.trim().length > 0 && value.length <= PROJECT_DESCRIPTION_MAX;
}

export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function getVisibleReviews<T>(reviews: T[], limit = 6): T[] {
  return reviews.slice(0, limit);
}

export function getSafeBookingReturnPath(value: string | undefined): string {
  if (!value) return "/explore";
  const match = value.match(/^\/book\/([A-Za-z0-9_-]+)(?:\?offer=([A-Za-z0-9_-]+))?$/);
  if (!match) return "/explore";
  return match[2] ? `/book/${match[1]}?offer=${match[2]}` : `/book/${match[1]}`;
}

export type BookingStep = "choice" | "type" | "date" | "brief" | "summary";

export function getBookingSteps(mode: "offer" | "project", hybridCreator: boolean): BookingStep[] {
  if (mode === "offer") return ["choice", "date", "summary"];
  return hybridCreator ? ["choice", "type", "date", "brief", "summary"] : ["choice", "date", "brief", "summary"];
}

export function isDateBeforeToday(value: string, today: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < today;
}