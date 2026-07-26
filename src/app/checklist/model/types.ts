export type ControlStage = {
  stage: number;
  difficulty: string;
};

export const OTHER_GOLD_ICON_TYPES = [
  "other",
  "fate-ember",
  "relic-engraving",
  "bracelet-sale",
  "accessory-sale",
  "auction-share"
] as const;

export type OtherGoldIconType = typeof OTHER_GOLD_ICON_TYPES[number];

export type OtherGoldRecord = {
  id: string;
  icon: OtherGoldIconType;
  source: string;
  createdAt: string | null;
  gold: number;
};
