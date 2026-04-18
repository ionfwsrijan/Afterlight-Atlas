import './style.css'

import { cloneSeedValues, getLever, getWorldSeed, levers, worldSeeds } from './data.ts'
import {
  buildShareMarkdown,
  buildBestFutureValues,
  clampValue,
  compareWorlds,
  createValuesFromSeed,
  deriveWorld,
  formatSavedAt,
  loadSavedSnapshots,
  parseWorldHash,
  serializeWorldHash,
  storeSavedSnapshots,
} from './engine.ts'
import type { AppState, LeverId, NoticeTone, SavedSnapshot } from './types.ts'

const rootElement = document.querySelector<HTMLDivElement>('#app')

if (!rootElement) {
  throw new Error('App root not found.')
}

const root = rootElement

const parsedHash = parseWorldHash(window.location.hash)
const initialSeedId = parsedHash?.seedId ?? worldSeeds[0].id

const state: AppState = {
  activeSeedId: initialSeedId,
  customName: parsedHash?.customName ?? getWorldSeed(initialSeedId).name,
  values: parsedHash?.values ?? createValuesFromSeed(initialSeedId),
  saved: loadSavedSnapshots(),
  compareSnapshotId: null,
  presentMode: false,
  notice: 'Move a lever, pick a seed, and the world updates instantly.',
  noticeTone: 'neutral',
}

interface RenderSnapshot {
  scrollX: number
  scrollY: number
  focusSelector: string | null
  selectionStart: number | null
  selectionEnd: number | null
}

interface RenderOptions {
  preserveScroll?: boolean
  preserveFocus?: boolean
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function displayName(): string {
  const clean = state.customName.trim()
  return clean.length > 0 ? clean : `${getWorldSeed(state.activeSeedId).name} Variant`
}

function setNotice(message: string, tone: NoticeTone = 'neutral') {
  state.notice = message
  state.noticeTone = tone
}

function formatDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`
}

function getComparisonBaseline() {
  const selectedSnapshot = state.compareSnapshotId
    ? state.saved.find((snapshot) => snapshot.id === state.compareSnapshotId) ?? null
    : null

  if (selectedSnapshot) {
    return {
      name: selectedSnapshot.name,
      source: `Saved snapshot · ${formatSavedAt(selectedSnapshot.savedAt)}`,
      seedId: selectedSnapshot.seedId,
      values: selectedSnapshot.values,
      snapshotId: selectedSnapshot.id,
    }
  }

  const seed = getWorldSeed(state.activeSeedId)
  return {
    name: `${seed.name} seed baseline`,
    source: 'Seed baseline',
    seedId: state.activeSeedId,
    values: cloneSeedValues(state.activeSeedId),
    snapshotId: null,
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function fillWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6,
) {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(nextLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = nextLine
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight)
  })

  return y + Math.min(lines.length, maxLines) * lineHeight
}

function updateHash() {
  const hash = serializeWorldHash(state.activeSeedId, state.values, state.customName)
  const target = `${window.location.pathname}${window.location.search}${hash}`
  window.history.replaceState({}, '', target)
}

function captureRenderSnapshot(): RenderSnapshot {
  const activeElement = document.activeElement

  if (!(activeElement instanceof HTMLInputElement)) {
    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      focusSelector: null,
      selectionStart: null,
      selectionEnd: null,
    }
  }

  const focusSelector = activeElement.dataset.field
    ? `input[data-field="${activeElement.dataset.field}"]`
    : activeElement.dataset.lever
      ? `input[data-lever="${activeElement.dataset.lever}"]`
      : activeElement.id
        ? `#${activeElement.id}`
        : null

  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    focusSelector,
    selectionStart: activeElement.selectionStart,
    selectionEnd: activeElement.selectionEnd,
  }
}

function restoreRenderSnapshot(snapshot: RenderSnapshot, options: RenderOptions) {
  if (options.preserveFocus !== false && snapshot.focusSelector) {
    const focusTarget = root.querySelector<HTMLInputElement>(snapshot.focusSelector)
    if (focusTarget) {
      try {
        focusTarget.focus({ preventScroll: true })
      } catch {
        focusTarget.focus()
      }

      if (
        focusTarget.type === 'text' &&
        snapshot.selectionStart !== null &&
        snapshot.selectionEnd !== null
      ) {
        focusTarget.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd)
      }
    }
  }

  if (options.preserveScroll !== false) {
    window.scrollTo(snapshot.scrollX, snapshot.scrollY)
  }
}

