import {
  cloneSeedValues,
  getLever,
  getWorldSeed,
  leverOrder,
  levers,
  ritualsByLever,
  storageKey,
  worldSeeds,
} from './data.ts'
import type {
  ComparisonRow,
  DerivedWorld,
  LeverId,
  MetricId,
  MetricSummary,
  SavedSnapshot,
  TimelineCard,
  WorldComparison,
} from './types.ts'

const metricMeta: Record<
  MetricId,
  {
    label: string
    shortLabel: string
    description: string
    weights: Record<LeverId, number>
  }
> = {
  atmosphere: {
    label: 'Atmosphere Relief',
    shortLabel: 'ATM',
    description: 'Whether heat and emissions pressure begin to soften at city scale.',
    weights: {
      energy: 0.33,
      mobility: 0.21,
      food: 0.08,
      water: 0.1,
      materials: 0.12,
      biodiversity: 0.07,
      care: 0.09,
    },
  },
  biodiversity: {
    label: 'Biodiversity Return',
    shortLabel: 'BIO',
    description: 'How likely species, pollinators, and habitat complexity are to rebound.',
    weights: {
      energy: 0.04,
      mobility: 0.06,
      food: 0.16,
      water: 0.16,
      materials: 0.06,
      biodiversity: 0.38,
      care: 0.14,
    },
  },
  community: {
    label: 'Civic Resilience',
    shortLabel: 'CIV',
    description: 'How prepared people are to share safety, trust, and practical support.',
    weights: {
      energy: 0.08,
      mobility: 0.1,
      food: 0.1,
      water: 0.13,
      materials: 0.08,
      biodiversity: 0.08,
      care: 0.43,
    },
  },
  ocean: {
    label: 'Water Vitality',
    shortLabel: 'SEA',
    description: 'How strongly rivers, wetlands, and coasts shift from brittle to buffered.',
    weights: {
      energy: 0.07,
      mobility: 0.08,
      food: 0.13,
      water: 0.36,
      materials: 0.14,
      biodiversity: 0.14,
      care: 0.08,
    },
  },
  circularity: {
    label: 'Circular Matter',
    shortLabel: 'MAT',
    description: 'How much extraction is replaced by repair, reuse, and return loops.',
    weights: {
      energy: 0.08,
      mobility: 0.08,
      food: 0.1,
      water: 0.06,
      materials: 0.46,
      biodiversity: 0.05,
      care: 0.17,
    },
  },
  heat: {
    label: 'Heat Softening',
    shortLabel: 'CLM',
    description: 'How livable hot days become once design and ecology start helping people.',
    weights: {
      energy: 0.23,
      mobility: 0.2,
      food: 0.06,
      water: 0.18,
      materials: 0.12,
      biodiversity: 0.11,
      care: 0.1,
    },
  },
}

const scoreBands = [
  {
    min: 84,
    label: 'Regenerative Bloom',
    descriptor: 'This world behaves like a repair engine, not a damage limiter.',
    aura: 'lush and self-amplifying',
  },
  {
    min: 69,
    label: 'Repair Renaissance',
    descriptor: 'The future still needs work, but the direction of travel is unmistakably healing.',
    aura: 'confident and breathable',
  },
  {
    min: 54,
    label: 'Turning Point',
    descriptor: 'The system is contested: enough progress to matter, enough fragility to stay urgent.',
    aura: 'uneasy but improvable',
  },
  {
    min: 0,
    label: 'Extraction Echo',
    descriptor: 'This world is still paying for old habits faster than it is inventing new ones.',
    aura: 'stressed and brittle',
  },
]

const temperatureNotes = [
  'Night heat lingers in concrete and recovery still costs effort.',
  'Shade and water begin turning punishing afternoons into manageable ones.',
  'Public space grows comfortable enough for evening life to return.',
  'Cooling becomes ambient: design does the work before emergency systems need to.',
]

const civicNotes = [
  'Trust exists, but it still depends on individual heroics.',
  'Neighborhood systems are starting to catch people before crisis does.',
  'Mutual aid feels built-in rather than improvised.',
  'Care is treated like infrastructure: visible, funded, and expected.',
]

function average(values: Record<LeverId, number>): number {
  const total = leverOrder.reduce((sum, leverId) => sum + values[leverId], 0)
  return total / leverOrder.length
}

