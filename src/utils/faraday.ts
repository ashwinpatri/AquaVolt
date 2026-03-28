import { FARADAY_CONSTANT, NAOCL_MOLAR_MASS, ELECTRONS_PER_MOLECULE, DOSE_PPM } from './constants'

export function gramsProduced(coulombs: number, efficiency: number = 0.70): number {
  return (coulombs / FARADAY_CONSTANT / ELECTRONS_PER_MOLECULE) * NAOCL_MOLAR_MASS * efficiency
}

export function ppmFromGrams(grams: number, volumeLiters: number | null): number {
  if (!volumeLiters || volumeLiters <= 0) return 0
  return (grams / volumeLiters) * 1000
}

export function litersTreatable(grams: number, targetDosePpm: number = DOSE_PPM): number {
  if (grams <= 0) return 0
  return (grams * 1000) / targetDosePpm
}

export function coulombsNeeded(targetPpm: number, volumeLiters: number | null, efficiency: number = 0.70): number {
  if (!volumeLiters || volumeLiters <= 0) return 0
  const gramsNeeded = (targetPpm * volumeLiters) / 1000
  return (gramsNeeded / (NAOCL_MOLAR_MASS * efficiency)) * ELECTRONS_PER_MOLECULE * FARADAY_CONSTANT
}

export function etaSeconds(coulombsRemaining: number, currentAmps: number): number {
  if (!currentAmps || currentAmps <= 0) return Infinity
  return coulombsRemaining / currentAmps
}

export function progressFraction(coulombsSoFar: number, coulombsTotal: number): number {
  if (!coulombsTotal || coulombsTotal <= 0) return 0
  return Math.min(coulombsSoFar / coulombsTotal, 1)
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}