function renderSeedCards() {
  return worldSeeds
    .map((seed) => {
      const active = seed.id === state.activeSeedId ? 'seed-card active' : 'seed-card'
      return `
        <button
          class="${active}"
          type="button"
          data-seed="${seed.id}"
          style="
            --seed-accent:${seed.theme.accent};
            --seed-glow:${seed.theme.glow};
            --seed-sea:${seed.theme.sea};
            --seed-mist:${seed.theme.mist};
          "
        >
          <span class="seed-preview" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
          <span class="seed-label">${escapeHtml(seed.name)}</span>
          <strong>${escapeHtml(seed.strapline)}</strong>
          <span>${escapeHtml(seed.description)}</span>
        </button>
      `
    })
    .join('')
}

function renderLeverControls() {
  return levers
    .map((lever) => {
      const value = state.values[lever.id]
      return `
        <label class="lever-card" for="lever-${lever.id}">
          <div class="lever-header">
            <div>
              <span class="lever-code">${lever.shortLabel}</span>
              <h3>${escapeHtml(lever.label)}</h3>
            </div>
            <span class="lever-value">${value}</span>
          </div>
          <p>${escapeHtml(lever.description)}</p>
          <input
            id="lever-${lever.id}"
            class="lever-range"
            type="range"
            min="0"
            max="100"
            value="${value}"
            data-lever="${lever.id}"
            aria-describedby="hint-${lever.id}"
          />
          <div class="lever-meta">
            <span id="hint-${lever.id}">${escapeHtml(lever.hint)}</span>
            <span>0-100 scale</span>
          </div>
        </label>
      `
    })
    .join('')
}

function renderMetrics() {
  const world = deriveWorld(state.activeSeedId, state.values)
  return world.metrics
    .map(
      (metric) => `
        <div class="metric-row">
          <div class="metric-copy">
            <span>${metric.shortLabel}</span>
            <strong>${escapeHtml(metric.label)}</strong>
            <p>${escapeHtml(metric.description)}</p>
          </div>
          <div class="metric-bar" aria-hidden="true">
            <span style="width: ${metric.value}%"></span>
          </div>
          <span class="metric-number">${metric.value}</span>
        </div>
      `,
    )
    .join('')
}

function renderTimeline() {
  const world = deriveWorld(state.activeSeedId, state.values)
  return world.timeline
    .map(
      (step) => `
        <article class="timeline-card">
          <span class="timeline-year">${step.year}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.body)}</p>
        </article>
      `,
    )
    .join('')
}

function renderSavedSnapshots() {
  if (state.saved.length === 0) {
    return `
      <div class="empty-state">
        <strong>No saved worlds yet.</strong>
        <p>Save snapshots as you iterate so you can compare alternate futures side by side.</p>
      </div>
    `
  }

  return state.saved
    .map(
      (snapshot) => `
        <article class="snapshot-card">
          <div class="snapshot-head">
            <div>
              <h3>${escapeHtml(snapshot.name)}</h3>
              <p>${escapeHtml(getWorldSeed(snapshot.seedId).name)} · ${snapshot.score}/100</p>
            </div>
            <span>${escapeHtml(formatSavedAt(snapshot.savedAt))}</span>
          </div>
          <div class="snapshot-actions">
            <button
              type="button"
              class="ghost-button ${state.compareSnapshotId === snapshot.id ? 'ghost-button-active' : ''}"
              data-action="toggle-compare"
              data-snapshot="${snapshot.id}"
            >
              ${state.compareSnapshotId === snapshot.id ? 'Baseline Selected' : 'Use as Baseline'}
            </button>
            <button type="button" class="ghost-button" data-action="load-snapshot" data-snapshot="${snapshot.id}">
              Load
            </button>
            <button type="button" class="ghost-button" data-action="delete-snapshot" data-snapshot="${snapshot.id}">
              Delete
            </button>
          </div>
        </article>
      `,
    )
    .join('')
}

