import 'server-only';
import { adminDatabase } from '@/utiils/firebaseAdmin';
import { HoningMaterialPriceData, normalizeHoningMaterialPriceData } from '../model/types';

export async function loadHoningMaterialPrices(): Promise<HoningMaterialPriceData | null> {
    try {
        const snapshot = await adminDatabase.ref('/honing-material-prices/current').once('value');
        return normalizeHoningMaterialPriceData(snapshot.val());
    } catch (error) {
        console.error('Failed to load honing material price snapshot', error);
        return null;
    }
}
