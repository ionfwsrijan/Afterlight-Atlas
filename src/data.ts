import type { Lever, LeverId, Theme, WorldSeed } from './types.ts'

export const storageKey = 'afterlight-atlas-snapshots'

export const levers: Lever[] = [
  {
    id: 'energy',
    label: 'Energy Commons',
    shortLabel: 'ENG',
    description: 'How much power is owned, stored, and shared at neighborhood scale.',
    hint: 'Rooftop solar, batteries, microgrids, and flexible demand.',
    defaultValue: 74,
  },
  {
    id: 'mobility',
    label: 'Soft Mobility',
    shortLabel: 'MOV',
    description: 'How strongly streets privilege transit, walking, cycling, and shade.',
    hint: 'Slow streets, transit access, rail corridors, and cooler asphalt.',
    defaultValue: 68,
  },
  {
    id: 'food',
    label: 'Soil-to-Table',
    shortLabel: 'FOD',
    description: 'How tightly food systems connect local soil health and low-waste diets.',
    hint: 'Plant-forward menus, compost loops, local growers, and food rescue.',
    defaultValue: 63,
  },
  {
    id: 'water',
    label: 'Watershed Repair',
    shortLabel: 'WTR',
    description: 'How well the region behaves like a sponge rather than a drain.',
    hint: 'Wetlands, stormwater capture, reuse, and living shorelines.',
    defaultValue: 71,
  },
  {
    id: 'materials',
    label: 'Circular Matter',
    shortLabel: 'MAT',
    description: 'How often products are repaired, reused, remanufactured, or shared.',
    hint: 'Repair cafes, modular products, reuse markets, and design for return.',
    defaultValue: 69,
  },
  {
    id: 'biodiversity',
    label: 'Wild Corridors',
    shortLabel: 'BIO',
    description: 'How boldly habitat, pollinators, and native species reclaim territory.',
    hint: 'Canopies, native planting, habitat bridges, and dark-sky protections.',
    defaultValue: 73,
  },
  {
    id: 'care',
    label: 'Civic Care',
    shortLabel: 'CARE',
    description: 'How prepared communities are to share shelter, knowledge, and trust.',
    hint: 'Cooling rooms, mutual aid, public rituals, and local climate governance.',
    defaultValue: 77,
  },
]

const themes: Record<string, Theme> = {
  mycelial: {
    sky: '#d9e2da',
    sea: '#486a61',
    land: '#365046',
    glow: '#b78f61',
    accent: '#23463d',
    mist: '#ece6db',
    shell: '#e8ebe2',
    paper: '#fbf8f1',
    highlight: '#b8c8bc',
    orbit: '#8f9d97',
  },
  tidal: {
    sky: '#dbe6e8',
    sea: '#3f6770',
    land: '#526f66',
    glow: '#bc9464',
    accent: '#284c55',
    mist: '#eef2ee',
    shell: '#e7eceb',
    paper: '#fbf8f3',
    highlight: '#b7ccd0',
    orbit: '#93a8ac',
  },
  canopy: {
    sky: '#e2e4d7',
    sea: '#5c7a62',
    land: '#3f5a42',
    glow: '#b68a54',
    accent: '#294537',
    mist: '#f1ede3',
    shell: '#ebece1',
    paper: '#fbf8f1',
    highlight: '#c4cfb2',
    orbit: '#97a287',
  },
  bazaar: {
    sky: '#eadccc',
    sea: '#58716c',
    land: '#79543b',
    glow: '#c08f60',
    accent: '#674630',
    mist: '#f3ece2',
    shell: '#efe3d4',
    paper: '#fcf8f2',
    highlight: '#d7bea1',
    orbit: '#b49575',
  },
}

