# Mamitha Baiju — Official Cinematic Portfolio

A high-fidelity, scroll-choreographed cinematic portfolio showcasing the work, roles, and artistry of Indian actress Mamitha Baiju. The experience is tied together by a continuous butterfly stream and a rich editorial visual language.

Built with **React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion**.

---

## Features & Sequence

### 1. Cinematic Landing Sequence
- **Scene I — Eyes in the Rain**: Atmospheric downpour and initial encounter photograph.
- **Scene II — Sheltered from the Storm**: Deep emotional connection and protective embrace photograph.
- **Scene III — When the Rain Softens**: Intimate stillness and emotional reflection photograph.
- **Cinematic Interlude**: Three-part composition featuring the central video flanked by two distinct portrait photographs in saree attire with gentle floating animation and original audio playback.
- **Soundscape Gate**: Seamless *Indrajaalam* music choice screen (*Premalu*) allowing visitors to experience the portfolio with in-page music or silently.

### 2. Main Portfolio Experience
- **Hero Stage**: Central cut-out portrait, floating editorial cards with pointer parallax, and typographic backdrop.
- **Continuous Butterfly Stream**: A 20-butterfly ribbon dynamically choreographed to page scroll distance (`journey`).
- **Interactive Sections**:
  - `01 · Home`: Central portrait and editorial cards.
  - `02 · About (Moments)`: Pinned orbiting ring of captured frames.
  - `03 · Movies (Reel)`: Smooth looping filmstrip arcs.
  - `04 · Roles (Screen)`: Concave geometry CRT video presentation.
  - `05 · Beyond the Frame`: Mirrored performance panel.
  - `06 · Gallery`: Wall of stills, candid frames, and editorial captions.
  - `07 · Finale & Contact`: Seven-photo fan layout with direct collaboration and social links.

---

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
git clone https://github.com/karthikreddy06/mamitha.git
cd mamitha
npm install
```

### Development

To start the Vite development server with hot module replacement:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

To type-check and generate production-optimized assets in `dist/`:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Project Structure

```
├── public/
│   ├── images/          # Production photography and cut-outs
│   └── videos/          # Web-optimized video assets
├── src/
│   ├── assets/          # Bundled cinematic assets
│   ├── components/
│   │   ├── butterfly/   # Butterfly glyphs and shaders
│   │   ├── cinematic/   # Landing intro, video interlude, rain canvas
│   │   └── ...          # Portfolio section components
│   ├── config/          # Layout curves, section configurations, media slots
│   ├── lib/             # Audio context, motion curves, viewport hooks
│   ├── App.tsx          # Master journey provider & intro-state orchestrator
│   └── index.css        # Global CSS & typography tokens
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

Private repository. All photographs, videos, and creative likeness © Mamitha Baiju. All rights reserved.
