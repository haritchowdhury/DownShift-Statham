# Downshift Statham

A focused home goods product discovery page for the Downshift technical task. The app uses the provided JSON catalog locally and does not depend on Shopify, checkout, cart state, or remote product APIs at runtime.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## What Was Built

- Local JSON catalog saved at `data/items.json` and served to the browser from `public/data/items.json`.
- Client-side search over 4,000 home goods products.
- Category browsing derived from the catalog.
- Product result count and incremental "Show more" rendering.
- Product cards with image fallback, title, brand, category, tags, price, rating/reviews, and stock status.
- Normalization for messy titles, string prices, missing prices, missing images, missing descriptions, future release dates, and ratings without reviews.
- The starter template's package setup is preserved, but Shopify/cart behavior is not part of this focused catalog page.

## Search Decisions

Search is deterministic and local because 4,000 records is small enough to keep the experience fast and explainable. The initial page does not ship the full catalog through Next page props; it loads the local static JSON after the page starts.

Ranking gives heavier weight to phrase matches in title, category, tags, and brand. Individual terms also count, but multi-term queries must match every non-intent term. That keeps searches such as `rattan storage` and `wall art` focused instead of returning anything that only matches one word.

The query parser handles lightweight shopping intent:

- `cheap`, `budget`, `affordable` bias matching products toward lower prices.
- `premium`, `luxury`, `expensive` bias toward higher price and quality signals.
- `best`, `top`, `popular` bias toward rating and review strength.

Intent-only searches also work. A query like `cheap` sorts the catalog toward lower priced products; `best` sorts toward stronger rating/review signals.

The tradeoff is that this search is simple and easy to walk through, but a much larger or more semantic catalog would eventually need indexed backend search.
# DownShift-Statham
