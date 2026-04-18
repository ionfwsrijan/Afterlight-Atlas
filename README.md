# Afterlight Atlas

Speculative climate worldbuilding for Earth Day. Shape future planetary scenarios, compare them in Judge Mode, and present them through a polished editorial interface.

[Live Demo](https://afterlight-atlas.vercel.app/) · [Challenge Submission](./SUBMISSION.md)

<p align="center">
  <img src="./public/readme-preview.png" alt="Afterlight Atlas interface preview" width="960" />
</p>

## Overview

Afterlight Atlas is an Earth Day web experience built around a simple idea: climate interfaces do not have to feel like dashboards of guilt.

Instead of reducing the planet to a single calculator, the project lets people compose speculative futures through systems thinking, editorial storytelling, and interactive worldbuilding. Users choose a world seed, tune seven planetary levers, and watch the interface respond through narrative, metrics, atmosphere, and comparison logic.

## Why It Feels Different

- It treats sustainability as composition, not punishment.
- It turns infrastructure, ecology, and civic care into a world that feels lived in.
- It combines emotional storytelling with systems-level feedback.
- It includes dedicated judge-facing tools so the project explains itself quickly.

## Core Features

- Four world seeds with distinct climate philosophies and visual direction
- Seven planetary levers across energy, mobility, food, water, materials, biodiversity, and care
- Planet score engine for atmosphere, biodiversity, community, ocean, circularity, and heat signals
- Story-rich future dispatches instead of dry dashboard copy
- Three-horizon timeline across 2035, 2060, and 2085
- Snapshot archive for saving alternate futures
- Judge Mode for fast baseline comparison
- Present Mode for cleaner walkthroughs
- Best Future preset for one-click exploration
- Comparison card export as PNG
- Shareable state through URL hash serialization

## Built For The Earth Day Challenge

Afterlight Atlas was created for the DEV Community prompt, **Build for the Planet**.

It fits the challenge in two ways:

- Emotionally, it centers hope, stewardship, repair, and imagination.
- Technically, it models meaningful systems like clean energy, mobility, watershed resilience, biodiversity recovery, circular materials, and civic care.

This is intentionally a **speculative storytelling tool**, not a scientific forecasting model. Its purpose is to make tradeoffs vivid, memorable, and easy to discuss.

## Tech Stack

- TypeScript
- Vite
- Vanilla HTML rendering
- Custom CSS for layout, motion, and editorial presentation
- Local Storage for saved scenarios
- Canvas export for comparison card generation

## Run Locally

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

The app is static-host friendly and deploys cleanly to Vercel, Netlify, or any platform that serves the `dist` directory.

## Project Structure

- `src/main.ts` handles rendering, interactions, Judge Mode, Present Mode, and export flows.
- `src/engine.ts` derives worlds, scores scenarios, builds comparisons, and manages serialization helpers.
- `src/data.ts` defines seeds, levers, and theme inputs.
- `src/types.ts` holds the shared data contracts.
- `src/style.css` contains the editorial UI system and responsive presentation layer.
- `public/` contains branding and preview assets.
