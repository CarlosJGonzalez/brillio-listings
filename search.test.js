const test = require("node:test");
const assert = require("node:assert");
const { searchListings } = require("./src/search");
const listings = require("./data/listings.json");

test("returns all 12 listings unfiltered", () => {
  assert.strictEqual(searchListings(listings, { pageSize: 50 }).total, 12);
});
test("filters by city", () => {
  const r = searchListings(listings, { city: "springfield", pageSize: 50 });
  assert.ok(r.results.every((l) => l.city.toLowerCase() === "springfield"));
});
test("paginates 5 per page", () => {
  const r = searchListings(listings, {});
  assert.strictEqual(r.results.length, 5);
  assert.strictEqual(r.totalPages, 3);
});
