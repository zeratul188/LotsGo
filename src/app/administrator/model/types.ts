import type { Badge as ApiBadge } from "../../api/administrator/badge/route";
import type { BadgeToUser as ApiBadgeToUser } from "../../api/badgetomembers/route";
import type { Donate as ApiDonate } from "../../api/administrator/donate/route";
import type { Boss as ApiBoss, Difficulty as ApiDifficulty } from "../../api/checklist/boss/route";
import type { Cube as ApiCube } from "../../api/checklist/cube/route";
import type { Member as ApiMember } from "../../api/auth/members/route";
import type { History as SettingHistory } from "../../setting/model/types";

export type Badge = ApiBadge;
export type BadgeToUser = ApiBadgeToUser;
export type Donate = ApiDonate;
export type Boss = ApiBoss;
export type Difficulty = ApiDifficulty;
export type Cube = ApiCube;
export type Member = ApiMember;
export type History = SettingHistory;

export type ActivityLevel = "success" | "warning" | "danger" | "default";
