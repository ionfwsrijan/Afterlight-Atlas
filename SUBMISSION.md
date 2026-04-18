*This is a submission for [Weekend Challenge: Earth Day Edition](https://dev.to/challenges/weekend-2026-04-16)*

## What I Built

I built **Afterlight Atlas**, a cinematic climate world-building instrument for imagining, comparing, and presenting better planetary futures.

Most Earth Day projects focus on measuring damage: carbon calculators, sustainability dashboards, or educational explainers. Those are useful, but I wanted to build something that answered a different question:

**What does a repaired future actually feel like?**

So instead of making another guilt-based tracker, I made an interactive system where you:

- choose a future archetype such as `Mycelial City`, `Tidal Commons`, `Canopy Republic`, or `Solar Bazaar`
- tune seven planetary levers across energy, mobility, food, water, materials, biodiversity, and civic care
- watch a live world respond through narrative, visual, and systems-level signals
- compare that future against a baseline and immediately see whether it is actually better

The project blends speculative design, interaction design, systems thinking, and presentation mechanics into one Earth Day experience.

### Why this is different

I think the differentiator is that **Afterlight Atlas is not just a pretty sustainability interface**.

It does four things at once:

1. **Makes climate action feel emotionally tangible**

   The app turns policy and infrastructure choices into a world you can feel through tone, language, atmosphere, and future storytelling.

2. **Frames sustainability as composition, not punishment**

   You are not being told how bad things are. You are composing a better civilization and seeing how different systems reinforce each other.

3. **Gives judges a fast evaluation layer**

   A dedicated **Judge Mode** compares the active future against the seed baseline or a saved alternate scenario and explains the delta clearly.

4. **Works as both a product and a presentation**

   It includes Present Mode, saved snapshots, exported comparison cards, and one-click "Best Future" presets so it can be explored, pitched, and judged quickly.

### Core features

- Four original future seeds with distinct climate philosophies
- Seven adjustable planetary levers
- Live planet score and world-state generation
- Six speculative systems signals:
  - atmosphere relief
  - biodiversity return
  - civic resilience
  - water vitality
  - circular matter
  - heat softening
- Story-rich future dispatches instead of dry dashboard copy
- Three-horizon future timelines for 2035, 2060, and 2085
- Repair rituals that turn the scenario into grounded action prompts
- Save/load alternate futures
- Judge Mode for baseline comparison
- Present Mode for cleaner walkthroughs
- Exportable comparison card image
- One-click Best Future preset

## Demo

Local demo:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The app is static-host friendly and can be deployed to Vercel, Netlify, or GitHub Pages.

## Code

Project files live in this workspace. Key areas:

- `src/main.ts` for rendering, interactions, Judge Mode, Present Mode, and export flows
- `src/engine.ts` for world derivation, scoring, comparison logic, and helper utilities
- `src/data.ts` for seeds, levers, and tone palettes
- `src/style.css` for the editorial UI system and judge-friendly presentation layer

## How I Built It

I started with one strong constraint:

**If judges only spend a short time on each project, the experience needs to explain itself almost immediately.**

That shaped the build in a few important ways.

### 1. I avoided the default Earth Day pattern

The obvious path would have been a calculator, eco tips app, or data dashboard.

Instead, I designed Afterlight Atlas as a **speculative climate composition instrument**. That let me make something more memorable, more visual, and more emotionally resonant while still staying grounded in real systems like energy, mobility, water, biodiversity, and care.

### 2. I made Judge Mode a first-class feature

One of the hardest parts of any challenge entry is not just making something good, but making it easy to judge.

So I added **Judge Mode**, which compares the current world against either:

- the original seed baseline
- a saved alternate snapshot

It then surfaces:

- score delta
- strongest gain
- biggest regression or risk
- metric swings
- lever shifts
- a plain-language verdict
- a recommendation for how to present the scenario

That means a judge does not need to guess why this version matters. The app tells them.

### 3. I optimized for fast evaluation

Challenge judges usually review many projects quickly, so I added a few presentation-oriented features:

- **Present Mode** strips the experience down into a cleaner walkthrough state
- **Export Comparison Card** turns the active comparison into a pitch-friendly PNG
- **Best Future** gives a one-click strong scenario for immediate exploration

Together, those features make the project faster to understand and easier to remember.

### 4. I treated Earth Day as both emotional and technical

I wanted the project to fit the Earth Day theme in a deeper way than just using green colors and eco language.

**Emotionally**, it fits because it is about hope, repair, imagination, and stewardship. It asks users to picture what a healthier relationship with the planet could feel like in everyday life.

**Technically**, it fits because the underlying levers and comparisons are built around real systems-level concerns:

- distributed clean energy
- low-emission mobility
- watershed repair
- circular material flows
- biodiversity recovery
- community resilience

So the project is not just atmospheric. It is structured around meaningful planetary systems.

### 5. I kept the simulation honest

This is not presented as a scientific forecasting tool, and I think that honesty matters.

Afterlight Atlas is a **speculative decision-and-storytelling interface**, not a climate science model. The goal is not to predict the future precisely. The goal is to make tradeoffs, futures, and systemic thinking vivid enough that people can compare them, discuss them, and care about them.

## Why I Think It Belongs In This Challenge

Earth Day projects often succeed when they do more than inform. The best ones help people feel a stronger relationship to the planet and make that relationship actionable.

That is what I tried to do here:

- make the future feel visible
- make systemic climate choices feel human
- make comparisons quick enough for judges
- make the experience memorable enough to stand out

## Prize Categories

This version is focused on the core Earth Day prompt rather than a sponsor-specific category.
