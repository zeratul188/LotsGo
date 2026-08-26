import type {
    FineAction,
    FineParticipant,
    FineSettlement,
    FineTransfer,
    ParticipantFineTotal
} from "../model/types";

export const MAX_FINE_ACTIONS = 10;
export const MAX_FINE_PARTICIPANTS = 20;
export const MAX_FINE_GOLD = 999_999_999;
export const MAIL_FEE_RATE = 0.05;

export function normalizeFineGold(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(MAX_FINE_GOLD, Math.max(0, Math.trunc(value)));
}

export function getParticipantFineTotal(
    participant: FineParticipant,
    actions: FineAction[]
): number {
    return actions.reduce((total, action) => {
        const count = Math.max(0, Math.trunc(participant.counts[action.id] ?? 0));
        return total + count * action.gold;
    }, 0);
}

export function calculateFineSettlement(
    participants: FineParticipant[],
    actions: FineAction[],
    ignoreMailFee: boolean
): FineSettlement {
    const participantTotals: ParticipantFineTotal[] = participants.map((participant) => ({
        id: participant.id,
        nickname: participant.nickname,
        job: participant.job,
        total: getParticipantFineTotal(participant, actions)
    }));
    const transfers: FineTransfer[] = [];
    const divisor = Math.max(1, participantTotals.length - 1);

    for (let leftIndex = 0; leftIndex < participantTotals.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < participantTotals.length; rightIndex += 1) {
            const left = participantTotals[leftIndex];
            const right = participantTotals[rightIndex];
            const leftShare = Math.ceil(left.total / divisor);
            const rightShare = Math.ceil(right.total / divisor);
            const settlementAmount = Math.abs(leftShare - rightShare);

            if (settlementAmount === 0) continue;

            const sender = leftShare > rightShare ? left : right;
            const receiver = leftShare > rightShare ? right : left;
            const mailAmount = ignoreMailFee
                ? settlementAmount
                : Math.ceil(settlementAmount / (1 - MAIL_FEE_RATE));

            transfers.push({
                id: `${sender.id}-${receiver.id}`,
                sender,
                receiver,
                settlementAmount,
                mailAmount
            });
        }
    }

    return {
        totalFine: participantTotals.reduce((total, participant) => total + participant.total, 0),
        participantTotals,
        transfers,
        ignoreMailFee
    };
}
