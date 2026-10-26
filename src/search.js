/**
 * search.js - Pure search + ranking logic (no Express code here, easy to test).
 */

/**
 * Relevance score between 0 and 1.
 *  - budgetScore  = max(0, 1 - |price - targetBudget| / targetBudget)  -> 1 when price equals the budget
 *  - recencyScore = 0.5 ^ (ageDays / 30)                               -> halves every 30 days
 *  - relevance    = 0.6 * budgetScore + 0.4 * recencyScore
 *  Without a targetBudget, relevance is recency only.
 */
function relevance(listing, targetBudget, now) {
  const ageDays = Math.max(0, (now - new Date(listing.listedDate)) / 86400000);
  const recency = Math.pow(0.5, ageDays / 30);
  if (!targetBudget) return recency;
  const budget = Math.max(0, 1 - Math.abs(listing.price - targetBudget) / targetBudget);
  return 0.6 * budget + 0.4 * recency;
}

/**
 * Filter -> score -> sort -> paginate.
 * @param {Array} all     listings
 * @param {Object} p      { minPrice, maxPrice, minBedrooms, city, keyword, targetBudget, page, pageSize, now }
 */
function searchListings(all, p = {}) {
  const now = p.now || new Date();
  const page = Math.max(1, p.page || 1);
  const pageSize = Math.max(1, p.pageSize || 5);
  const kw = p.keyword ? p.keyword.trim().toLowerCase() : "";
  const city = p.city ? p.city.trim().toLowerCase() : "";

  const ranked = all
    .filter((l) =>
      (p.minPrice == null || l.price >= p.minPrice) &&
      (p.maxPrice == null || l.price <= p.maxPrice) &&
      (p.minBedrooms == null || l.bedrooms >= p.minBedrooms) &&
      (!city || l.city.toLowerCase() === city) &&
      (!kw || l.description.toLowerCase().includes(kw)))
    .map((l) => ({ ...l, score: Math.round(relevance(l, p.targetBudget, now) * 1000) / 1000 }))
    .sort((a, b) => b.score - a.score);

  const total = ranked.length;
  return {
    results: ranked.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = { relevance, searchListings };
