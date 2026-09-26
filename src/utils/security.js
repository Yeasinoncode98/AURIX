/**
 * AURIX Security Utilities
 * - Input sanitization
 * - Client-side rate limiting
 * - Input validation helpers
 */

// ── Sanitize string input ──────────────────────────────
// Strips HTML tags, trims whitespace, limits length
export function sanitize(str, maxLen = 500) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>'"]/g, "") // strip dangerous chars
    .replace(/javascript:/gi, "") // strip JS protocol
    .replace(/on\w+\s*=/gi, "") // strip event handlers
    .trim()
    .slice(0, maxLen);
}

// Sanitize but allow normal punctuation (for addresses, names)
export function sanitizeText(str, maxLen = 300) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}

// ── Rate Limiter ───────────────────────────────────────
// Tracks attempts per key in memory (resets on page refresh)
const attempts = {};

/**
 * Check if action is rate-limited
 * @param {string} key - unique key (e.g. 'login', 'review')
 * @param {number} maxAttempts - max allowed attempts
 * @param {number} windowMs - time window in ms
 * @returns {{ limited: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 30000) {
  const now = Date.now();
  if (!attempts[key]) attempts[key] = [];

  // Remove expired attempts
  attempts[key] = attempts[key].filter((t) => now - t < windowMs);

  const count = attempts[key].length;

  if (count >= maxAttempts) {
    const oldest = attempts[key][0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    return { limited: true, remaining: 0, resetIn };
  }

  return { limited: false, remaining: maxAttempts - count, resetIn: 0 };
}

/**
 * Record an attempt for rate limiting
 * @param {string} key
 */
export function recordAttempt(key) {
  if (!attempts[key]) attempts[key] = [];
  attempts[key].push(Date.now());
}

/**
 * Reset attempts for a key (e.g. on successful login)
 * @param {string} key
 */
export function resetAttempts(key) {
  attempts[key] = [];
}

// ── Validation helpers ─────────────────────────────────
export const validate = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim()),
  phone: (v) => /^01[3-9]\d{8}$/.test(v?.trim()),
  name: (v) => v?.trim().length >= 2 && v?.trim().length <= 100,
  password: (v) => v?.length >= 6,
  trxId: (v, len) => v?.length === len && /^[A-Z0-9]+$/.test(v),
  rating: (v) => Number.isInteger(v) && v >= 1 && v <= 5,
  nonEmpty: (v) => typeof v === "string" && v.trim().length > 0,
};