function weightedMetric(metricId: MetricId, values: Record<LeverId, number>): number {
  const { weights } = metricMeta[metricId]
  const weighted = leverOrder.reduce((sum, leverId) => sum + values[leverId] * weights[leverId], 0)
  return Math.round(weighted)
}

function fingerprint(seedId: string, values: Record<LeverId, number>): number {
  return leverOrder.reduce((sum, leverId, index) => sum + values[leverId] * (index + 11), seedId.length * 37)
}

function pick<T>(items: T[], index: number): T {
  return items[Math.abs(index) % items.length]
}

function padCode(value: number): string {
  return value.toString(36).toUpperCase().padStart(2, '0')
}

function topAndBottomMetrics(metrics: MetricSummary[]) {
  const sorted = [...metrics].sort((left, right) => right.value - left.value)
  return {
    dominant: sorted[0],
    vulnerable: sorted[sorted.length - 1],
  }
}

function topAndBottomLevers(values: Record<LeverId, number>) {
  const sorted = [...levers].sort((left, right) => values[right.id] - values[left.id])
  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  }
}

function buildSignalPillars(
  values: Record<LeverId, number>,
  metrics: MetricSummary[],
  finger: number,
): string[] {
  const ideas: string[] = []
  const map = Object.fromEntries(metrics.map((metric) => [metric.id, metric.value])) as Record<MetricId, number>

  if (map.atmosphere >= 72) {
    ideas.push('Evening streets stay occupied because heat no longer owns the night.')
  }
  if (map.biodiversity >= 72) {
    ideas.push('Pollinators and canopy species return as habitat stops being ornamental.')
  }
  if (map.community >= 72) {
    ideas.push('Climate response is social by default, not a last-minute volunteer effort.')
  }
  if (map.ocean >= 72) {
    ideas.push('Water systems slow down and absorb shock instead of exporting it downstream.')
  }
  if (map.circularity >= 72) {
    ideas.push('Objects circulate through repair loops before extraction gets another turn.')
  }
  if (map.heat >= 72) {
    ideas.push('Hot spells are softened by design choices people can actually feel.')
  }
  if (values.energy >= 82) {
    ideas.push('Power moves from distant utility logic to local commons logic.')
  }
  if (values.mobility >= 82) {
    ideas.push('The easiest trip becomes the lowest-emission trip.')
  }
  if (ideas.length < 4) {
    ideas.push(
      'Public imagination shifts from sustainability as sacrifice to sustainability as upgraded everyday life.',
    )
  }
  if (ideas.length < 4) {
    ideas.push(
      'Infrastructure starts performing like ecology: layered, resilient, and quietly adaptive.',
    )
  }

  return ideas
    .slice(0, 6)
    .sort((left, right) => ((left.length + finger) % 9) - ((right.length + finger) % 9))
    .slice(0, 4)
}

function buildWeakSignals(values: Record<LeverId, number>, metrics: MetricSummary[]): string[] {
  const warnings: string[] = []
  const weakestLevers = [...levers]
    .sort((left, right) => values[left.id] - values[right.id])
    .slice(0, 2)

  weakestLevers.forEach((lever) => {
    warnings.push(`${lever.label} is the current drag point.`)
  })

  const vulnerableMetric = [...metrics].sort((left, right) => left.value - right.value)[0]
  warnings.push(`${vulnerableMetric.label} still feels under-defended.`)
  return warnings.slice(0, 3)
}

