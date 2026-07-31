import homeData from "@/data/home/data.json";
import type { ExpeditionCharacter } from "../characterlist/model/types";
import {
    getAverageCombatPower,
    getAverageItemLevel,
    getMaxCombatPower,
    getMaxItemLevel,
    getMinCombatPower,
    getMinItemLevel
} from "./expeditionStatFeat";

export function getExpeditionCharacterSummary(
    characters: ExpeditionCharacter[],
    expeditionCharacters: ExpeditionCharacter[]
) {
    const dealerCharacters = characters.filter(character => character.profile.characterType === 'attack');
    const supportCharacters = characters.filter(character => character.profile.characterType === 'supportor');
    const contentLevels = [...homeData.contentLevels]
        .filter((contentLevel) => contentLevel >= 1580)
        .sort((a, b) => b - a);

    const combatPowerByLevelRange = contentLevels.map((currentLevel, index) => {
        const upperLevel = index === 0 ? null : contentLevels[index - 1];
        const targetCharacters = expeditionCharacters.filter(character => {
            const itemLevel = character.profile.itemLevel;

            if (upperLevel === null) {
                return itemLevel >= currentLevel;
            }

            return itemLevel >= currentLevel && itemLevel < upperLevel;
        });

        return {
            label: upperLevel === null
                ? `${currentLevel} ~`
                : `${currentLevel} ~ ${upperLevel-1}`,
            averageCombatPower: getAverageCombatPower(targetCharacters)
        };
    });

    return {
        averageCombatPower: getAverageCombatPower(characters),
        averageDealerCombatPower: getAverageCombatPower(dealerCharacters),
        averageSupportCombatPower: getAverageCombatPower(supportCharacters),
        maxCombatPower: getMaxCombatPower(characters),
        minCombatPower: getMinCombatPower(characters),
        averageItemLevel: getAverageItemLevel(characters),
        averageDealerItemLevel: getAverageItemLevel(dealerCharacters),
        averageSupportItemLevel: getAverageItemLevel(supportCharacters),
        maxItemLevel: getMaxItemLevel(characters),
        minItemLevel: getMinItemLevel(characters),
        combatPowerByLevelRange
    };
}