export const worldSeeds: WorldSeed[] = [
  {
    id: 'mycelial-city',
    name: 'Mycelial City',
    strapline: 'A dense metropolis that acts like forest floor.',
    description:
      'Transit, repair culture, and community cooling turn the city into a fungal network for resilience.',
    values: {
      energy: 78,
      mobility: 82,
      food: 64,
      water: 71,
      materials: 86,
      biodiversity: 74,
      care: 83,
    },
    theme: themes.mycelial,
  },
  {
    id: 'tidal-commons',
    name: 'Tidal Commons',
    strapline: 'A coastal civilization that treats shorelines as living infrastructure.',
    description:
      'Wetlands, community power, and amphibious design absorb risk instead of denying it.',
    values: {
      energy: 74,
      mobility: 65,
      food: 69,
      water: 90,
      materials: 67,
      biodiversity: 86,
      care: 78,
    },
    theme: themes.tidal,
  },
  {
    id: 'canopy-republic',
    name: 'Canopy Republic',
    strapline: 'A nation-scale tree treaty that rewrites urban life around shade.',
    description:
      'Native species corridors, cooler streets, and soil-first agriculture become public policy.',
    values: {
      energy: 70,
      mobility: 73,
      food: 77,
      water: 75,
      materials: 64,
      biodiversity: 93,
      care: 74,
    },
    theme: themes.canopy,
  },
  {
    id: 'solar-bazaar',
    name: 'Solar Bazaar',
    strapline: 'A warm-climate trade hub where clean power fuels local abundance.',
    description:
      'Sun-rich districts pair market life, shared fabrication, and low-waste commerce.',
    values: {
      energy: 91,
      mobility: 61,
      food: 71,
      water: 63,
      materials: 79,
      biodiversity: 58,
      care: 76,
    },
    theme: themes.bazaar,
  },
]

export const leverOrder: LeverId[] = levers.map((lever) => lever.id)

export const ritualsByLever: Record<LeverId, { title: string; body: string }[]> = {
  energy: [
    {
      title: 'Open a Night Grid',
      body: 'Pair local solar with battery-backed evening events so decarbonization also feels joyful.',
    },
    {
      title: 'Map Idle Roofs',
      body: 'Treat unused rooftops as civic infrastructure and catalog them for community energy projects.',
    },
  ],
  mobility: [
    {
      title: 'Prototype a Cool Street',
      body: 'Test one corridor with shade cloth, paint, planters, and temporary bike priority.',
    },
    {
      title: 'Measure Ten-Minute Reach',
      body: 'Audit what daily essentials are reachable without a car and publish the gaps.',
    },
  ],
  food: [
    {
      title: 'Compost as Civic Service',
      body: 'Turn food scraps into visible soil wealth instead of invisible waste hauling.',
    },
    {
      title: 'Design a Seasonal Plate',
      body: 'Create menus that celebrate local harvests and cut refrigeration miles.',
    },
  ],
  water: [
    {
      title: 'Adopt a Flood Memory Map',
      body: 'Let neighbors annotate where water rises, lingers, and escapes so design starts from memory.',
    },
    {
      title: 'Swap Drains for Gardens',
      body: 'Pilot one curbside bioswale and document how much heat and runoff it softens.',
    },
  ],
  materials: [
    {
      title: 'Host a Repair Night',
      body: 'Normalize fixing objects together so material circularity becomes a social ritual.',
    },
    {
      title: 'Tag Things for Return',
      body: 'Experiment with product passports that say where every object goes at end of life.',
    },
  ],
  biodiversity: [
    {
      title: 'Reclaim One Quiet Hour',
      body: 'Turn down lights and noise to create a recurring refuge for insects, birds, and bats.',
    },
    {
      title: 'Trace a Pollinator Line',
      body: 'Connect isolated plantings into one continuous habitat ribbon through the neighborhood.',
    },
  ],
  care: [
    {
      title: 'Publish a Heat Check Protocol',
      body: 'Create a tiny, repeatable system for checking on elders, workers, and neighbors during hot spells.',
    },
    {
      title: 'Invent a Climate Welcome Desk',
      body: 'Give newcomers one place to find shelters, transit, food support, and adaptation guides.',
    },
  ],
}

export function getWorldSeed(seedId: string): WorldSeed {
  return worldSeeds.find((seed) => seed.id === seedId) ?? worldSeeds[0]
}

export function getLever(leverId: LeverId): Lever {
  return levers.find((lever) => lever.id === leverId) ?? levers[0]
}

export function cloneSeedValues(seedId: string): Record<LeverId, number> {
  const source = getWorldSeed(seedId)
  return { ...source.values }
}
