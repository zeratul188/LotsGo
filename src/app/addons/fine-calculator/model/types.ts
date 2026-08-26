export type FineAction = {
    id: string;
    name: string;
    gold: number;
};

export type FineParticipant = {
    id: string;
    nickname: string;
    job: string;
    counts: Record<string, number>;
};

export type FinePreset = {
    id: string;
    name: string;
    actions: FineAction[];
    participants: FineParticipant[];
    createdAt: number;
};

export type ParticipantFineTotal = Pick<FineParticipant, "id" | "nickname" | "job"> & {
    total: number;
};

export type FineTransfer = {
    id: string;
    sender: ParticipantFineTotal;
    receiver: ParticipantFineTotal;
    settlementAmount: number;
    mailAmount: number;
};

export type FineSettlement = {
    totalFine: number;
    participantTotals: ParticipantFineTotal[];
    transfers: FineTransfer[];
    ignoreMailFee: boolean;
};