function renderApp(options: RenderOptions = {}) {
  const snapshot = captureRenderSnapshot()
  const world = deriveWorld(state.activeSeedId, state.values)
  const seed = getWorldSeed(state.activeSeedId)
  const baseline = getComparisonBaseline()
  const baselineWorld = deriveWorld(baseline.seedId, baseline.values)
  const comparison = compareWorlds(
    displayName(),
    state.activeSeedId,
    state.values,
    baseline.name,
    baseline.source,
    baseline.seedId,
    baseline.values,
  )
  const name = displayName()
  const strongestValue = state.values[world.strongestLever.id]
  const weakestValue = state.values[world.weakestLever.id]
  const dominantMetricValue = world.dominantMetric.value
  const vulnerableMetricValue = world.vulnerableMetric.value
  const noticeClass =
    state.noticeTone === 'success' ? 'notice-banner notice-banner-success' : 'notice-banner'

  document.title = `${name} | Afterlight Atlas`
  document.documentElement.style.setProperty('--theme-accent', world.theme.accent)
  document.documentElement.style.setProperty('--theme-glow', world.theme.glow)
  document.documentElement.style.setProperty('--theme-shell', world.theme.shell)
  document.documentElement.style.setProperty('--theme-paper', world.theme.paper)
  document.documentElement.style.setProperty('--theme-highlight', world.theme.highlight)
  document.documentElement.style.setProperty('--theme-orbit', world.theme.orbit)
  document.documentElement.style.setProperty('--theme-sea', world.theme.sea)
  document.documentElement.style.setProperty('--theme-land', world.theme.land)
  updateHash()

  root.innerHTML = `
    <div class="app-shell ${state.presentMode ? 'present-mode' : ''}">
      <div class="app-topbar">
        <div class="brand-lockup">
          <span class="brand-orbit" aria-hidden="true"></span>
          <div>
            <span class="brand-kicker">Future interface</span>
            <strong>Afterlight Atlas</strong>
          </div>
        </div>
        <div class="topbar-cluster">
          <div class="topbar-pill">
            <span>Seed</span>
            <strong>${escapeHtml(seed.name)}</strong>
          </div>
          <button type="button" class="ghost-button topbar-button" data-action="toggle-present">
            ${state.presentMode ? 'Exit Present Mode' : 'Present Mode'}
          </button>
        </div>
      </div>

      <header class="hero-panel panel">
        <div class="hero-copy">
          <span class="eyebrow">Earth Day challenge project · speculative climate composition instrument</span>
          <h1>Afterlight Atlas</h1>
          <p class="hero-text">
            Build a future that feels lived in. Choose a planetary seed, tune the systems underneath it,
            and watch the interface turn policy, ecology, and care into one cinematic world artifact.
          </p>
          <div class="hero-actions">
            <button type="button" class="primary-button" data-action="copy-story">Copy Story</button>
            <button type="button" class="secondary-button" data-action="copy-link">Copy Link</button>
            <button type="button" class="secondary-button" data-action="download-world">Download JSON</button>
            <button type="button" class="secondary-button" data-action="save-world">Save Snapshot</button>
          </div>
          <div class="hero-rack">
            <article class="hero-rack-card">
              <span>Active seed</span>
              <strong>${escapeHtml(seed.name)}</strong>
              <p>${escapeHtml(seed.strapline)}</p>
            </article>
            <article class="hero-rack-card">
              <span>Strongest lever</span>
              <strong>${escapeHtml(world.strongestLever.label)}</strong>
              <p>${strongestValue}/100 · biggest current advantage</p>
            </article>
            <article class="hero-rack-card">
              <span>Dominant signal</span>
              <strong>${escapeHtml(world.dominantMetric.label)}</strong>
              <p>${dominantMetricValue}/100 · shaping the feel of this future</p>
            </article>
          </div>
          <div class="${noticeClass}" aria-live="polite">${escapeHtml(state.notice)}</div>
        </div>
        <aside class="hero-stats">
          <div class="score-card">
            <span>Planet score</span>
            <strong>${world.score}</strong>
            <p>${escapeHtml(world.label)}</p>
          </div>
          <div class="micro-card">
            <span>World outlook</span>
            <strong>${escapeHtml(world.label)}</strong>
            <p>${escapeHtml(world.manifesto)}</p>
          </div>
        </aside>
      </header>

      <section class="seed-strip">
        ${renderSeedCards()}
      </section>

      <section class="studio-grid">
        <article class="panel control-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">World editor</span>
              <h2>Compose a future artifact</h2>
            </div>
            <div class="mini-action-group">
              <button type="button" class="ghost-button" data-action="best-future">Best Future</button>
              <button type="button" class="ghost-button" data-action="balance-world">Balance</button>
              <button type="button" class="ghost-button" data-action="boost-weakest">Boost Weakest</button>
              <button type="button" class="ghost-button" data-action="remix-world">Remix</button>
              <button type="button" class="ghost-button" data-action="reset-world">Reset</button>
            </div>
          </div>

          <label class="name-field" for="custom-name">
            <span>World alias</span>
            <input
              id="custom-name"
              type="text"
              maxlength="48"
              value="${escapeHtml(state.customName)}"
              data-field="custom-name"
              placeholder="Name your world"
            />
          </label>

          <div class="lever-grid">
            ${renderLeverControls()}
          </div>
        </article>

        <article class="panel visual-panel">
          <div
            class="planet-stage"
            style="
              --sky:${world.theme.sky};
              --sea:${world.theme.sea};
              --land:${world.theme.land};
              --glow:${world.theme.glow};
              --mist:${world.theme.mist};
            "
          >
            <div class="stage-glow"></div>
            <div class="stage-noise"></div>
            <div class="orbit orbit-one"></div>
            <div class="orbit orbit-two"></div>
            <div class="orbit orbit-three"></div>
            <div class="planet-legend">
              <span>World aura</span>
              <strong>${escapeHtml(world.aura)}</strong>
            </div>
            <div class="planet-core">
              <span class="continent continent-a"></span>
              <span class="continent continent-b"></span>
              <span class="cloud cloud-a"></span>
              <span class="cloud cloud-b"></span>
            </div>
            <div class="satellite sat-a">
              <strong>${world.dominantMetric.shortLabel}</strong>
              <span>${dominantMetricValue}</span>
            </div>
            <div class="satellite sat-b">
              <strong>${world.vulnerableMetric.shortLabel}</strong>
              <span>${vulnerableMetricValue}</span>
            </div>
            <div class="satellite sat-c">
              <strong>${world.strongestLever.shortLabel}</strong>
              <span>${strongestValue}</span>
            </div>
            <div class="satellite sat-d">
              <strong>${world.weakestLever.shortLabel}</strong>
              <span>${weakestValue}</span>
            </div>
          </div>

          <div class="visual-caption">
            <span class="eyebrow">Now rendering</span>
            <h2>${escapeHtml(name)}</h2>
            <p>${escapeHtml(world.descriptor)}</p>
          </div>

          <div class="signal-grid">
            ${world.signalPillars
              .map((signal) => `<div class="signal-pill">${escapeHtml(signal)}</div>`)
              .join('')}
          </div>

          <div class="metrics-panel">
            ${renderMetrics()}
          </div>
        </article>
      </section>

      <section class="insight-grid">
        <article class="panel narrative-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Future dispatch</span>
              <h2>What this world feels like</h2>
            </div>
          </div>
          <p class="dispatch">${escapeHtml(world.dispatch)}</p>
          <div class="note-grid">
            <div class="note-card">
              <span>Heat note</span>
              <strong>${escapeHtml(world.temperatureNote)}</strong>
            </div>
            <div class="note-card">
              <span>Care note</span>
              <strong>${escapeHtml(world.civicNote)}</strong>
            </div>
          </div>
          <div class="risk-list">
            ${world.weakSignals
              .map((warning) => `<div class="risk-item">${escapeHtml(warning)}</div>`)
              .join('')}
          </div>
        </article>

        <article class="panel timeline-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Three-horizon preview</span>
              <h2>How the scenario matures</h2>
            </div>
          </div>
          <div class="timeline-list">
            ${renderTimeline()}
          </div>
        </article>
      </section>

      <section class="judge-grid">
        <article class="panel judge-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Judge mode</span>
              <h2>Why this version wins</h2>
            </div>
            <div class="mini-action-group">
              <button type="button" class="ghost-button" data-action="export-compare-card">Export Comparison Card</button>
              ${
                baseline.snapshotId
                  ? '<button type="button" class="ghost-button" data-action="clear-compare">Return to Seed Baseline</button>'
                  : ''
              }
            </div>
          </div>
          <div class="judge-scoreboard">
            <article class="judge-score-card">
              <span>Current world</span>
              <strong>${world.score}</strong>
              <p>${escapeHtml(name)}</p>
            </article>
            <article class="judge-score-card">
              <span>Baseline</span>
              <strong>${baselineWorld.score}</strong>
              <p>${escapeHtml(baseline.name)}</p>
            </article>
            <article class="judge-score-card judge-score-card-emphasis">
              <span>Score delta</span>
              <strong>${formatDelta(comparison.scoreDelta)}</strong>
              <p>${escapeHtml(comparison.verdict)}</p>
            </article>
          </div>
          <div class="judge-copy">
            <div class="judge-badge-row">
              <span class="judge-badge">${escapeHtml(comparison.baselineSource)}</span>
              <span class="judge-badge">${
                comparison.strongestGain
                  ? `${escapeHtml(comparison.strongestGain.label)} strongest gain`
                  : 'No standout gains yet'
              }</span>
              <span class="judge-badge">${
                comparison.strongestLoss
                  ? `${escapeHtml(comparison.strongestLoss.label)} main watchout`
                  : 'No meaningful regressions'
              }</span>
            </div>
            <p class="judge-summary">${escapeHtml(comparison.summary)}</p>
            <p class="judge-recommendation">${escapeHtml(comparison.recommendation)}</p>
          </div>
        </article>

        <article class="panel compare-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Comparison evidence</span>
              <h2>What changed under the hood</h2>
            </div>
          </div>
          <div class="compare-columns">
            <div class="compare-stack">
              <h3>Metric swings</h3>
              ${comparison.metricDeltas
                .slice(0, 4)
                .map(
                  (row) => `
                    <div class="compare-row">
                      <div class="compare-copy">
                        <span>${row.shortLabel}</span>
                        <strong>${escapeHtml(row.label)}</strong>
                      </div>
                      <div class="compare-values">
                        <span>${row.baseline} → ${row.current}</span>
                        <strong class="${row.delta >= 0 ? 'delta-positive' : 'delta-negative'}">${formatDelta(row.delta)}</strong>
                      </div>
                    </div>
                  `,
                )
                .join('')}
            </div>
            <div class="compare-stack">
              <h3>Lever shifts</h3>
              ${comparison.leverDeltas
                .slice(0, 4)
                .map(
                  (row) => `
                    <div class="compare-row">
                      <div class="compare-copy">
                        <span>${row.shortLabel}</span>
                        <strong>${escapeHtml(row.label)}</strong>
                      </div>
                      <div class="compare-values">
                        <span>${row.baseline} → ${row.current}</span>
                        <strong class="${row.delta >= 0 ? 'delta-positive' : 'delta-negative'}">${formatDelta(row.delta)}</strong>
                      </div>
                    </div>
                  `,
                )
                .join('')}
            </div>
          </div>
        </article>
      </section>

      <section class="action-grid">
        <article class="panel ritual-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Repair rituals</span>
              <h2>Small moves with world-building energy</h2>
            </div>
          </div>
          <div class="ritual-list">
            ${world.rituals
              .map(
                (ritual) => `
                  <article class="ritual-card">
                    <h3>${escapeHtml(ritual.title)}</h3>
                    <p>${escapeHtml(ritual.body)}</p>
                  </article>
                `,
              )
              .join('')}
          </div>
        </article>

        <article class="panel archive-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">Snapshot archive</span>
              <h2>Save alternate futures</h2>
            </div>
          </div>
          <div class="snapshot-list">
            ${renderSavedSnapshots()}
          </div>
        </article>
      </section>

      <footer class="footer-note">
        Afterlight Atlas is a speculative storytelling tool, not a scientific forecasting model. It is designed to
        help people feel the texture of systemic climate choices, compare futures, and share them in a memorable way.
      </footer>
    </div>
  `

  restoreRenderSnapshot(snapshot, options)
}

