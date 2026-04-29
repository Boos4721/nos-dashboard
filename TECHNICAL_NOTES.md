# Technical Notes

## Architecture

The dashboard is a single-page Next.js App Router application composed from modular presentation components and lightweight client hooks.

### Rendering model
- main landing page rendered through `src/app/page.tsx`
- client-side interaction used for theme switching, wallet detection, map interaction, and in-view reveals
- `/api/chain` provides telemetry data consumed by the chain panel

## Data Sources

### 1. Chain telemetry
The chain telemetry panel reads from `/api/chain` and exposes:
- block height
- gas price
- chain id
- tx count
- block metadata
- recent transactions

### 2. Datacenter activity
`src/content/datacenters.ts` contains:
- static datacenter definitions
- localized names / regions / countries
- `useDynamicDatacenters()` to simulate live movement in hashrate, latency, and node counts

### 3. Server inventory
`src/content/servers.ts` contains role definitions and panel inventory data used by the server drawer.

## Theming

Theme variables are centralized in `src/app/globals.css` using CSS custom properties.

Two supported modes:
- dark
- light

Shared animation / UI primitives include:
- scanline overlays
- route dash animations
- logo sweep animation
- live indicator pulse
- staggered scroll reveal

## Localization Strategy

Localization is lightweight and code-first:
- content objects store `en` / `zh`
- `t()` resolves locale-specific strings
- several UI labels in components are computed inline for tighter control

Chinese pages are intentionally tuned to avoid unnecessary English leakage in:
- hero stats
- map panels
- telemetry section headings
- ecosystem routing cards
- wallet interaction labels

## Wallet Integration

`src/components/WalletConnectCard.tsx` uses native injected provider access via `window.ethereum`.

Supported behaviors:
- detect provider
- connect account
- read active chain
- request chain switch to chain 13
- open external monitoring page

This avoids pulling in heavier web3 UI dependencies like wagmi / rainbowkit for this version.

## Visual Language

The current visual system is built around:
- glassmorphism
- purple / cyan infra glow
- premium grid / telemetry motifs
- network-control-center map presentation
- route highlighting and pulse rings

The header logo now uses a core-node style mark to match the map's selected-node visual language.

## Deployment Pattern

Typical production pattern used during implementation:

```bash
npm run build
fuser -k 3000/tcp || true
npm run start -- --hostname 0.0.0.0 --port 3000
```

Then expose through nginx reverse proxy.

## Known Constraints

- datacenter metrics are still simulated in the frontend
- project directory currently has no `.git` metadata in this environment snapshot
- push / remote operations require the repo to be initialized or recloned as an actual git repository first

## Recommended Follow-up

1. wire real infra APIs into datacenter cards and map
2. add CI / lint policy documentation
3. add screenshots / deploy screenshots to README
4. document nginx production config if this repo will be shared publicly
5. add git repository metadata in the actual project checkout before pushing
