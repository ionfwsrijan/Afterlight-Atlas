export type LeverId =
  | 'energy'
  | 'mobility'
  | 'food'
  | 'water'
  | 'materials'
  | 'biodiversity'
  | 'care'

export type MetricId =
  | 'atmosphere'
  | 'biodiversity'
  | 'community'
  | 'ocean'
  | 'circularity'
  | 'heat'

export type NoticeTone = 'neutral' | 'success'

export interface Lever {
  id: LeverId
  label: string
  shortLabel: string
  description: string
  hint: string
  defaultValue: number
}

export interface Theme {
  sky: string
  sea: string
  land: string
  glow: string
  accent: string
  mist: string
  shell: string
  paper: string
  highlight: string
  orbit: string
}

export interface WorldSeed {
  id: string
  name: string
  strapline: string
  description: string
  values: Record<LeverId, number>
  theme: Theme
}

export interface MetricSummary {
  id: MetricId
  label: string
  shortLabel: string
  value: number
  description: string
}

export interface TimelineCard {
  year: string
  title: string
  body: string
}

export interface RitualCard {
  title: string
  body: string
}

export interface SavedSnapshot {
  id: string
  name: string
  seedId: string
  values: Record<LeverId, number>
  score: number
  savedAt: string
}

export interface DerivedWorld {
  metrics: MetricSummary[]
  score: number
  label: string
  descriptor: string
  aura: string
  theme: Theme
  strongestLever: Lever
  weakestLever: Lever
  dominantMetric: MetricSummary
  vulnerableMetric: MetricSummary
  dispatch: string
  manifesto: string
  temperatureNote: string
  civicNote: string
  signalPillars: string[]
  weakSignals: string[]
  rituals: RitualCard[]
  timeline: TimelineCard[]
  signature: string
}

export interface ComparisonRow {
  id: string
  label: string
  shortLabel: string
  current: number
  baseline: number
  delta: number
}

export interface WorldComparison {
  baselineName: string
  baselineSource: string
  scoreDelta: number
  verdict: string
  summary: string
  recommendation: string
  metricDeltas: ComparisonRow[]
  leverDeltas: ComparisonRow[]
  strongestGain: ComparisonRow
  strongestLoss: ComparisonRow
}

export interface AppState {
  activeSeedId: string
  customName: string
  values: Record<LeverId, number>
  saved: SavedSnapshot[]
  compareSnapshotId: string | null
  presentMode: boolean
  notice: string
  noticeTone: NoticeTone
}