function saveCurrentWorld() {
  const snapshot: SavedSnapshot = {
    id: crypto.randomUUID(),
    name: displayName(),
    seedId: state.activeSeedId,
    values: { ...state.values },
    score: deriveWorld(state.activeSeedId, state.values).score,
    savedAt: new Date().toISOString(),
  }

  state.saved = [snapshot, ...state.saved].slice(0, 6)
  storeSavedSnapshots(state.saved)
  setNotice(`Saved "${snapshot.name}" to the local archive.`, 'success')
}

function loadSnapshot(snapshotId: string) {
  const snapshot = state.saved.find((item) => item.id === snapshotId)
  if (!snapshot) {
    return
  }

  state.activeSeedId = snapshot.seedId
  state.customName = snapshot.name
  state.values = { ...snapshot.values }
  setNotice(`Loaded snapshot "${snapshot.name}".`, 'success')
}

function deleteSnapshot(snapshotId: string) {
  const next = state.saved.filter((item) => item.id !== snapshotId)
  if (next.length === state.saved.length) {
    return
  }

  state.saved = next
  if (state.compareSnapshotId === snapshotId) {
    state.compareSnapshotId = null
  }
  storeSavedSnapshots(next)
  setNotice('Removed snapshot from the archive.', 'success')
}

function toggleCompareSnapshot(snapshotId: string) {
  state.compareSnapshotId = state.compareSnapshotId === snapshotId ? null : snapshotId
  if (state.compareSnapshotId === snapshotId) {
    const snapshot = state.saved.find((item) => item.id === snapshotId)
    setNotice(`Using "${snapshot?.name ?? 'snapshot'}" as the judge baseline.`, 'success')
    return
  }
  setNotice('Returned comparison to the seed baseline.', 'success')
}

