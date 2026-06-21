# ClearGrid — Full System Build Prompt
## The Actual Product: Data Pipeline + ML + Backend + Live Mappls Integration
### Flipkart Gridlock Hackathon 2.0 — Bengaluru Traffic Police × MapMyIndia (Mappls)

---

## 0. HOW THIS FITS WITH WHAT YOU ALREADY HAVE

You already have `cleargrid_build_prompt.md` — that one builds the **marketing/showcase website**: a single static page with mocked numbers and a decorative SVG map, meant to sell the idea to judges in 10 seconds of scrolling. It explicitly says "do NOT make live API calls."

This prompt builds **the thing that actually exists behind that marketing page** — the real system:

- A real data pipeline that cleans and transforms 298,450 violation rows into model-ready tables.
- Ten real ML/algorithmic models, one per feature.
- A real backend (FastAPI) that serves predictions over REST.
- A real working dashboard, wired to a real Mappls map, with real markers, real routes, and real distance-matrix calls.
- A deployment plan so judges can click a live URL instead of looking at screenshots.

**Give your agentic AI tool BOTH files.** This one is the engine room. The other one is the show floor. The dashboard preview mockup in Section 6 of the marketing prompt is what Section 9 of this prompt makes real.

Treat this as two codebases or two folders in one repo: `/marketing-site` (already specced) and `/cleargrid-app` (this prompt). Do not let the agent merge them into one Vite project — they have different goals (one is static and animation-heavy, the other is a real client talking to a real API).

---

## 1. SYSTEM ARCHITECTURE

```
                       ┌─────────────────────────┐
                       │   parking_violations.csv │
                       │   298,450 rows × 24 cols │
                       └────────────┬────────────┘
                                    │
                          [ETL / Cleaning Pipeline]
                                    │
                    ┌───────────────┴───────────────┐
                    │      Feature Store (DuckDB)     │
                    │  violations_clean, junction_agg,│
                    │  vehicle_features, archetypes,  │
                    │  dwell_distributions, baselines │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                       │
      [Batch ML Jobs]        [Backend API]           [Mappls APIs]
      (run on startup /      FastAPI, serves          Routing, Distance
       nightly cron)         10 endpoints             Matrix, Nearby/POI,
      - clustering           over the feature          Geocoding, VRP,
      - CUSUM baselines       store + live calls        Traffic, Maps SDK
      - dwell percentiles     to Mappls
      - chokepoint scores
              │                     │                       │
              └─────────────────────┼───────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │   React Dashboard     │
                         │   (real Mappls map,   │
                         │   real markers, real   │
                         │   tab data)            │
                         └───────────────────────┘
```

---

## 2. TECH STACK (and why)

