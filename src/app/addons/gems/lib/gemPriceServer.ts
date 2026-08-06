import 'server-only';
import { adminDatabase } from '@/utiils/firebaseAdmin';
import { normalizeGemPriceData, GemPriceData } from '../model/types';

export async function loadGemPrices(): Promise<GemPriceData | null> {
    try {
        const snapshot = await adminDatabase.ref('/gem-prices/current').once('value');
        return normalizeGemPriceData(snapshot.val());
    } catch (error) {
        console.error('Failed to load gem price snapshot', error);
        return null;
    }
}
