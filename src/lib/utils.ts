import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function calculateMatchScore(userSkillsTeach: string[], userSkillsLearn: string[], targetSkillsTeach: string[], targetSkillsLearn: string[]): {
  score: number;
  youTeachThem: string[];
  theyTeachYou: string[];
} {
  const norm = (s: string) => s.toLowerCase().trim();
  
  const normUserTeach = userSkillsTeach.map(norm);
  const normUserLearn = userSkillsLearn.map(norm);
  const normTargetTeach = targetSkillsTeach.map(norm);
  const normTargetLearn = targetSkillsLearn.map(norm);

  const youTeachThem = userSkillsTeach.filter(s => normTargetLearn.includes(norm(s)));
  const theyTeachYou = targetSkillsTeach.filter(s => normUserLearn.includes(norm(s)));

  let score = 50; // base potential
  if (youTeachThem.length > 0 && theyTeachYou.length > 0) {
    score = 85 + Math.min(14, (youTeachThem.length + theyTeachYou.length) * 3);
  } else if (youTeachThem.length > 0 || theyTeachYou.length > 0) {
    score = 70 + Math.min(15, (youTeachThem.length + theyTeachYou.length) * 4);
  }

  return {
    score: Math.min(99, score),
    youTeachThem: youTeachThem.length ? youTeachThem : [userSkillsTeach[0] || "General Tech"],
    theyTeachYou: theyTeachYou.length ? theyTeachYou : [targetSkillsTeach[0] || "General Design"],
  };
}