| Layer | Choice | Why |
|---|---|---|
| ML / Data | Python — pandas, scikit-learn, HDBSCAN, Prophet, NetworkX/OSMnx, OR-Tools, h3-py | Every algorithm needed (clustering, time-series, graph topology, VRP) has a mature, fast-to-implement Python library. No reason to fight this in JS. |
| Backend | **FastAPI** | Auto-generates interactive docs (`/docs`) which judges and teammates can poke at live — free demo surface. Async-friendly for calling Mappls APIs without blocking. Typed request/response models via Pydantic catch bugs early. |
| Feature store / DB | **DuckDB** (file-based) for the hackathon; swap for Postgres+PostGIS only if you have time to spare | Zero setup, queries a 300K-row table in milliseconds, supports SQL directly on Parquet/CSV. You don't need a running database server for a 3-day build. |
| Caching | In-memory `functools.lru_cache` / simple dict with TTL for Mappls responses | Mappls calls cost quota and latency. Cache distance-matrix and routing results — junction pairs don't change between requests. |
| Maps | **Mappls Web SDK** (real, not the marketing site's SVG) | This is the actual MapMyIndia integration the hackathon brief is judging you on. |
| Frontend (dashboard) | React (Vite) + a thin fetch/React Query layer | Keep it separate from the marketing site's animation-heavy build. |
| Deployment | Backend → **Render** or **Railway** (free Python web service); Frontend → **Vercel** | Both support zero-downtime redeploys from `git push`, which matters when you're iterating against a clock. |

If your agentic AI tool defaults to Node/Express for the backend, override it — the ML stack lives in Python and you don't want a second runtime managing model state over a REST bridge.

---

## 3. REPOSITORY STRUCTURE

```
cleargrid-app/
├── data/
│   ├── raw/parking_violations.csv
│   └── processed/cleargrid.duckdb
├── pipeline/
│   ├── clean.py                # ETL: raw csv -> violations_clean table
│   ├── feature_engineering.py  # builds junction_agg, vehicle_features
│   └── run_pipeline.py         # orchestrates the above
├── models/
│   ├── archetype_clustering.py
│   ├── chokepoint_scoring.py
│   ├── timeseries_forecast.py
│   ├── cascade_detection.py
│   ├── emerging_hotspot_cusum.py
│   ├── perishable_alert.py
│   ├── route_risk.py
│   ├── vrp_scheduler.py
│   ├── legal_parking_gap.py
│   └── traffic_sensor_inference.py
├── mappls/
│   ├── client.py                # auth + wrapped calls to all Mappls APIs
│   └── cache.py
├── api/
│   ├── main.py                  # FastAPI app, mounts all routers
│   └── routers/
│       ├── hotspots.py
│       ├── archetypes.py
│       ├── chokepoints.py
│       ├── alerts.py
│       ├── cascade.py
│       ├── emerging.py
│       ├── route_risk.py
│       ├── dispatch.py
│       ├── parking_gap.py
│       └── traffic_sensor.py
├── dashboard/                    # React app, the REAL working UI
│   └── ... (see Section 9)
├── requirements.txt
└── README.md
```

---

## 4. DATA PIPELINE (`pipeline/`)

### 4.1 Cleaning (`clean.py`)

Your CSV has known issues — handle these explicitly, don't let the agent silently `dropna()` everything:

- `closed_datetime`, `action_taken_timestamp`, `center_code` are mostly null/float — these are **legitimately missing for unresolved violations**, not data errors. Keep nulls; compute dwell time only where `closed_datetime` exists.
- `vehicle_number` will have OCR-style inconsistencies (mixed case, spaces, similar-looking character swaps like O/0, I/1). Normalize: uppercase, strip whitespace, regex-validate against Indian plate format (`^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$`), flag invalid ones into a `vehicle_number_confidence` column rather than dropping the row — you still want the violation for spatial/temporal analysis even if the plate is unreadable.
- Prefer `updated_vehicle_number`/`updated_vehicle_type` over the raw fields when populated (these are the corrected values).
- Parse all datetime columns with explicit format, coerce errors to `NaT`, log how many failed.
- Derive: `hour_of_day`, `day_of_week`, `is_weekend`, `dwell_minutes = closed_datetime - created_datetime` (only where both exist).
- Deduplicate on `id`.
- Output: `violations_clean` table in DuckDB.

### 4.2 Spatial binning

Use **H3 hexagons** (`h3-py`), resolution 9 (~0.1 km² cells) for all spatial aggregation instead of raw lat/lon or junction name strings (junction names will have spelling variants — "MG Road Jn" vs "M.G Road Junction"). H3 gives you a stable join key for everything downstream: hotspot density, cascade detection, CUSUM baselines.

```python
import h3
df["h3_cell"] = df.apply(lambda r: h3.latlng_to_cell(r.latitude, r.longitude, 9), axis=1)
```

Still keep `junction_name` as a human-readable label by taking the mode junction name per `h3_cell`.

### 4.3 Feature engineering (`feature_engineering.py`)

Build these tables once, store them in DuckDB, and have every model read from them instead of recomputing:

- `junction_agg`: per `h3_cell` — violation count, density rank, dominant vehicle_type, dominant hour-of-day, weekday/weekend split.
- `vehicle_features`: per `vehicle_number` — violation count, set of distinct `h3_cell`s visited, dominant vehicle_type, dominant hour bucket, dominant zone-type (commercial/residential/metro — see 5.2), weekday vs weekend ratio. This table is the input to archetype clustering — **note it is vehicle-level, not row-level**, which is what keeps this privacy-safe (per the original design: archetypes, not individual tracking).
- `dwell_distributions`: per (`vehicle_type`, `h3_cell` cluster, hour bucket) — median, p80, p95 of `dwell_minutes` from resolved violations. Input to the Perishable Alert Score.

---

## 5. ML MODELS — ONE PER FEATURE

Each subsection: **Goal → Input → Method → Output → Library → Notes**. These map directly to the 10 features you confirmed as must-haves.

### 5.1 Hotspot Heatmap (foundation layer — everything else depends on this)

- **Goal:** Rank every location by violation density, decayed by recency.
- **Input:** `junction_agg`, with a time decay so a hotspot that was bad 8 months ago and quiet since doesn't outrank one that's hot this week.
- **Method:** Weighted count per `h3_cell`, weight = `exp(-λ × days_since_violation)`, λ tuned so a violation from 90 days ago counts ~half as much as one from today. Bucket into High/Medium/Clear by tertile or fixed thresholds.
- **Output:** `{h3_cell, lat, lng, score, tier, junction_name}[]`
- **Library:** pandas/numpy only.
- **Notes:** This is your `/api/hotspots` endpoint and the foundation every other model joins against.

### 5.2 Vehicle Archetype Fingerprinting

- **Goal:** Cluster vehicles into behavioral archetypes (not individuals) — e.g. "delivery 4-wheelers, commercial zones, 10am–2pm weekdays."
- **Input:** `vehicle_features` table (vehicle-level, aggregated — never feed the clusterer a raw vehicle_number-to-location row, that's tracking, not archetyping).
- **Method:** Encode categorical features (vehicle_type, dominant zone-type) one-hot, scale numeric features, run **HDBSCAN** (don't pre-commit to a fixed K like KMeans — let density find natural archetype counts; fall back to KMeans with K chosen via silhouette score if HDBSCAN produces a noise-dominated result on this data). Hand-label the resulting clusters by inspecting their centroids (e.g. cluster 2 → "Archetype B: 2-wheelers, metro-adjacent, AM commute").
- **Output:** `vehicle_number → archetype_id` mapping, plus an `archetype_definitions` table (label, dominant features, size, example zones).
- **Library:** scikit-learn, hdbscan.
- **Notes:** "Zone-type" (commercial/residential/metro-adjacent/mall-adjacent) isn't in your CSV — derive it by reverse-geocoding a sample of `h3_cell`s via **Mappls Reverse Geocode / Nearby API** and tagging zone type from the POI categories returned, then propagate that tag to all violations in the same cell. Do this once, cache it — don't call Mappls per-row.

### 5.3 Chokepoint Scoring (the road-topology layer)

- **Goal:** `Chokepoint Score = Violation Density × (1 / Number of Alternative Routes)` — a violation at a single-corridor bottleneck should outrank one at a junction with five bypasses.
- **Input:** Top-N hotspot `h3_cell`s (don't compute this for all 298K rows — compute it for the ~100–300 distinct hotspots, it's a per-location score).
- **Method, two-tier (be honest with the agent about this):**
  1. **Preferred:** Use the **Mappls Routing API** to request routes between a point just before and just after the hotspot, with alternates enabled, and count distinct alternate paths returned.
  2. **Practical fallback (use this if the Mappls routing response doesn't reliably expose multiple alternates for short in-city segments, which is common):** Pull the OpenStreetMap road graph for Bengaluru via **OSMnx**, compute **edge betweenness centrality** and **node degree** at the hotspot's nearest road segment using **NetworkX**. A high-betweenness, low-degree segment IS a chokepoint — this is a legitimate, well-known graph-theory proxy for "few alternatives," and it's free, offline, and won't burn API quota during development.
  - Recommendation: build the OSMnx fallback first since it's deterministic and free, then layer the Mappls routing call on top for the live demo if quota allows, and **say so explicitly in your judge-facing writeup** — judges respect "we used graph topology + verified against Mappls live routing" more than a black-box number.
- **Output:** `{h3_cell, violation_density, alt_route_estimate, chokepoint_score}[]`
- **Library:** osmnx, networkx; `requests`/Mappls SDK for the live-routing tier.

### 5.4 Time-Series Prediction per Junction

- **Goal:** "Where will violations happen in the next 2 hours."
- **Input:** Hourly violation counts per `h3_cell`, for the top ~50–100 hotspots (forecasting all 300K+ unique cells is wasted compute — focus on the ones that matter).
- **Method:** **Prophet** per junction with weekly + daily seasonality, OR — faster to train at this scale and easier to combine with other features later — a single **gradient-boosted model (XGBoost/LightGBM)** with features `hour, day_of_week, h3_cell (encoded), rolling_7d_avg, is_holiday`, predicting violation count in the next 2-hour window. Recommend the GBM approach: one model instead of 100 Prophet models, trains in seconds, and you can feed archetype-arrival-probability in as a feature directly.
- **Output:** Predicted violation count/probability per hotspot for the next several 2-hour windows.
- **Library:** lightgbm or xgboost; statsmodels/prophet if you prefer the classical route.

### 5.5 Cascade Prediction (seed vs follower detection)

- **Goal:** Detect the *first* violation in a cluster (the "seed") before 4–6 followers pile on.
- **Input:** `violations_clean`, sorted by `h3_cell` + `created_datetime`.
- **Method:** Within each `h3_cell`, run a sliding 15–30 minute window. The first violation in a window where ≥3 more follow within that window is labeled `seed`; the rest in that window are `cascade_follower`. Compute, per `h3_cell`, the historical **cascade rate** (avg. followers per seed) and **median time-to-cascade**. This is the same idea as DBSCAN in space-time, but a sliding window is simpler to implement correctly under deadline and just as defensible — only switch to DBSCAN(eps=time+space) if you have spare time to validate it properly.
- **Output:** Real-time: when a new violation lands in a cell with no other recent violation in the window, flag it `seed_candidate` with the cell's historical cascade rate and recommended dispatch window.
- **Library:** pandas (groupby + rolling window logic).

### 5.6 Emerging Hotspot Early Warning (CUSUM)

- **Goal:** Flag a location whose violation rate is statistically deviating from its own baseline *before* it becomes a chronic hotspot.
- **Input:** Daily violation counts per `h3_cell`, last 7 days vs. trailing 8–12 week baseline mean/std for that cell.
- **Method:** Classic CUSUM control chart:
  ```
  S_t = max(0, S_(t-1) + (x_t - μ_baseline - k))
  ```
  where `k` is a small slack (e.g. 0.5σ) and you alert when `S_t` exceeds a threshold `h` (e.g. 4–5σ). Run this nightly per cell.
- **Output:** `{h3_cell, current_week_pct_of_baseline, triggered: bool, days_until_likely_chronic}`
- **Library:** numpy/pandas — this is ~30 lines, no special library needed.

### 5.7 Perishable Alert Score

- **Goal:** "Will the car still be there by the time an officer arrives?"
- **Input:** `dwell_distributions` (median/p80/p95 dwell time by vehicle_type + cell-cluster + hour bucket), plus live inputs: time since report, officer ETA (from Mappls).
- **Method:** Treat historical dwell time as an empirical survival distribution for that profile. `P(still present at arrival) = P(dwell_minutes > time_since_report + officer_eta)`, read off the empirical CDF for that profile (or fit a simple Weibull/log-normal to it if you want a smooth curve instead of a step function — Kaplan-Meier via `lifelines` if you want to be rigorous about right-censored dwell times, i.e. violations that were never closed).
- **Output:** `{violation_id, probability_present, recommendation: "DISPATCH NOW" | "LOW PRIORITY"}`
- **Library:** lifelines (for proper survival-curve handling of censored data) or a straight percentile lookup if time-boxed.
- **Notes:** Officer ETA for this comes from **Mappls Distance Matrix API** (current officer/device location → violation location).

### 5.8 Route Risk Score (commuter-facing)

- **Goal:** Given origin → destination, score the route's parking-congestion risk and suggest an alternative.
- **Input:** Route polyline from **Mappls Routing/Directions API**, buffered by ~100m, intersected against the hotspot table (5.1) filtered by current time-of-day/day-of-week pattern.
- **Method:** For each hotspot whose `h3_cell` falls within the route buffer, weight its score by how well its historical time-of-day pattern matches the query time. Sum into an overall route risk score (0–100) and surface the top contributing hotspots. Call Mappls Routing again with an "avoid" hint or a manually chosen alternate corridor to compute the comparison route.
- **Output:** `{risk_score, contributing_hotspots[], alt_route: {risk_score, extra_minutes}}`
- **Library:** Shapely for the buffer/intersection geometry; Mappls Routing API for the actual route geometry and ETA.

### 5.9 VRP Enforcement Scheduler

- **Goal:** Given N officers, M high-risk junctions with predicted risk windows, and travel times between them — output an optimal per-officer route and timing.
- **Input:** Top-K junctions for the shift (from 5.4's forecast), travel time matrix between all of them (from **Mappls Distance Matrix API**, or **Mappls's own VRP API** — they expose one directly, see Section 6 — use it if its constraints fit, since it already accounts for live/historic traffic).
- **Method:** If using Mappls's native VRP API, feed it directly — it's purpose-built for exactly this (fleet of vehicles, set of stops, time windows). If building your own for full control over the objective (e.g. weighting by predicted violation yield, not just minimizing distance), use **Google OR-Tools**' `routing` module: officers = vehicles, junctions = nodes with time windows derived from the risk forecast, objective = minimize total travel time while maximizing coverage of high-risk windows.
- **Output:** Per-officer ordered stop list with arrival times.
- **Library:** ortools, or Mappls VRP API directly.

### 5.10 Legal Parking Gap Analysis

- **Goal:** Classify each hotspot as Case A (parking exists, awareness problem), B (no parking nearby, infrastructure problem), or C (parking exists but always full, capacity problem).
- **Input:** Hotspot `h3_cell`s, queried against **Mappls Nearby/Place Search API** filtered to parking-lot POI category, radius ~300–500m.
- **Method:** No parking POI within radius → Case B. Parking POI exists → Case A by default; without live occupancy data (not in your dataset or Mappls' free tier, likely), you can't empirically prove "always full" (Case C) — be upfront about this in the build: either (a) leave Case C as a flagged hypothesis pending real occupancy sensors, or (b) approximate it using violation density immediately adjacent to a *known* legal lot's entrance as a weak proxy for overflow (cars circling/parking right next to a full lot). Don't fabricate a confident Case C without real signal.
- **Output:** `{h3_cell, case: "A"|"B"|"C"-hypothesis, nearest_legal_parking: {distance_m, name}}`
- **Library:** Mappls Nearby API; geopy for distance.

### 5.11 Violation-as-Traffic-Sensor Inference

- **Goal:** Infer congestion level on road segments with no official traffic sensor, using violation density as a proxy.
- **Input:** Violation rate per `h3_cell` per hour, vs. that cell's own baseline rate (reuse the CUSUM baseline from 5.6).
- **Method:** `congestion_ratio = current_hour_rate / baseline_rate`. Map ratio to an LOS-style grade (A–F) via fixed thresholds (e.g. ratio > 3.0 → D/F). **Cross-check, don't blindly trust**: where Mappls' **Traffic API** does cover a segment, compare your inferred grade against their reported flow/speed data for validation — present the correlation (or lack of it) honestly to judges rather than asserting the inference is proven.
- **Output:** `{h3_cell, congestion_ratio, inferred_grade, validated_against_mappls: bool}`
- **Library:** pandas; Mappls Traffic API for the optional validation step.

---

## 6. MAPPLS (MAPMYINDIA) INTEGRATION MAP

| Feature | Mappls API used | Purpose |
|---|---|---|
| Hotspot Heatmap, all map views | **Maps SDK (Web)** | Renders the live map itself — replace the dashboard's any-mocked map with this real SDK. |
| Vehicle Archetypes | **Reverse Geocode / Nearby API** | One-time zone-type tagging of hotspot cells (commercial/residential/metro-adjacent). |
| Chokepoint Scoring | **Routing API** (primary), OSMnx fallback | Alternate-route count per hotspot. |
| Perishable Alert | **Distance Matrix API** | Officer-to-violation ETA. |
| Route Risk Score | **Routing/Directions API** | Commuter route polyline + alternate route + ETA. |
| VRP Scheduler | **Distance Matrix API** or native **VRP API** | Travel times between junctions; or hand the whole optimization to Mappls' VRP endpoint. |
| Legal Parking Gap | **Nearby / Place Search API** | Find parking-lot POIs near each hotspot. |
| Traffic Sensor Inference | **Traffic API** | Optional validation of the inferred congestion grade. |

**Auth note:** Mappls APIs use an OAuth2 client-credentials token flow (you exchange a client ID/secret for a short-lived bearer token, then attach it to each REST call). Exact token endpoint and refresh behavior occasionally change — have the agent pull the current flow from `https://about.mappls.com/api/` / the developer console at signup time rather than hardcoding a remembered URL. Wrap this in `mappls/client.py` as a single class that handles token refresh transparently so no model code touches auth directly.

**Quota discipline:** cache every Mappls response keyed by `(api, input_params, day)` — chokepoint and parking-gap lookups are computed once per hotspot and rarely change; only route-risk and perishable-ETA calls are genuinely live per-request.

---

## 7. BACKEND API CONTRACT (FastAPI)

```
GET  /api/hotspots                       → [{h3_cell, lat, lng, score, tier, junction_name}]
GET  /api/archetypes                     → [{archetype_id, label, size, dominant_features}]
GET  /api/archetypes/{vehicle_number}    → {archetype_id, label, arrival_probability_by_zone}
GET  /api/chokepoints                    → [{h3_cell, violation_density, alt_routes, score}]
GET  /api/forecast/{h3_cell}             → [{window_start, window_end, predicted_count}]
GET  /api/cascade/active                 → [{h3_cell, seed_violation_id, cascade_rate, eta_minutes}]
GET  /api/emerging                       → [{h3_cell, pct_of_baseline, triggered, junction_name}]
POST /api/alerts/perishable              → body: {violation_id} → {probability_present, recommendation}
POST /api/route-risk                     → body: {origin, destination, datetime} → {risk_score, contributing_hotspots, alt_route}
POST /api/dispatch/schedule              → body: {officers[], shift_start, shift_end} → {officer_id: [stops]}
GET  /api/parking-gap                    → [{h3_cell, case, nearest_legal_parking}]
GET  /api/traffic-inference/{h3_cell}    → {congestion_ratio, inferred_grade}
```

Every router in `api/routers/` is thin — it reads from the precomputed feature store/model output for batch features, and calls the relevant `mappls/client.py` method for the live ones (route-risk, dispatch, perishable ETA).

---

## 8. BATCH vs REAL-TIME

| Runs once at startup / nightly cron | Runs live per request |
|---|---|
| Data cleaning + feature engineering | Perishable alert (needs current time + live ETA) |
| Archetype clustering | Route risk score (commuter query) |
| Chokepoint scoring | VRP dispatch (run on-demand per shift, not continuously) |
| CUSUM baselines + emerging hotspot scan | |
| Time-series forecast (recompute every few hours) | |
| Cascade historical rates | |
| Legal parking gap classification | |

Wire the batch jobs behind a single `pipeline/run_pipeline.py` you can re-run manually before a demo to refresh everything from the latest data snapshot.

---

## 9. FRONTEND INTEGRATION (wiring the dashboard to real data)

The marketing site's Section 6 "Dashboard Preview" is a static mockup with hardcoded tab content. For the real working app:

1. Build `dashboard/` as its own React app (or a `/dashboard` route if you want one deploy, but keep the component tree separate from the marketing site's).
2. Replace the static SVG/canvas map with the **Mappls Web SDK** map component. Plot real markers from `GET /api/hotspots`, colored by `tier` exactly per the existing pulse-ring visual language (red/amber/green) so the two surfaces feel like one product.
3. Each of the 4 dashboard tabs (Hotspot Map, Officer Dispatch, Route Risk, Alerts) calls its corresponding endpoint from Section 7 instead of rendering hardcoded JSX.
4. Keep the visual design system (glass cards, color palette, fonts, pulse rings) identical to the marketing prompt's spec — same `--accent-*` variables, same glassmorphism rules — so judges feel zero seam between "the pitch" and "the product."
5. Loading and empty states matter here: a judge will click around live. Show skeleton/glass-shimmer states while `/api/*` calls resolve, and a clear empty state if a forecast/cascade endpoint has nothing active right now (don't let it look broken).

---

## 10. DEPLOYMENT

1. **Backend:** Push `cleargrid-app/` (minus `/dashboard`) to its own Render or Railway web service. Set `MAPPLS_CLIENT_ID`/`MAPPLS_CLIENT_SECRET` as environment secrets, never commit them. Mount `data/processed/cleargrid.duckdb` as part of the build (it's small enough to ship in the repo/image) or regenerate it on first boot via `run_pipeline.py`.
2. **Frontend dashboard:** Deploy to Vercel, with `VITE_API_BASE_URL` pointing at the deployed backend.
3. **Marketing site:** Deploy separately to Vercel/Netlify — it has zero backend dependency by design.
4. Smoke-test all 10 endpoints against the deployed backend before the demo — `/docs` (FastAPI's auto Swagger UI) is your fastest way to verify each one returns real data, not stub JSON, right before you present.

---

## 11. BUILD ORDER

You confirmed every feature is a must-have, so this is a sequencing recommendation, not a cut list — build in this order because each layer is the input to the next one:

1. **Data pipeline + Hotspot Heatmap** — nothing else works without `junction_agg` and the H3 binning.
2. **Chokepoint Scoring** — second cheapest, makes the heatmap topologically meaningful immediately.
3. **Mappls map wired into the dashboard**, showing real hotspot + chokepoint markers — get something real on screen early.
4. **Vehicle Archetype Fingerprinting** — needs the zone-tagging step, budget real time for the Mappls reverse-geocode pass.
5. **Time-Series Forecast** + **Cascade Detection** + **Emerging Hotspot CUSUM** — these three share the same temporal-aggregation groundwork, build together.
6. **Perishable Alert Score** — depends on dwell distributions from step 1's pipeline, otherwise standalone.
7. **Route Risk Score** — first feature requiring a live Mappls routing call from the dashboard; good integration test for your Mappls client wrapper.
8. **VRP Dispatch Scheduler** — most complex single feature, do it once everything feeding it (forecast, junction list) is stable.
9. **Legal Parking Gap Analysis** — independent, can be parallelized with anyone free on the team.
10. **Traffic Sensor Inference** — cheapest, do it last as a polish/novelty feature for the judge pitch.

---

## 12. DATA QUALITY GUARDRAILS (tell the agent this explicitly)

- Never silently drop rows with null `closed_datetime`/`action_taken_timestamp` — these are meaningful "not yet resolved" states, not corrupt data.
- Never cluster on raw per-violation rows for archetypes — aggregate to vehicle level first, or you've built individual tracking, not archetyping.
- Don't assert Case C (capacity problem) in Legal Parking Gap without real occupancy signal — flag it as a hypothesis, not a finding.
- Don't claim the Traffic Sensor Inference is "proven" — present it as a correlation/validation against whatever ground truth Mappls' Traffic API actually covers for your area, and say plainly where it doesn't.
- Log how many rows fail datetime parsing and vehicle-plate normalization — report this number in your hackathon writeup; judges trust teams who show their data-quality work.

---

## 13. WHAT "DONE" LOOKS LIKE FOR THE DEMO

A judge should be able to:
1. Open the live dashboard URL (not localhost, not screenshots).
2. See a real Mappls map with real pulsing hotspot markers, colored by tier.
3. Click a hotspot and see its chokepoint score and archetype breakdown.
4. Type a Bengaluru origin/destination into the Route Risk tab and get back a real Mappls-routed risk score with an alternate route.
5. Open the Alerts tab and see at least one live Perishable Alert Score computed from the actual dwell-time distribution.
6. Hit "Generate Schedule" on the Dispatch tab and get back a real VRP-optimized officer route, not a hardcoded one.

That's the bar: every tab, real data, real Mappls calls, nothing hardcoded except seed/demo officer profiles (you don't have real officer GPS feeds, so simulate officer start locations explicitly and say so).

---

## 14. INSTRUCTIONS TO THE AGENT (Cursor / Antigravity)

1. Read this entire prompt and the dataset column list before writing any code.
2. Build and test the data pipeline (`pipeline/`) first, in isolation, against the real CSV — print row counts and null-rate stats after cleaning so a human can sanity-check before anything downstream is built on top of bad data.
3. Build each model in `models/` as a standalone script first (run it, print/plot its output, confirm it looks sane), *then* wire it into a FastAPI router. Don't build the API layer and the model logic in the same pass — debugging is much harder when they're tangled.
4. Stub the Mappls client (`mappls/client.py`) with a mock mode (returns plausible fake responses) so the rest of the team can build against it before real API keys are provisioned. Swap to live calls behind a single `MAPPLS_MOCK=true/false` environment flag.
5. After each model/router is working, write a one-paragraph note in `README.md` under that feature's heading — what it does, what it doesn't do yet, and any known data limitation (this becomes your judge-facing writeup almost for free).
6. Do not invent occupancy, traffic-sensor ground-truth, or officer GPS data that doesn't exist in the source files or Mappls' actual API responses — simulate explicitly-labeled placeholder data where the real prototype would need a live feed, and say so in the README rather than presenting it as real.