function buildDispatch(
  seedId: string,
  scoreLabel: string,
  dominant: MetricSummary,
  vulnerable: MetricSummary,
  strongestLever: string,
  weakestLever: string,
  finger: number,
): string {
  const openings = [
    'This future does not arrive through guilt; it arrives through systems that finally feel better to live inside.',
    'The planet changes here because daily life changes first, and policy starts following what communities prove is possible.',
    'Instead of treating sustainability like a side quest, this world folds it into housing, movement, food, and public ritual.',
  ]

  const middles = [
    `The dominant signal is ${dominant.label.toLowerCase()}, which means the environment begins responding almost as quickly as people do.`,
    `The strongest lever right now is ${strongestLever.toLowerCase()}, giving the whole scenario a believable engine instead of a vague promise.`,
    `What makes the concept memorable is that it feels civic, sensory, and planetary at the same time rather than staying trapped in dashboard language.`,
  ]

  const endings = [
    `The main caution is ${vulnerable.label.toLowerCase()}; without a stronger ${weakestLever.toLowerCase()} layer, the future can still slip back into reactive mode.`,
    `Its current weak edge is ${weakestLever.toLowerCase()}, so the next leap is less about invention and more about closing that trust gap.`,
    `In ${seedId.replace('-', ' ')}, the difference between ${scoreLabel.toLowerCase()} and complacency is whether ${weakestLever.toLowerCase()} gets treated as core infrastructure.`,
  ]

  return `${pick(openings, finger)} ${pick(middles, finger + 3)} ${pick(endings, finger + 6)}`
}

function buildTimeline(
  dominant: MetricSummary,
  vulnerable: MetricSummary,
  score: number,
  finger: number,
): TimelineCard[] {
  const firstTitle =
    score >= 70 ? 'Prototype Districts Become Proof' : 'Neighborhood Pilots Fight for Permanence'
  const secondTitle =
    dominant.id === 'biodiversity' || dominant.id === 'ocean'
      ? 'Infrastructure Starts Behaving Like Ecology'
      : 'Public Systems Learn to Feel Human Again'
  const thirdTitle =
    score >= 84 ? 'The Region Becomes a Net Regenerator' : 'The Future Holds if Care Keeps Scaling'

  const firstBodies = [
    'Temporary experiments harden into policy once people can feel cooler streets, calmer runoff, and shorter supply chains in everyday life.',
    'City budgets stop classifying adaptation as emergency spending and begin treating it as a quality-of-life multiplier.',
    'Schools, transit nodes, and markets become the first places where climate action looks visibly better than business as usual.',
  ]
  const secondBodies = [
    `The strongest gains show up in ${dominant.label.toLowerCase()}, with parks, power, and mobility systems operating more like a linked ecosystem than separate departments.`,
    'Repair loops and public realm upgrades become culturally normal, which means resilience no longer depends on novelty or niche advocacy.',
    'Regional planning starts following watersheds, canopy lines, and community rhythms rather than old administrative convenience.',
  ]
  const thirdBodies = [
    `The long-term risk stays concentrated in ${vulnerable.label.toLowerCase()}, so future leadership succeeds only if it protects the weakest layer with as much flair as the visible wins.`,
    'The most successful communities are the ones that keep maintenance fashionable, intergenerational, and publicly celebrated.',
    'Children inherit a place that still needs stewardship, but no longer feels engineered for exhaustion.',
  ]

  return [
    {
      year: '2035',
      title: firstTitle,
      body: pick(firstBodies, finger),
    },
    {
      year: '2060',
      title: secondTitle,
      body: pick(secondBodies, finger + 4),
    },
    {
      year: '2085',
      title: thirdTitle,
      body: pick(thirdBodies, finger + 8),
    },
  ]
}

function buildManifesto(scoreLabel: string, aura: string, strongestLever: string): string {
  return `${scoreLabel} with a ${aura} tone, powered mostly by ${strongestLever.toLowerCase()}.`
}

function buildRituals(values: Record<LeverId, number>, finger: number) {
  const weakest = [...levers]
    .sort((left, right) => values[left.id] - values[right.id])
    .slice(0, 3)

  return weakest.map((lever, index) => pick(ritualsByLever[lever.id], finger + index * 2))
}

function buildSignature(seedId: string, values: Record<LeverId, number>, score: number) {
  const prefix = seedId
    .split('-')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return `${prefix}-${padCode(score)}${padCode(values.energy + values.water)}${padCode(values.care + values.biodiversity)}`
}