function remixWorld() {
  const values = { ...state.values }
  ;(Object.keys(values) as LeverId[]).forEach((leverId) => {
    const drift = Math.floor(Math.random() * 19) - 9
    values[leverId] = clampValue(values[leverId] + drift)
  })
  state.values = values
  setNotice('Remixed the current world with a fresh set of tensions and strengths.', 'success')
}

function balanceWorld() {
  const averageValue = Math.round(
    Object.values(state.values).reduce((sum, value) => sum + value, 0) / levers.length,
  )
  const values = { ...state.values }
  ;(Object.keys(values) as LeverId[]).forEach((leverId) => {
    values[leverId] = clampValue((values[leverId] + averageValue) / 2)
  })
  state.values = values
  setNotice('Balanced the world toward a steadier systems profile.', 'success')
}

function boostWeakest() {
  const weakestLever = [...levers].sort(
    (left, right) => state.values[left.id] - state.values[right.id],
  )[0]
  state.values = {
    ...state.values,
    [weakestLever.id]: clampValue(state.values[weakestLever.id] + 14),
  }
  setNotice(`Boosted ${weakestLever.label} to strengthen the world floor.`, 'success')
}

function resetWorld() {
  state.values = cloneSeedValues(state.activeSeedId)
  state.customName = getWorldSeed(state.activeSeedId).name
  setNotice('Reset the world back to its seed defaults.', 'success')
}

