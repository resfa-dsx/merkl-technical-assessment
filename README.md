# Merkl Opportunities

A small SSR explorer for Merkl opportunities. It exposes opportunity list and detail endpoints through the application API, then presents them through a filtered list and detail page.

## Stack

- TanStack Start and TanStack Router for file-based routes, SSR, server functions, and API handlers.
- TanStack Query for route data, hydration, and client-side query caching.
- React and Tailwind CSS for the UI.
- Zod for request, URL search parameter, and Merkl response validation.
- Vitest for focused unit tests around caching, mapping, validation, API errors, and query keys.

## Getting Started

Requirements: Node.js and pnpm. This project was developed with Node.js `v24.18.0` and pnpm `10.30.3`. No environment variables are required; the Merkl API base URL is configured in the server client.

```bash
pnpm install
pnpm dev
```

The development server runs on `http://localhost:3000`.

Useful checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Architecture

The UI and public API share one opportunity service, so both use the same mapping and cache policy.

```text
SSR route loader / browser navigation
  -> TanStack Query
  -> TanStack Start server function
  -> OpportunityService
  -> MemoryCache
  -> Merkl API

GET /api/opportunities[/:id]
  -> TanStack Start API handler
  -> OpportunityService
  -> MemoryCache
  -> Merkl API
```

`src/features/opportunities` contains UI components, app-facing DTOs, query options, server functions, and Zod schemas. Route files only compose those pieces and render route states.

`src/server/opportunities` owns the application service and HTTP error mapping. `src/server/merkl` owns upstream requests, response validation, and mapping from Merkl payloads to the smaller DTOs consumed by the UI. `src/server/cache` is a small generic in-memory cache used by the service.

The Merkl client requests `/v4/opportunities/` for lists and `/v4/opportunities/:id/campaigns?campaigns=true` for details. It uses an 8-second timeout, validates successful payloads with Zod, and turns upstream failures into application errors before they reach the API layer.

## Data Fetching & SSR

Both frontend routes use a TanStack Router loader with `queryClient.ensureQueryData(...)`. The loader uses the same query options that the route component later consumes through `useSuspenseQuery`, so a direct request renders with data available during SSR instead of fetching only after mount.

`setupRouterSsrQueryIntegration` connects the router and Query client. The server-populated Query cache is hydrated into the browser, where the matching `useSuspenseQuery` reads the same key. On client navigation, router loaders run again for the next route or URL state and call the corresponding TanStack Start server function; the frontend does not self-fetch the internal `/api` routes.

The two server functions are `getOpportunityList` and `getOpportunityDetail`. They validate their input and call the shared service. The detail function converts a genuine Merkl 404 into TanStack Router's not-found state.

## Caching

There are two cache layers with separate responsibilities:

- The server-side `MemoryCache`, owned by the singleton `OpportunityService`, caches list responses and detail responses for 60 seconds. It holds at most 100 completed entries, removes expired entries lazily, evicts the oldest entry at capacity, and deduplicates concurrent loads for the same key.
- TanStack Query caches the application DTOs in the browser (and during SSR) for 60 seconds via `staleTime`.

List cache keys are canonicalized from the normalized query using sorted `URLSearchParams`, for example `opportunities:list:action=LEND&chainId=1&...`. Detail keys use `opportunities:detail:<id>`. A server cache hit returns the mapped DTO immediately; a miss issues one Merkl request and stores the result. This avoids repeated upstream calls from both frontend navigation and the internal API routes while an entry is fresh.

The server cache is process-local and intentionally simple. It is not shared between application instances and has no explicit invalidation mechanism beyond TTL expiry.

## API

`GET /api/opportunities`

Returns a page of mapped opportunity summaries. Supported query parameters are `search`, `chainId`, `protocol`, `action`, `status`, `minimumTvl`, `sort`, `order`, and `page`. Invalid input returns a stable `400` error shape. The page size is fixed at 20.

`GET /api/opportunities/:opportunityId`

Returns one mapped opportunity detail including campaign information. The application accepts decimal IDs from 1 to 20 digits. Invalid IDs return `400`; a missing upstream opportunity returns `404`.

## Filtering

The list UI exposes search, chain, protocol, action, and a combined sort/order selector. Search is debounced by 350 ms; selects navigate immediately. The active state is stored in TanStack Router search parameters, with `status=LIVE`, `sort=apr`, `order=desc`, and `page=0` as defaults. Pagination updates only `page` while retaining the current filters.

`opportunitySearchSchema` normalizes browser URL values and falls back field-by-field for invalid values. The stricter `opportunityListQuerySchema` validates server-function and HTTP API input before it reaches the service. The API also accepts `status` and `minimumTvl`, although they are not exposed as list UI controls.

## Project Structure

```text
src/
  routes/
    opportunities/                 # SSR list and detail pages
    api/opportunities/             # GET API routes
  features/opportunities/
    api/                           # TanStack Start server functions
    components/                    # list, filters, detail UI
    queries/                       # Query keys and options
    schemas/                       # Zod input/search validation
    types/                         # application DTOs
  server/
    opportunities/                 # shared service and HTTP handlers
    merkl/                         # upstream client, schemas, mappers
    cache/                         # TTL in-memory cache
  integrations/tanstack-query/     # QueryClient router context
```

## Trade-offs

- The cache is in-memory and process-local, which keeps the implementation small but does not coordinate multiple instances.
- Pagination uses Merkl's page parameter and a fixed page size; there is no total result count.
- The list controls cover the most useful filters for the UI. Additional supported API parameters remain available through the API but are not surfaced in the interface.
- The app has no persistence, authentication, or deployment infrastructure; those are outside the case's scope.

## Possible Improvements

- Add a shared cache implementation and invalidation strategy when running more than one application instance.
- Add route-level integration tests for SSR, not-found, and filter-navigation flows.
- Derive filter option lists from a maintained source instead of the small static UI catalog.
