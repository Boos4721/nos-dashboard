# nos-dashboard

High-end public infrastructure dashboard for TYSJ / NOS-style network operations, chain telemetry, global datacenter visibility, and ecosystem entry routing.

## Overview

`nos-dashboard` is a polished Next.js App Router frontend built to present:

- global datacenter distribution
- live-feeling chain telemetry
- command center situational awareness
- ecosystem entry portals
- wallet connection for NOS Chain
- dual-theme premium UI inspired by products like qu.ai and modern AI / infra control surfaces

The project intentionally avoids mining-sensitive wording in the UI and reframes the public surface around compute, operations, infrastructure, monitoring, and chain telemetry.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- custom SVG / CSS motion system
- live chain telemetry via `/api/chain`
- native injected wallet integration via `window.ethereum`

## Main Features

### 1. Premium landing experience
- dark / light dual themes
- animated loading overlay
- scroll-reactive gradient field and ambient aurora motion
- premium glass / grid / telemetry hybrid visual language
- animated hero signal panel with marquee status feed

### 2. Command center surface
- homepage command center block with situational metrics
- tactical event stream with severity glow states
- animated coordination matrix and orchestration cards
- stronger “ops room / global screen” storytelling for NOS Chain

### 3. Global operations map
- custom SVG world operations map
- selected-node emphasis with pulse rings and route glow
- animated route beams and telemetry-like overlays
- map click selects regions only; server list opens explicitly
- Chinese localization for labels, regions, node names, and status copy
- command-center status chips integrated into the map surface

### 4. Chain telemetry panel
- `/api/chain` endpoint-backed chain status area
- recent block / transaction display
- localized section labels for Chinese pages
- resilient loading / offline presentation
- local mode uses real chain data; GitHub Pages uses static-friendly fallback behavior

### 5. Wallet access layer
- detects injected wallet provider
- connect wallet flow
- switch to NOS Chain prompt
- richer wallet shell with animated status ribbon and action sheen
- monitoring page launch entry
- localized Chinese wallet copy

### 6. Ecosystem routing
- official site
- NOS ecosystem portals
- NOS Scan explorer
- Web3S Box
- NOS Monitor DApp

## UI / UX Direction

The current visual direction emphasizes:

- high-end infra / AI-console atmosphere
- stronger motion layering without hurting readability
- premium dark glass mixed with grid telemetry surfaces
- localized Chinese-first polish where appropriate
- NOS Chain branding instead of internal chain-number language

Recent UX upgrades include:

- homepage command-center section now directly embedded in the landing flow
- hero upgraded with signal panel, badges, ambient aurora, and scrolling control-feed motion
- wallet card upgraded with more tactical status presentation and richer hover feedback
- command-center cards now feel more alive through pulse, drift, grid, and severity-based motion
- all public chain-switching copy aligned to “NOS 链 / NOS Chain”

## Localization

The UI supports:

- English (`en`)
- Chinese (`zh`)

Recent work focused heavily on making the Chinese experience cleaner by removing remaining English labels from hero stats, map panels, telemetry headers, wallet UI, and ecosystem routing blocks.

## Dynamic Data Model

The dashboard mixes:

- real chain-facing data for telemetry via `/api/chain`
- live or simulated datacenter metrics depending on environment
- animated frontend-only presentation layers for motion, route pulse, and homepage signal storytelling

### Environment split

- **local / server deployment**: homepage consumes real chain state from `useChainData()` and live datacenter behavior from `useLiveDatacenters()`
- **GitHub Pages**: static demo mode uses simulation/fallback-friendly values so the UI remains polished on a static host

This lets the same design work both as:

- a real chain-aware public dashboard
- a static GitHub Pages showcase

## Project Structure

```text
src/
  app/
    api/chain/              # chain telemetry endpoint
    globals.css             # theme variables, animations, global utilities
    page.tsx                # homepage composition + environment-aware data flow
  components/
    Header.tsx
    HeroSection.tsx
    ChainTelemetry.tsx
    CommandCenterPanel.tsx  # homepage command-center situation surface
    WorldMap.tsx
    ServerPanel.tsx
    WalletConnectCard.tsx
    EcosystemLinks.tsx
    AccessCTA.tsx
    Footer.tsx
    LoadingOverlay.tsx
  content/
    commandCenter.ts        # command-center signals/events
    datacenters.ts          # datacenter definitions + dynamic simulation/live hook
    servers.ts              # server inventory / roles
    products.ts             # ecosystem routing cards
    site.ts                 # site copy
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

Example restart pattern:

```bash
fuser -k 3000/tcp || true
npm run start -- --hostname 0.0.0.0 --port 3000
```

Project-specific production restart helper:

```bash
/root/nos-dashboard/scripts/restart-prod.sh
```

### 2. GitHub Pages deployment via CI
The repo includes a GitHub Actions workflow for GitHub Pages.

Important limitation:
- GitHub Pages is a static deployment target
- the visual dashboard works there
- the in-repo `/api/chain` route does not run on Pages
- in Pages mode, telemetry and homepage hero use static-safe simulated values rather than breaking

After pushing to `main`, enable Pages in the GitHub repository settings and choose:
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

## Product Conventions

Important product conventions currently reflected in the codebase:

- Chinese pages should avoid unnecessary English where possible
- map clicks select regions only; server list opens through a dedicated CTA
- public copy should avoid sensitive mining terminology
- premium visual direction should stay close to high-end AI / infra dashboards
- wallet integration remains lightweight and avoids heavy web3 UI libraries
- public branding should use **NOS 链 / NOS Chain**, not “链 13 / Chain 13” in user-facing UI

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Suggested Next Technical Work

- connect more homepage motion blocks to true monitoring backends
- upgrade `ServerPanel` into a fully embedded datacenter detail surface on the homepage
- wire in role-based dashboard views using the existing role scaffolding
- add visual regression screenshots for future design iterations
- document screenshots / deployment examples for future maintainers

## Repository

Target GitHub remote expected by the user:

```text
git@github.com:Boos4721/nos-dashboard.git
```

## License

Private project / internal use unless the repository owner states otherwise.
