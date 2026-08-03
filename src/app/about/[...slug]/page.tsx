import { Metadata } from "next";
import { notFound } from "next/navigation";
import { findGuideMenu } from "../guideMenus";

type GuidePlaceholderPageProps = {
    params: Promise<{ slug: string[] }>;
};

async function getGuideMenu(params: GuidePlaceholderPageProps['params']) {
    const { slug } = await params;
    return findGuideMenu(`/about/${slug.join('/')}`);
}

export async function generateMetadata({ params }: GuidePlaceholderPageProps): Promise<Metadata> {
    const menu = await getGuideMenu(params);
    return {
        title: menu ? `${menu.item.label} · 로츠고 가이드` : '로츠고 가이드',
    };
}

export default async function GuidePlaceholderPage({ params }: GuidePlaceholderPageProps) {
    const menu = await getGuideMenu(params);
    if (!menu) notFound();

    return (
        <section className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-default-300 bg-default-50/40 px-6 text-center dark:border-white/15 dark:bg-white/[0.025]">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{menu.category.label}</p>
                <h1 className="mt-2 text-2xl font-bold">{menu.item.label}</h1>
                <p className="mt-3 text-sm text-default-400">상세 가이드는 다음 단계에서 작성할 예정입니다.</p>
            </div>
        </section>
    );
}
