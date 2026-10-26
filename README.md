# Listing Search Service (Node.js + Express)

## Run it
```
npm install
npm start          # http://localhost:3000
npm run dev        # auto-restart on file changes
npm test           # unit tests (built-in node:test)
```
Share with ngrok (second terminal): `ngrok http 3000`

## Structure
```
server.js            Express app: static UI + GET /api/listings
src/search.js        Pure filter / ranking / pagination logic
data/listings.json   Your dataset (loaded once into memory)
public/index.html    Plain HTML + JS UI that calls the API with fetch
search.test.js       Tests
```

## API
`GET /api/listings?minPrice=&maxPrice=&minBedrooms=&city=&keyword=&targetBudget=&page=&pageSize=`

All params optional. Response:
```json
{ "results": [{ "address": "...", "price": 450000, "score": 0.711 }], "page": 1, "pageSize": 5, "total": 12, "totalPages": 3 }
```

## Ranking
- budgetScore = max(0, 1 - |price - targetBudget| / targetBudget)
- recencyScore = 0.5 ^ (ageDays / 30)  (halves every 30 days)
- score = 0.6 * budget + 0.4 * recency (recency only without targetBudget)

Filters: minPrice, maxPrice, minBedrooms, city (exact, case-insensitive), keyword (substring of description).

ngrok http <PORT> --basic-auth="username:pwd"