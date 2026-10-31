// ─── Categories ─────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: "TEXTBOOKS", label: "Textbooks", icon: "📚" },
  { value: "ELECTRONICS", label: "Electronics", icon: "💻" },
  { value: "DORM_ESSENTIALS", label: "Dorm Essentials", icon: "🛏️" },
  { value: "FREE_DONATIONS", label: "Free Donations", icon: "🎁" },
  { value: "NOTES_GUIDES", label: "Notes & Guides", icon: "📝" },
  { value: "ENGINEERING_SUPPLIES", label: "Engineering Supplies", icon: "📐" },
] as const;

// ─── Conditions ─────────────────────────────────────────────────────────────────

export const CONDITIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
] as const;

// ─── Item Statuses ──────────────────────────────────────────────────────────────

export const ITEM_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
] as const;

// ─── Campus Zones ───────────────────────────────────────────────────────────────

export const CAMPUS_ZONES = [
  { value: "library_foyer", label: "Library Foyer" },
  { value: "student_union", label: "Student Union" },
  { value: "main_cafeteria", label: "Main Cafeteria" },
  { value: "engineering_block_entrance", label: "Engineering Block Entrance" },
  { value: "sports_complex_gate", label: "Sports Complex Gate" },
] as const;

// ─── Contact Preferences ───────────────────────────────────────────────────────

export const CONTACT_PREFERENCES = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "CHAT", label: "In-App Chat" },
] as const;

// ─── Pagination Defaults ────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ─── Allowed Email Domains ──────────────────────────────────────────────────────

export function getAllowedEmailDomains(): string[] {
  const envDomains = process.env.ALLOWED_EMAIL_DOMAINS;
  if (envDomains) {
    return envDomains.split(",").map((d) => d.trim().toLowerCase());
  }
  // Default allowed academic domains
  return [".edu", ".ac.in", ".edu.in", ".ac.uk"];
}

export function isAllowedEmailDomain(email: string): boolean {
  return true; // Allow all email domains for student accessibility
}
