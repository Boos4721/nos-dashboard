# nos-dashboard

High-end public infrastructure dashboard for TYSJ / NOS-style network operations, chain telemetry, global datacenter visibility, and ecosystem entry routing.

## Overview

`nos-dashboard` is a polished Next.js App Router frontend built to present:

- global datacenter distribution
- live-feeling chain telemetry
- ecosystem entry portals
- wallet connection for chain 13
- dual-theme premium UI inspired by products like qu.ai

The project intentionally avoids mining-sensitive wording in the UI and reframes the public surface around compute, operations, infrastructure, and monitoring.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- custom SVG / CSS motion system
- native injected wallet integration via `window.ethereum`

## Main Features

### 1. Premium landing experience
- dark / light dual themes
- animated loading overlay
- layered gradient background motion
- premium glassmorphism panels and telemetry styling

### 2. Global operations map
- custom SVG world operations map
- selected-node emphasis with pulse rings and route glow
- animated route beams and telemetry-like overlays
- server list opens explicitly instead of auto-opening on map click
- Chinese localization for map labels, regions, node names, and status copy

### 3. Chain telemetry panel
- `/api/chain` endpoint-backed chain status area
- recent block / transaction display
- localized section labels for Chinese pages
- resilient loading / offline presentation

### 4. Wallet access layer
- detects injected wallet provider
- connect wallet flow
- chain 13 switch prompt
- monitoring page launch entry
- localized Chinese wallet copy

### 5. Ecosystem routing
- official site
- NOS Miner portal
- NOS Scan explorer
- Web3S Box
- NOS Monitor DApp

## Localization

The UI supports:

- English (`en`)
- Chinese (`zh`)

Recent work focused heavily on making the Chinese experience cleaner by removing remaining English labels from hero stats, map panels, telemetry headers, wallet UI, and ecosystem routing blocks.

## Project Structure

```text
src/
  app/
    api/chain/          # chain telemetry endpoint
    globals.css         # theme variables, animations, global utilities
    page.tsx            # homepage composition
  components/
    Header.tsx
    HeroSection.tsx
    ChainTelemetry.tsx
    WorldMap.tsx
    ServerPanel.tsx
    WalletConnectCard.tsx
    EcosystemLinks.tsx
    AccessCTA.tsx
    Footer.tsx
    LoadingOverlay.tsx
  content/
    datacenters.ts      # datacenter definitions + dynamic simulation hook
    servers.ts          # server inventory / roles
    products.ts         # ecosystem routing cards
    site.ts             # site copy
  lib/
    i18n.ts
    useChainData.ts
    useInView.ts
```

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run production server:

```bash
npm run start -- --hostname 0.0.0.0 --port 3000
```

## Deployment Notes

Current deployment styles supported in this project:

### 1. Standard server deployment
- app binds to `0.0.0.0:3000`
- nginx reverse-proxies external traffic to the app
- public entry has been used behind `https://vpn.boos.lat:8051`

Example restart pattern:

```bash
fuser -k 3000/tcp || true
npm run start -- --hostname 0.0.0.0 --port 3000
```

### 2. GitHub Pages deployment via CI
The repo now includes a GitHub Actions workflow for GitHub Pages.

Important limitation:
- GitHub Pages is a static deployment target
- the visual dashboard works there
- the in-repo `/api/chain` route does not run on Pages
- in Pages mode, the telemetry module falls back to a static-unavailable message instead of hanging or crashing

After pushing to `main`, you can enable Pages in the GitHub repository settings and choose:
- **Source**: GitHub Actions

The workflow will:
- install dependencies
- run a static export build
- upload `out/`
- deploy to GitHub Pages

Expected Pages URL pattern:

```text
https://boos4721.github.io/nos-dashboard/
```

## Dynamic Data Model

The dashboard mixes:

- real chain-facing data for telemetry via `/api/chain`
- simulated-but-dynamic frontend datacenter metrics via `useDynamicDatacenters()`

That simulation intentionally creates non-static movement for:

- hashrate / compute totals
- node count
- latency

This keeps the UI visually alive until a full backend monitoring API is wired in.

## UI / Product Decisions

Important product conventions currently reflected in the codebase:

- Chinese pages should avoid unnecessary English where possible
- map clicks select regions only; server list opens through a dedicated CTA
- public copy should avoid sensitive mining terminology
- premium visual direction should stay close to high-end AI / infra dashboards
- wallet integration remains lightweight and avoids heavy web3 UI libraries

## Suggested Next Technical Work

- replace simulated datacenter metrics with real monitoring APIs
- add richer route particle systems on the map
- add stronger global basemap / geographic layers
- improve wallet success-state visuals and chain feedback
- add screenshot / deployment docs for future maintainers

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Repository

Target GitHub remote expected by the user:

```text
git@github.com:Boos4721/nos-dashboard.git
```

## License

Private project / internal use unless the repository owner states otherwise.
