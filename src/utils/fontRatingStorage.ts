export interface FontRatingData {
  fontId: string;
  average: number; // e.g., 4.8
  totalCount: number; // e.g., 68
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  userRatings: Record<string, number>; // username/id -> rating (1-5)
}

export const FONT_RATINGS_STORAGE_KEY = 'dr_fonts_ratings_v1';
export const FONT_RATINGS_UPDATED_EVENT = 'dr_font_ratings_updated_event';

// Initial pre-configured seed ratings for popular Arabic fonts
const DEFAULT_SEED_RATINGS: Record<string, { avg: number; count: number; dist: { 5: number; 4: number; 3: number; 2: number; 1: number } }> = {
  cairo: { avg: 4.9, count: 128, dist: { 5: 102, 4: 20, 3: 4, 2: 1, 1: 1 } },
  amiri: { avg: 4.8, count: 96, dist: { 5: 78, 4: 14, 3: 3, 2: 1, 1: 0 } },
  almarai: { avg: 4.7, count: 74, dist: { 5: 55, 4: 14, 3: 3, 2: 1, 1: 1 } },
  tajawal: { avg: 4.8, count: 85, dist: { 5: 68, 4: 12, 3: 4, 2: 1, 1: 0 } },
  aref_ruqaa: { avg: 4.9, count: 110, dist: { 5: 92, 4: 14, 3: 3, 2: 1, 1: 0 } },
  el_messiri: { avg: 4.6, count: 52, dist: { 5: 38, 4: 10, 3: 3, 2: 1, 1: 0 } },
  reem_kufi: { avg: 4.8, count: 64, dist: { 5: 50, 4: 11, 3: 2, 2: 1, 1: 0 } },
  changa: { avg: 4.5, count: 42, dist: { 5: 28, 4: 10, 3: 3, 2: 1, 1: 0 } },
  marhey: { avg: 4.7, count: 36, dist: { 5: 26, 4: 7, 3: 2, 2: 1, 1: 0 } },
  rakkas: { avg: 4.9, count: 58, dist: { 5: 49, 4: 7, 3: 1, 2: 1, 1: 0 } },
  harmattan: { avg: 4.6, count: 31, dist: { 5: 22, 4: 6, 3: 2, 2: 1, 1: 0 } },
  scheherazade_new: { avg: 4.8, count: 47, dist: { 5: 38, 4: 6, 3: 2, 2: 1, 1: 0 } },
  ibarra_real_nova: { avg: 4.5, count: 24, dist: { 5: 16, 4: 5, 3: 2, 2: 1, 1: 0 } },
  lateef: { avg: 4.7, count: 39, dist: { 5: 30, 4: 6, 3: 2, 2: 1, 1: 0 } },
  mada: { avg: 4.4, count: 19, dist: { 5: 12, 4: 4, 3: 2, 2: 1, 1: 0 } },
  katibeh: { avg: 4.8, count: 51, dist: { 5: 41, 4: 7, 3: 2, 2: 1, 1: 0 } },
};

// Helper: Read stored ratings database
export function getAllStoredRatings(): Record<string, FontRatingData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FONT_RATINGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading font ratings from localStorage', err);
    return {};
  }
}

// Helper: Save ratings database to localStorage
export function saveAllRatings(ratings: Record<string, FontRatingData>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FONT_RATINGS_STORAGE_KEY, JSON.stringify(ratings));
    window.dispatchEvent(new Event(FONT_RATINGS_UPDATED_EVENT));
  } catch (err) {
    console.error('Error saving font ratings to localStorage', err);
  }
}

// Get or initialize rating for a specific font
export function getFontRating(fontId: string): FontRatingData {
  const all = getAllStoredRatings();
  if (all[fontId]) {
    return all[fontId];
  }

  // Check if we have a seed for this font ID or a normalized version
  const cleanId = fontId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const seedKey = Object.keys(DEFAULT_SEED_RATINGS).find((k) => cleanId.includes(k) || k.includes(cleanId));
  const seed = seedKey ? DEFAULT_SEED_RATINGS[seedKey] : null;

  const initialData: FontRatingData = {
    fontId,
    average: seed ? seed.avg : 4.7,
    totalCount: seed ? seed.count : 25,
    distribution: seed ? { ...seed.dist } : { 5: 18, 4: 5, 3: 1, 2: 1, 1: 0 },
    userRatings: {},
  };

  return initialData;
}

// Get logged-in user's rating for a font (returns null if not rated yet)
export function getUserRatingForFont(fontId: string, userIdOrUsername: string): number | null {
  if (!userIdOrUsername) return null;
  const fontRating = getFontRating(fontId);
  return fontRating.userRatings[userIdOrUsername] || null;
}

// Submit or update a rating for a font by a registered user
export function submitFontRating(fontId: string, userIdOrUsername: string, ratingValue: number): FontRatingData {
  if (!userIdOrUsername || ratingValue < 1 || ratingValue > 5) {
    return getFontRating(fontId);
  }

  const all = getAllStoredRatings();
  const fontRating = getFontRating(fontId);

  const previousUserRating = fontRating.userRatings[userIdOrUsername];

  const newDist = { ...fontRating.distribution };
  let newTotalCount = fontRating.totalCount;

  if (previousUserRating) {
    // User is updating an existing rating
    if (newDist[previousUserRating as keyof typeof newDist] > 0) {
      newDist[previousUserRating as keyof typeof newDist] -= 1;
    }
    newDist[ratingValue as keyof typeof newDist] = (newDist[ratingValue as keyof typeof newDist] || 0) + 1;
  } else {
    // New rating from this user
    newTotalCount += 1;
    newDist[ratingValue as keyof typeof newDist] = (newDist[ratingValue as keyof typeof newDist] || 0) + 1;
  }

  // Calculate new average
  const totalScore =
    newDist[5] * 5 +
    newDist[4] * 4 +
    newDist[3] * 3 +
    newDist[2] * 2 +
    newDist[1] * 1;
  const newAverage = Number((totalScore / (newTotalCount || 1)).toFixed(1));

  const updatedRecord: FontRatingData = {
    ...fontRating,
    average: newAverage,
    totalCount: newTotalCount,
    distribution: newDist,
    userRatings: {
      ...fontRating.userRatings,
      [userIdOrUsername]: ratingValue,
    },
  };

  all[fontId] = updatedRecord;
  saveAllRatings(all);

  return updatedRecord;
}
