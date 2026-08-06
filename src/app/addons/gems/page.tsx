import { Metadata } from 'next';
import GemPriceForm from './ui/GemPriceForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '보석 시세 · 로츠고 도구',
    description: '로스트아크 5~10레벨 겁화·작열 보석의 최저가를 확인하세요.'
};

export default function GemsPage() {
    return <GemPriceForm/>;
}