export function clampValue(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function createValuesFromSeed(seedId: string): Record<LeverId, number> {
  return cloneSeedValues(seedId)
}

const bestFutureTargets: Record<string, Partial<Record<LeverId, number>>> = {
  'mycelial-city': {
    energy: 90,
    mobility: 93,
    food: 84,
    water: 85,
    materials: 92,
    biodiversity: 88,
    care: 91,
  },
  'tidal-commons': {
    energy: 86,
    mobility: 80,
    food: 84,
    water: 95,
    materials: 82,
    biodiversity: 93,
    care: 89,
  },
  'canopy-republic': {
    energy: 84,
    mobility: 85,
    food: 89,
    water: 87,
    materials: 81,
    biodiversity: 96,
    care: 88,
  },
  'solar-bazaar': {
    energy: 96,
    mobility: 79,
    food: 85,
    water: 82,
    materials: 89,
    biodiversity: 80,
    care: 90,
  },
}

export function buildBestFutureValues(seedId: string): Record<LeverId, number> {
  const base = cloneSeedValues(seedId)
  const tuned = bestFutureTargets[seedId] ?? {}

  return leverOrder.reduce(
    (accumulator, leverId) => {
      const seeded = base[leverId]
      const lifted =
        seeded >= 86 ? seeded + 6 : seeded >= 75 ? seeded + 10 : seeded >= 65 ? seeded + 14 : seeded + 18
      accumulator[leverId] = clampValue(tuned[leverId] ?? Math.max(82, lifted))
      return accumulator
    },
    {} as Record<LeverId, number>,
  )
}

export function serializeWorldHash(seedId: string, values: Record<LeverId, number>, customName = ''): string {
  const compact = leverOrder.map((leverId) => clampValue(values[leverId]).toString()).join('.')
  const cleanName = customName.trim()
  const encodedName =
    cleanName.length > 0 && cleanName !== getWorldSeed(seedId).name ? `|${encodeURIComponent(cleanName)}` : ''
  return `#${seedId}|${compact}${encodedName}`
}

export function parseWorldHash(hash: string): { seedId: string; values: Record<LeverId, number>; customName: string | null } | null {
  if (!hash.startsWith('#')) {
    return null
  }

  const clean = hash.slice(1)
  const [seedId, rawValues, rawName] = clean.split('|')
  if (!seedId || !rawValues) {
    return null
  }

  if (!worldSeeds.some((seed) => seed.id === seedId)) {
    return null
  }

  const parts = rawValues.split('.')
  if (parts.length !== leverOrder.length) {
    return null
  }

  const values = leverOrder.reduce(
    (accumulator, leverId, index) => {
      const parsed = Number(parts[index])
      accumulator[leverId] = Number.isFinite(parsed) ? clampValue(parsed) : getLever(leverId).defaultValue
      return accumulator
    },
    {} as Record<LeverId, number>,
  )

  let customName: string | null = null
  if (rawName) {
    try {
      const decoded = decodeURIComponent(rawName).trim()
      customName = decoded.length > 0 ? decoded : null
    } catch {
      customName = null
    }
  }

  return {
    seedId,
    values,
    customName,
  }
}

export function loadSavedSnapshots(): SavedSnapshot[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as SavedSnapshot[]
    return Array.isArray(parsed) ? parsed.slice(0, 6) : []
  } catch {
    return []
  }
}

export function storeSavedSnapshots(snapshots: SavedSnapshot[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(snapshots.slice(0, 6)))
}

export function deriveWorld(seedId: string, values: Record<LeverId, number>): DerivedWorld {
  const metrics = (Object.keys(metricMeta) as MetricId[]).map((metricId) => ({
    id: metricId,
    label: metricMeta[metricId].label,
    shortLabel: metricMeta[metricId].shortLabel,
    value: weightedMetric(metricId, values),
    description: metricMeta[metricId].description,
  }))

  const averageLever = average(values)
  const score = Math.round(
    (metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length) * 0.86 + averageLever * 0.14,
  )
  const band = scoreBands.find((candidate) => score >= candidate.min) ?? scoreBands[scoreBands.length - 1]
  const { dominant, vulnerable } = topAndBottomMetrics(metrics)
  const { strongest, weakest } = topAndBottomLevers(values)
  const seed = getWorldSeed(seedId)
  const finger = fingerprint(seedId, values)
  const temperatureMetric = metrics.find((metric) => metric.id === 'heat')?.value ?? score
  const communityMetric = metrics.find((metric) => metric.id === 'community')?.value ?? score
  const temperatureNote = pick(temperatureNotes, Math.floor(temperatureMetric / 24))
  const civicNote = pick(civicNotes, Math.floor(communityMetric / 24))

  return {
    metrics,
    score,
    label: band.label,
    descriptor: band.descriptor,
    aura: band.aura,
    theme: seed.theme,
    strongestLever: strongest,
    weakestLever: weakest,
    dominantMetric: dominant,
    vulnerableMetric: vulnerable,
    dispatch: buildDispatch(
      seedId,
      band.label,
      dominant,
      vulnerable,
      strongest.label,
      weakest.label,
      finger,
    ),
    manifesto: buildManifesto(band.label, band.aura, strongest.label),
    temperatureNote,
    civicNote,
    signalPillars: buildSignalPillars(values, metrics, finger),
    weakSignals: buildWeakSignals(values, metrics),
    rituals: buildRituals(values, finger),
    timeline: buildTimeline(dominant, vulnerable, score, finger),
    signature: buildSignature(seed.id, values, score),
  }
}

