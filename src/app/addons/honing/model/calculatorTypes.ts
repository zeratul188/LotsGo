import type { HoningMaterialKey, HoningMaterialPriceData } from './types';
import type { HoningPart, HoningTier } from '../data/honingRates';

export type { HoningPart, HoningTier };
export type HoningMode = 'optimal' | 'no-breath' | 'full-breath';
export type OwnedMaterialKey = Exclude<HoningMaterialKey, 'destiny-shard-pouch-large'> | 'destiny-shard';
export type OwnedMaterials = Record<OwnedMaterialKey, number>;

export type HoningSelection = { tier: HoningTier; part: HoningPart; level: number };
export type HoningCalculationInput = HoningSelection & { mode: HoningMode; owned: OwnedMaterials; prices: HoningMaterialPriceData; onlyOwned?: boolean; initialFailures?: number; initialArtisan?: number };
export type HoningSimulationOptions = { attempt: number; failures: number; artisan: number; useBook: boolean; useBreath: boolean; breathAmount?: number };

export type MaterialAmount = { key: OwnedMaterialKey; amount: number; paid: number; icon: string | null; name: string };
export type HoningAttempt = { attempt: number; baseChance: number; artisanBefore: number; artisanAfter: number; book: number; breath: number; finalChance: number; cost: number; materials: MaterialAmount[] };
export type HoningCalculation = { averageAttempts: number; averageCost: number; averageMaterials: MaterialAmount[]; pityAttempts: HoningAttempt[]; pityCost: number; pityMaterials: MaterialAmount[]; attempts: HoningAttempt[]; bookKey: OwnedMaterialKey | null; breathKey: OwnedMaterialKey; missingPrices: OwnedMaterialKey[] };
