# Downshift Statham

A focused product discovery app for the Downshift technical task. It uses the provided home goods JSON catalog locally and emphasizes practical search decisions, data normalization, browsing, and ranking over building a full ecommerce store.

The project started from a free open source Next.js ecommerce template with Shopify-style structure. The useful Next.js/Tailwind scaffolding and visual direction were retained, but the product data flow was replaced with local JSON loading, deterministic client-side search, local product pages, scoped filters, image fallbacks, and local cart state. There is no Shopify backend and no checkout flow.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What Was Built

- Search and discovery homepage at `/`.
- Local product detail pages at `/products/[product]`.
- Local cart at `/cart` using browser storage.
- Catalog loaded from `/data/items.json`.
- Category, brand, and material/style filter chips derived from the catalog.
- Scoped lower-level filters: category narrows brands; category plus brand narrows material/style chips.
- Curated default browsing sections for recent launches, best-rated products, and best-rated products under price bands.
- Product cards with image fallback, availability state, title, description, brand, price, and add-to-cart action.

## Data Decisions

The catalog is small enough for local search but messy enough that normalization matters:

- prices can be numbers, null, or comma-formatted strings
- ratings can be missing or tied to zero reviews
- images and descriptions can be missing
- titles can have inconsistent casing or spacing
- future `releasedAt` values affect whether an item should be treated as available

Before rendering or search, each product is normalized:

```text
raw product
    |
    v
normalizeProduct()
    |
    +--> clean title / brand / category
    +--> normalize tag array
    +--> parse price into number or null
    +--> keep rating only when reviews exist
    +--> compute available from inStock + releasedAt
```

## Search Functionality

Search is deterministic and client-side because the dataset is only about 4,000 products. That keeps the behavior fast, easy to inspect, and easy to explain in a walkthrough.

Search takes four inputs:

```text
query text
selected category
selected brand
selected material/tag
```

The selected chips are hard filters. A product must match the chosen category, brand, and tag before it is scored. This keeps filtering predictable: selecting `Bath` means all ranking now happens inside Bath products.

Query text is lowercased and split into tokens. The parser recognizes lightweight shopping intent:

- `cheap`, `budget`, `affordable` -> low-price intent
- `premium`, `luxury`, `expensive` -> premium intent
- `best`, `top`, `popular` -> rating/review intent

Intent words are removed from required text terms. For example:

```text
"cheap rattan chair"
        |
        v
intent: low price
required terms: rattan, chair
```

All non-intent terms must match somewhere across the searchable fields:

```text
title
category
tags
brand
description
```

That means `rattan chair` requires both `rattan` and `chair` to appear somewhere in the product text. This avoids broad results where only one word matched.

## Ranking Decisions

Ranking uses weighted matching rather than a plain substring filter.

```text
Phrase match priority
  title       strongest
  category
  tags
  brand
  description weakest

Term match priority
  title       strongest
  category
  tags
  brand
  description weakest
```

After text matching, product quality and usability signals are applied:

```text
score
  + available product boost
  + image present boost
  - missing image penalty
  - missing price penalty
  + rating/review quality
  + price or rating intent boost
```

Intent-only searches also work. Searching `cheap` ranks the current catalog by lower price. Searching `best` ranks by rating and review strength.

Final sorting is:

```text
1. score descending
2. products with images first
3. available products first
4. title alphabetically
```

## UI Behavior

When no filter or search query is active, the homepage shows discovery sections:

```text
recent launches carousel
6 product cards
best-rated carousel
6 product cards
best-rated under $5,000 carousel
6 product cards
best-rated under $10,000 carousel
remaining product cards
```

When the user searches or selects any filter, the carousels are hidden and the page switches to a focused results grid.

## Tradeoff

The main tradeoff is keeping search client-side. It is the right fit for a 4,000 product task because it is fast and inspectable. If the catalog grew much larger, or needed typo tolerance, synonyms, semantic matching, personalization, or analytics-driven ranking, the next step would be an indexed search backend using this scoring model as the relevance spec.