function compareRows(left: ComparisonRow, right: ComparisonRow): number {
  return Math.abs(right.delta) - Math.abs(left.delta)
}

function byPositiveDelta(left: ComparisonRow, right: ComparisonRow): number {
  return right.delta - left.delta
}

function buildVerdict(
  scoreDelta: number,
  strongestGain: ComparisonRow | null,
  strongestLoss: ComparisonRow | null,
): string {
  if (scoreDelta === 0 && !strongestGain && !strongestLoss) {
    return 'Baseline match'
  }
  if (scoreDelta === 0) {
    return 'Tradeoff-neutral remix'
  }
  if (scoreDelta >= 18) {
    return 'Category-level leap'
  }
  if (scoreDelta >= 10) {
    return 'Clear competitive improvement'
  }
  if (scoreDelta >= 4) {
    return 'Meaningful lift'
  }
  if (scoreDelta >= 0) {
    return 'Marginal improvement'
  }
  if (scoreDelta >= -5) {
    return 'Tradeoff-heavy revision'
  }
  return 'Regression against baseline'
}

function buildRecommendation(
  scoreDelta: number,
  strongestGain: ComparisonRow | null,
  strongestLoss: ComparisonRow | null,
): string {
  if (scoreDelta === 0 && !strongestGain && !strongestLoss) {
    return 'Create a clearer delta before presenting this version, or use Best Future to generate a stronger baseline-beating story.'
  }
  if (scoreDelta === 0 && strongestGain && strongestLoss) {
    return `This version breaks even overall, so present the ${strongestGain.label.toLowerCase()} gain only if you also explain the ${strongestLoss.label.toLowerCase()} tradeoff clearly.`
  }
  if (scoreDelta >= 10) {
    if (!strongestGain) {
      return 'Lead with the overall score lift and show the supporting metric gains, because this version already reads as a clear improvement.'
    }
    if (!strongestLoss) {
      return `Lead with the ${strongestGain.label.toLowerCase()} jump. This version improves the baseline without introducing a meaningful regression.`
    }
    return `Lead with the ${strongestGain.label.toLowerCase()} jump, then acknowledge the ${strongestLoss.label.toLowerCase()} tradeoff so the story feels credible.`
  }
  if (scoreDelta >= 0) {
    if (!strongestGain) {
      return 'This version is stable, but it still needs a more obvious advantage before it feels like a winning scenario.'
    }
    if (!strongestLoss) {
      return `This version is promising. Lead with the ${strongestGain.label.toLowerCase()} lift and note that it introduces no meaningful regression.`
    }
    return `This version is promising, but it still needs a stronger lift in ${strongestGain.label.toLowerCase()} to feel like a decisive winner.`
  }
  if (!strongestLoss) {
    return 'Before presenting this scenario, recover the overall score delta so the baseline does not remain the stronger argument.'
  }
  return `Before presenting this scenario, recover the loss in ${strongestLoss.label.toLowerCase()} or the baseline will remain the stronger argument.`
}

