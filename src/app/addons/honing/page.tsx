import { Metadata } from 'next';
import HoningMaterialPriceForm from './ui/HoningMaterialPriceForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '재련 최적화 · 로츠고 도구',
    description: '로스트아크 재련 재료 시세를 확인하고 강화 비용과 최적화를 계산합니다.'
};

export default function HoningPage() {
    return <HoningMaterialPriceForm/>;
}
