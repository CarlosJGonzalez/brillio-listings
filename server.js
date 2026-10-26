/**
 * server.js - Express entry point.
 *
 *  GET /              -> serves public/index.html (the search UI)
 *  GET /api/listings  -> search + rank + paginate listings from data/listings.json
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const listings = require("./data/listings.json"); // loaded once into memory at startup
const { searchListings } = require("./src/search");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());                                          // allow calls from other origins
app.use(express.static(path.join(__dirname, "public"))); // serve the frontend

// Convert a query-string value to a number, or undefined when empty.
const num = (v) => (v === undefined || v === "" ? undefined : Number(v));

/**
 * Login endpoint
*/
const { login, getUser, logout } = require("./src/auth");

app.use(express.json()); // parse JSON request bodies

/**
 * POST /api/login
 * Body: { "username": "carlos", "password": "carlos123" }
 * 200 -> { token, user }   401 -> { error }
 */

app.post("/api/login2", (req, res) => {
  const { username, password } = req.body || {};
  const result = login( username, password );
  if(!result)return res.status(401).json({ error: "Invalid username or password" } );
  res.json(result);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const result = login(username, password);
  if (!result) return res.status(401).json({ error: "Invalid username or password" });
  res.json(result);
});

/**
 * GET /api/me
 * Header: Authorization: Bearer <token>
 * Returns the logged-in user.
 */
app.get("/api/me", (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = getUser(token);
  if (!user) return res.status(401).json({ error: "Not logged in" });
  res.json({ user });
});

/** POST /api/logout  Header: Authorization: Bearer <token> */
app.post("/api/logout", (req, res) => {
  logout((req.headers.authorization || "").replace("Bearer ", ""));
  res.json({ ok: true });
});


/**
 * GET /api/listings
 * Query params (all optional): minPrice, maxPrice, minBedrooms, city, keyword,
 *                              targetBudget, page (default 1), pageSize (default 5)
 * Response: { results: [...listing, score], page, pageSize, total, totalPages }
 */
app.get("/api/listings", (req, res) => {
  const q = req.query;
  const result = searchListings(listings, {
    minPrice: num(q.minPrice),
    maxPrice: num(q.maxPrice),
    minBedrooms: num(q.minBedrooms),
    city: q.city,
    keyword: q.keyword,
    targetBudget: num(q.targetBudget),
    page: num(q.page),
    pageSize: num(q.pageSize),
  });
  res.json(result);
});

// Catch-all error handler -> always return JSON
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