function buildComparisonSummary(
  currentName: string,
  baselineName: string,
  scoreDelta: number,
  strongestGain: ComparisonRow | null,
  strongestLoss: ComparisonRow | null,
): string {
  if (scoreDelta === 0 && !strongestGain && !strongestLoss) {
    return `${currentName} currently matches ${baselineName}. Judge Mode needs a stronger lever move before this version can argue for itself.`
  }

  if (scoreDelta === 0 && strongestGain && strongestLoss) {
    return `${currentName} currently breaks even with ${baselineName}: gains in ${strongestGain.label.toLowerCase()} are offset by losses in ${strongestLoss.label.toLowerCase()}.`
  }

  if (scoreDelta > 0 && strongestGain && !strongestLoss) {
    return `${currentName} improves ${baselineName} by ${Math.abs(scoreDelta)} points, driven most by ${strongestGain.label.toLowerCase()} with no meaningful regression elsewhere.`
  }

  if (scoreDelta < 0 && !strongestGain && strongestLoss) {
    return `${currentName} falls behind ${baselineName} by ${Math.abs(scoreDelta)} points, constrained most by ${strongestLoss.label.toLowerCase()} without an offsetting gain.`
  }

  if (strongestGain && strongestLoss) {
    const direction = scoreDelta >= 0 ? 'improves' : 'falls behind'
    return `${currentName} ${direction} ${baselineName} by ${Math.abs(scoreDelta)} points, driven most by ${strongestGain.label.toLowerCase()} and constrained most by ${strongestLoss.label.toLowerCase()}.`
  }

  return `${currentName} differs from ${baselineName} by ${Math.abs(scoreDelta)} points, but the scenario still needs a clearer advantage to read convincingly.`
}

export function compareWorlds(
  currentName: string,
  currentSeedId: string,
  currentValues: Record<LeverId, number>,
  baselineName: string,
  baselineSource: string,
  baselineSeedId: string,
  baselineValues: Record<LeverId, number>,
): WorldComparison {
  const currentWorld = deriveWorld(currentSeedId, currentValues)
  const baselineWorld = deriveWorld(baselineSeedId, baselineValues)

  const metricDeltas: ComparisonRow[] = currentWorld.metrics.map((metric) => {
    const baselineMetric = baselineWorld.metrics.find((item) => item.id === metric.id) ?? baselineWorld.metrics[0]
    return {
      id: metric.id,
      label: metric.label,
      shortLabel: metric.shortLabel,
      current: metric.value,
      baseline: baselineMetric.value,
      delta: metric.value - baselineMetric.value,
    }
  })

  const leverDeltas: ComparisonRow[] = levers.map((lever) => ({
    id: lever.id,
    label: lever.label,
    shortLabel: lever.shortLabel,
    current: currentValues[lever.id],
    baseline: baselineValues[lever.id],
    delta: currentValues[lever.id] - baselineValues[lever.id],
  }))

  const combined = [...metricDeltas, ...leverDeltas]
  const strongestGain = [...combined].sort(byPositiveDelta).find((row) => row.delta > 0) ?? null
  const strongestLoss = [...combined].sort((left, right) => left.delta - right.delta).find((row) => row.delta < 0) ?? null
  const scoreDelta = currentWorld.score - baselineWorld.score
  const summary = buildComparisonSummary(currentName, baselineName, scoreDelta, strongestGain, strongestLoss)

  return {
    baselineName,
    baselineSource,
    scoreDelta,
    verdict: buildVerdict(scoreDelta, strongestGain, strongestLoss),
    summary,
    recommendation: buildRecommendation(scoreDelta, strongestGain, strongestLoss),
    metricDeltas: metricDeltas.sort(compareRows),
    leverDeltas: leverDeltas.sort(compareRows),
    strongestGain,
    strongestLoss,
  }
}

export function formatSavedAt(savedAt: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(savedAt))
}

export function buildShareMarkdown(
  name: string,
  seedId: string,
  values: Record<LeverId, number>,
  origin: string,
): string {
  const world = deriveWorld(seedId, values)
  const seed = getWorldSeed(seedId)
  const leverSummary = levers
    .map((lever) => `- ${lever.label}: ${values[lever.id]}`)
    .join('\n')
  const signalSummary = world.signalPillars.map((item) => `- ${item}`).join('\n')
  const url = `${origin}${serializeWorldHash(seedId, values, name)}`

  return `# ${name}

${world.dispatch}

Seed: ${seed.name}
World signature: ${world.signature}
Planet score: ${world.score} / 100 (${world.label})

Top signals
${signalSummary}

Levers
${leverSummary}

Try this world
${url}`
}
