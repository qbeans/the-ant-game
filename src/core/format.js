const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/**
 * Formats a number for display: 1,234 then 12.35K, 1.5M, ... with up to `decimals` places below 100.
 */
export function formatNumber(n, decimals = 0) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return decimals && n < 100 && n % 1 ? n.toFixed(decimals) : Math.floor(n).toLocaleString('en-US');
  let tier = Math.floor(Math.log10(n) / 3);
  let value = n / Math.pow(10, 3 * tier);
  if (value >= 999.95) { tier++; value /= 1000; } // avoid "1000K" from rounding
  if (tier >= SUFFIXES.length) return n.toExponential(2);
  const digits = value >= 100 ? 1 : value >= 10 ? 2 : 3;
  return String(+value.toFixed(digits)) + SUFFIXES[tier];
}

/**
 * Formats a production rate with one decimal place: 0.1, 4.9, 999.5, 33.3M.
 * Values below 0.1 get two decimals (0.05) and values below 0.01 get three (0.004).
 */
export function formatRate(n) {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  if (n < 1000) {
    const decimals = n >= 0.1 ? 1 : n >= 0.01 ? 2 : 3;
    const text = n.toFixed(decimals);
    return text === '1000.0' ? '1.0K' : text;
  }
  let tier = Math.floor(Math.log10(n) / 3);
  let value = n / Math.pow(10, 3 * tier);
  if (value >= 999.95) { tier++; value /= 1000; } // avoid "1000.0K" from rounding
  if (tier >= SUFFIXES.length) return n.toExponential(1);
  return value.toFixed(1) + SUFFIXES[tier];
}

/** Formats seconds as m:ss, or as "1h 05m" past an hour. */
export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, s = total % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`;
}
