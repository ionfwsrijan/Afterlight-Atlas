*This is a submission for [Weekend Challenge: Earth Day Edition](https://dev.to/challenges/weekend-2026-04-16)*

## What I Built

I built **Afterlight Atlas**, a cinematic Earth Day web experience for imagining, comparing, and presenting better planetary futures.

A lot of climate tools are useful, but they often focus on damage, guilt, or optimization. I wanted to build something that answered a different question:

**What does a repaired future actually feel like?**

So instead of making another carbon calculator or eco dashboard, I made an interactive world-building instrument where people can:

- choose a future seed such as `Mycelial City`, `Tidal Commons`, `Canopy Republic`, or `Solar Bazaar`
- tune seven planetary levers across energy, mobility, food, water, materials, biodiversity, and civic care
- watch a live world respond through narrative, metrics, atmosphere, and visual tone
- compare that future against a baseline and immediately see whether it is actually stronger

The part I think makes this project stand out is that **Afterlight Atlas is not just a pretty sustainability interface**.

It does four things at once:

1. It makes climate action feel emotionally tangible.
The app turns policy and infrastructure choices into a world you can feel through tone, language, atmosphere, and future storytelling.

2. It frames sustainability as composition, not punishment.
You are not being told how bad things are. You are composing a better civilization and seeing how different systems reinforce each other.

3. It gives judges a fast evaluation layer.
The app includes **Judge Mode**, which compares the active future against either the seed baseline or a saved alternate scenario and explains the delta clearly.

4. It works as both a product and a presentation.
It includes **Present Mode**, saved snapshots, comparison export, and a one-click **Best Future** preset so it can be explored, pitched, and judged quickly.

Core features:

- four original future seeds with distinct climate philosophies
- seven adjustable planetary levers
- live planet score and world-state generation
- six speculative systems signals: atmosphere, biodiversity, community, ocean, circularity, and heat
- story-rich future dispatches instead of dry dashboard copy
- three-horizon future timelines for 2035, 2060, and 2085
- repair rituals that turn the scenario into grounded action prompts
- save/load alternate futures
- Judge Mode for baseline comparison
- Present Mode for cleaner walkthroughs
- exportable comparison card image
- one-click Best Future preset

## Demo

Live app:

[https://afterlight-atlas.vercel.app/](https://afterlight-atlas.vercel.app/)

The app is fully deployed and ready to explore in the browser.

## Code

GitHub repository:

https://github.com/ionfwsrijan/Afterlight-Atlas

Key files:

- `src/main.ts` for rendering, interactions, Judge Mode, Present Mode, sharing actions, and export flows
- `src/engine.ts` for world derivation, scoring, baseline comparison, and share-state helpers
- `src/data.ts` for world seeds, lever metadata, and theme definitions
- `src/style.css` for the editorial UI system and presentation layer

## How I Built It

I started with one strong constraint:

**If judges only spend a short time on each project, the experience needs to explain itself almost immediately.**

That shaped the build in a few important ways.

### 1. I avoided the default Earth Day pattern

The obvious path would have been a calculator, green tips app, or climate dashboard.

Instead, I designed Afterlight Atlas as a **speculative climate composition instrument**. That let me build something more memorable, more visual, and more emotionally resonant while still staying grounded in meaningful systems like energy, mobility, water, biodiversity, and care.

### 2. I made Judge Mode a first-class feature

One of the hardest parts of any challenge entry is not just making something good, but making it easy to judge.

So I built **Judge Mode**, which compares the current world against either:

- the original seed baseline
- a saved alternate snapshot

It then surfaces:

- score delta
- strongest gain
- main watchout
- metric swings
- lever shifts
- a verdict
- a recommendation

That means a judge does not have to guess why one version is better. The app tells them.

### 3. I optimized for fast evaluation

Challenge judges usually review a lot of projects quickly, so I added presentation-oriented features that reduce friction:

- **Present Mode** for a cleaner walkthrough
- **Export Comparison Card** for a pitch-friendly PNG
- **Best Future** for a one-click strong scenario

Together, those features make the project faster to understand and easier to remember.

### 4. I treated Earth Day as both emotional and technical

I wanted the project to fit the Earth Day theme more deeply than just using green colors and eco language.

**Emotionally**, it fits because it is about hope, repair, stewardship, and imagination. It asks users to picture what a healthier relationship with the planet could feel like in everyday life.

**Technically**, it fits because the underlying levers and comparisons are built around real systems-level concerns:

- distributed clean energy
- lower-emission mobility
- watershed resilience
- circular material flows
- biodiversity recovery
- civic resilience and care

So the project is not just atmospheric. It is structured around meaningful planetary systems.

### 5. I kept the simulation honest

Afterlight Atlas is a **speculative decision-and-storytelling interface**, not a climate science model.

The goal is not to predict the future precisely. The goal is to make tradeoffs, futures, and systemic thinking vivid enough that people can compare them, discuss them, and care about them.

## Prize Categories

This project is focused on the core Earth Day prompt rather than a sponsor-specific prize category.