function applyBestFuture() {
  state.values = buildBestFutureValues(state.activeSeedId)
  state.customName = `${getWorldSeed(state.activeSeedId).name} Prime`
  state.compareSnapshotId = null
  setNotice('Applied the Best Future preset and reset Judge Mode to the seed baseline.', 'success')
}

function togglePresentMode() {
  state.presentMode = !state.presentMode
  setNotice(
    state.presentMode
      ? 'Present Mode is on. The view is now simplified for judges.'
      : 'Present Mode is off. Full editing controls are back.',
    'success',
  )
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function exportComparisonCard() {
  const baseline = getComparisonBaseline()
  const currentName = displayName()
  const world = deriveWorld(state.activeSeedId, state.values)
  const baselineWorld = deriveWorld(baseline.seedId, baseline.values)
  const comparison = compareWorlds(
    currentName,
    state.activeSeedId,
    state.values,
    baseline.name,
    baseline.source,
    baseline.seedId,
    baseline.values,
  )
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 920
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    setNotice('Could not export the comparison card on this browser.', 'neutral')
    return
  }

  await document.fonts.ready

  const accent = world.theme.accent
  const glow = world.theme.glow
  const backgroundGradient = ctx.createLinearGradient(0, 0, 1600, 920)
  backgroundGradient.addColorStop(0, '#f3f4f0')
  backgroundGradient.addColorStop(1, '#e8ebe3')
  ctx.fillStyle = backgroundGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(35, 70, 61, 0.06)'
  ctx.beginPath()
  ctx.arc(1260, 140, 180, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(183, 143, 97, 0.10)'
  ctx.beginPath()
  ctx.arc(280, 760, 220, 0, Math.PI * 2)
  ctx.fill()

  roundRect(ctx, 56, 56, 1488, 808, 34)
  ctx.fillStyle = 'rgba(251, 252, 248, 0.96)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(188, 198, 187, 0.82)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = accent
  ctx.font = '800 22px Manrope'
  ctx.fillText('AFTERLIGHT ATLAS', 100, 116)
  ctx.font = '600 64px Newsreader'
  ctx.fillStyle = '#111715'
  ctx.fillText('Judge Comparison Card', 100, 184)
  ctx.font = '500 28px Manrope'
  ctx.fillStyle = '#5d6662'
  ctx.fillText(currentName, 100, 230)

  const cardWidth = 420
  const cardGap = 20
  const cardY = 284
  const cards = [
    {
      title: 'Current world',
      value: `${world.score}`,
      body: currentName,
      fill: '#ffffff',
      ink: '#111715',
    },
    {
      title: 'Baseline',
      value: `${baselineWorld.score}`,
      body: baseline.name,
      fill: '#f4f6f1',
      ink: '#111715',
    },
    {
      title: 'Score delta',
      value: formatDelta(comparison.scoreDelta),
      body: comparison.verdict,
      fill: '#18201e',
      ink: '#f4efe6',
    },
  ]

  cards.forEach((card, index) => {
    const x = 100 + index * (cardWidth + cardGap)
    roundRect(ctx, x, cardY, cardWidth, 156, 24)
    ctx.fillStyle = card.fill
    ctx.fill()
    ctx.strokeStyle = index === 2 ? 'rgba(24, 32, 30, 0.9)' : 'rgba(217, 222, 213, 1)'
    ctx.stroke()
    ctx.fillStyle = index === 2 ? '#d9e0db' : accent
    ctx.font = '800 18px Manrope'
    ctx.fillText(card.title.toUpperCase(), x + 24, cardY + 34)
    ctx.fillStyle = card.ink
    ctx.font = '600 68px Newsreader'
    ctx.fillText(card.value, x + 24, cardY + 102)
    ctx.font = '500 24px Manrope'
    fillWrappedText(ctx, card.body, x + 24, cardY + 132, cardWidth - 48, 28, 2)
  })

  ctx.fillStyle = '#111715'
  ctx.font = '600 30px Newsreader'
  ctx.fillText('Why it wins', 100, 510)
  ctx.font = '500 26px Manrope'
  ctx.fillStyle = '#2b3734'
  const summaryBottom = fillWrappedText(ctx, comparison.summary, 100, 548, 690, 36, 4)
  ctx.fillStyle = '#5d6662'
  ctx.font = '500 22px Manrope'
  fillWrappedText(ctx, comparison.recommendation, 100, summaryBottom + 18, 690, 32, 4)

  roundRect(ctx, 840, 474, 604, 312, 24)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = 'rgba(217, 222, 213, 1)'
  ctx.stroke()
  ctx.fillStyle = '#111715'
  ctx.font = '600 30px Newsreader'
  ctx.fillText('Strongest evidence shifts', 872, 520)

  comparison.metricDeltas.slice(0, 4).forEach((row, index) => {
    const y = 560 + index * 52
    ctx.fillStyle = accent
    ctx.font = '800 14px Manrope'
    ctx.fillText(row.shortLabel, 872, y)
    ctx.fillStyle = '#111715'
    ctx.font = '700 21px Manrope'
    ctx.fillText(row.label, 928, y)
    ctx.fillStyle = '#5d6662'
    ctx.font = '500 18px Manrope'
    ctx.fillText(`${row.baseline} to ${row.current}`, 1190, y)
    ctx.fillStyle = row.delta >= 0 ? '#1f6a4f' : '#8a4f43'
    ctx.font = '700 20px Manrope'
    ctx.fillText(formatDelta(row.delta), 1352, y)
    ctx.fillStyle = 'rgba(217, 222, 213, 0.95)'
    ctx.fillRect(872, y + 10, 520, 8)
    ctx.fillStyle = row.delta >= 0 ? accent : glow
    ctx.fillRect(872, y + 10, Math.min(520, Math.max(50, Math.abs(row.delta) * 18)), 8)
  })

  ctx.fillStyle = '#5d6662'
  ctx.font = '600 18px Manrope'
  ctx.fillText(`Baseline source: ${baseline.source}`, 100, 824)
  ctx.fillText(`Planet score: ${world.score} / 100 (${world.label})`, 100, 852)
  ctx.fillStyle = accent
  ctx.fillText('afterlight atlas / build for the planet', 1140, 852)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${currentName.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-') || 'afterlight'}-judge-card.png`
  document.body.append(link)
  link.click()
  link.remove()
  setNotice('Exported the Judge Mode comparison card as PNG.', 'success')
}

function fallbackCopyText(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', 'true')
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '-9999px'
  textArea.style.opacity = '0'
  document.body.append(textArea)
  textArea.focus({ preventScroll: true })
  textArea.select()

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  textArea.remove()
  return copied
}

async function copyTextWithFallback(text: string, successMessage: string, blockedMessage: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else if (!fallbackCopyText(text)) {
      throw new Error('Clipboard API unavailable')
    }
  } catch {
    if (!fallbackCopyText(text)) {
      setNotice(blockedMessage, 'neutral')
      return
    }
  }

  setNotice(successMessage, 'success')
}

async function copyStory() {
  const text = buildShareMarkdown(
    displayName(),
    state.activeSeedId,
    state.values,
    `${window.location.origin}${window.location.pathname}${window.location.search}`,
  )
  await copyTextWithFallback(
    text,
    'Copied a shareable project story to the clipboard.',
    'Clipboard access was blocked. You can still use Download JSON or copy the story manually.',
  )
}

async function copyLink() {
  await copyTextWithFallback(
    window.location.href,
    'Copied the current world link to the clipboard.',
    'Clipboard access was blocked. You can still copy the link from the browser address bar.',
  )
}

function downloadWorld() {
  const world = deriveWorld(state.activeSeedId, state.values)
  const payload = {
    name: displayName(),
    seed: getWorldSeed(state.activeSeedId).name,
    score: world.score,
    label: world.label,
    values: state.values,
    metrics: world.metrics,
    timeline: world.timeline,
    rituals: world.rituals,
    dispatch: world.dispatch,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${displayName().toLowerCase().replaceAll(/[^a-z0-9]+/g, '-') || 'afterlight-atlas'}.json`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
  setNotice('Downloaded the current world as JSON.', 'success')
}

async function handleButtonAction(action: string, target: HTMLElement) {
  switch (action) {
    case 'copy-story':
      await copyStory()
      break
    case 'copy-link':
      await copyLink()
      break
    case 'download-world':
      downloadWorld()
      break
    case 'save-world':
      saveCurrentWorld()
      break
    case 'best-future':
      applyBestFuture()
      break
    case 'balance-world':
      balanceWorld()
      break
    case 'boost-weakest':
      boostWeakest()
      break
    case 'remix-world':
      remixWorld()
      break
    case 'reset-world':
      resetWorld()
      break
    case 'toggle-present':
      togglePresentMode()
      break
    case 'export-compare-card':
      await exportComparisonCard()
      break
    case 'load-snapshot': {
      const snapshotId = target.dataset.snapshot
      if (snapshotId) {
        loadSnapshot(snapshotId)
      }
      break
    }
    case 'toggle-compare': {
      const snapshotId = target.dataset.snapshot
      if (snapshotId) {
        toggleCompareSnapshot(snapshotId)
      }
      break
    }
    case 'delete-snapshot': {
      const snapshotId = target.dataset.snapshot
      if (snapshotId) {
        deleteSnapshot(snapshotId)
      }
      break
    }
    case 'clear-compare':
      state.compareSnapshotId = null
      setNotice('Returned comparison to the seed baseline.', 'success')
      break
    default:
      break
  }
}

root.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return
  }

  const seedButton = target.closest<HTMLElement>('[data-seed]')
  if (seedButton) {
    const seedId = seedButton.dataset.seed
    if (seedId) {
      state.activeSeedId = seedId
      state.values = createValuesFromSeed(seedId)
      state.customName = getWorldSeed(seedId).name
      setNotice(`Loaded the ${getWorldSeed(seedId).name} seed.`, 'success')
      renderApp()
    }
    return
  }

  const actionButton = target.closest<HTMLElement>('[data-action]')
  if (!actionButton) {
    return
  }

  const action = actionButton.dataset.action
  if (!action) {
    return
  }

  void handleButtonAction(action, actionButton)
    .then(() => {
      renderApp({
        preserveScroll: action !== 'toggle-present',
        preserveFocus: action !== 'toggle-present',
      })
    })
    .catch((error) => {
      console.error(error)
      setNotice('That action was blocked by the browser. Try again or use a manual fallback.', 'neutral')
      renderApp({
        preserveScroll: action !== 'toggle-present',
        preserveFocus: action !== 'toggle-present',
      })
    })
})

root.addEventListener('input', (event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }

  const leverId = target.dataset.lever as LeverId | undefined
  if (leverId) {
    state.values = {
      ...state.values,
      [leverId]: clampValue(Number(target.value)),
    }
    setNotice(`${getLever(leverId).label} updated.`, 'neutral')
    renderApp()
    return
  }

  if (target.dataset.field === 'custom-name') {
    state.customName = target.value
    setNotice('World alias updated.', 'neutral')
    renderApp()
  }
})

renderApp()
