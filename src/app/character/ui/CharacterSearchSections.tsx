'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button, Input } from "@heroui/react";
import { SetStateFn, useMobileQuery } from "@/utiils/utils";
import JobEmblemIcon from "@/Icons/JobEmblemIcon";
import type { RootState } from "../../store/store";
import type { Character } from "../../store/loginSlice";
import { handleSearch } from "../lib/characterFeat";
import type { CharacterHistory } from "../lib/history";

type SearchComponentProps = {
    setSearched: SetStateFn<boolean>,
    setLoading: SetStateFn<boolean>,
    setNickname: SetStateFn<string>
}

export function SearchComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const [search, setSearch] = useState('');
    const router = useRouter();
    const isMobile = useMobileQuery();

    const searchCharacter = () => {
        handleSearch(search, setSearched, setLoading, setNickname);
    };

    return (
        <section className="mx-auto w-full max-w-[820px] py-10 sm:py-14">
            <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Character Search</p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">전투 정보실</h1>
                <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-default-500 sm:text-base">캐릭터의 장비, 각인, 보석과 전투 정보를 한곳에서 확인하세요.</p>
            </div>
            <div className="mt-8 rounded-2xl border border-divider bg-content1 p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        size="lg"
                        radius="lg"
                        placeholder="캐릭터명을 입력하세요."
                        maxLength={12}
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                searchCharacter();
                                const params = new URLSearchParams(window.location.search);
                                params.set("nickname", search);
                                const newUrl = `${window.location.pathname}?${params.toString()}`;
                                window.history.pushState({}, "", newUrl);
                            }
                        }}
                        className="w-full"
                        startContent={<span className="text-lg text-default-400">⌕</span>}/>
                    <Button
                        size="lg"
                        radius="lg"
                        color="primary"
                        className="w-full shrink-0 sm:w-[112px]"
                        onPress={searchCharacter}>
                        검색
                    </Button>
                </div>
                <p className="mt-2 text-xs text-default-400">캐릭터명을 입력한 뒤 Enter 키를 눌러도 검색할 수 있습니다.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                        fullWidth={isMobile}
                        size="sm"
                        radius="lg"
                        color="default"
                        variant="flat"
                        onPress={() => router.push('/character/characterlist')}>
                        원정대 모아보기
                    </Button>
                    <Button
                        fullWidth={isMobile}
                        size="sm"
                        radius="lg"
                        color="default"
                        variant="flat"
                        onPress={() => router.push('/character/compare')}>
                        캐릭터 비교
                    </Button>
                </div>
            </div>
        </section>
    )
}

function CharacterListRow({
    nickname,
    job,
    server,
    level,
    meta,
    onPress,
}: {
    nickname: string;
    job: string;
    server: string;
    level: number;
    meta: string;
    onPress: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-default-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:hover:bg-white/[0.05]"
        >
            <JobEmblemIcon job={job} size={36}/>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{nickname}</span>
                <span className="mt-0.5 block truncate text-[11px] text-default-500">{server} · {job} · {meta}</span>
            </span>
            <span className="shrink-0 text-right">
                <span className="block text-[10px] text-default-400">아이템 레벨</span>
                <span className="mt-0.5 block text-sm font-semibold tabular-nums text-foreground">{level.toLocaleString()}</span>
            </span>
        </button>
    );
}

function ListSectionHeader({ title, count, subtitle, type }: { title: string; count: number; subtitle: string; type: 'history' | 'expedition' }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-default-200/80 px-4 py-3 dark:border-white/10 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
                {type === 'history' ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-default-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-default-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 3.5 5v1"/></svg>
                )}
                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
                    <p className="mt-0.5 text-xs text-default-500">{subtitle}</p>
                </div>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-default-500">{count}명</span>
        </div>
    );
}

export function HistoryComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const [historys, setHistorys] = useState<CharacterHistory[]>([]);

    useEffect(() => {
        const storedHistorys = localStorage.getItem('historys');
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7*24*60*60*1000);
        if (storedHistorys) {
            const parsed = JSON.parse(storedHistorys) as CharacterHistory[];
            const restored = parsed.map(item => ({
                ...item,
                date: new Date(item.date)
            }));
            setHistorys(restored.filter(item => item.date >= oneWeekAgo).reverse());
        }
    }, [])

    return (
        <section className="w-full overflow-hidden rounded-xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <ListSectionHeader title="최근 기록" count={historys.length} subtitle="최근 7일 동안 검색한 캐릭터" type="history" />
            <div className="max-h-[460px] divide-y divide-default-100 overflow-y-auto px-2 py-1 dark:divide-white/[0.06]">
                {historys.length ? historys.map((character, index) => (
                    <CharacterListRow
                        key={`${character.nickname}-${index}`}
                        nickname={character.nickname}
                        job={character.job}
                        server={`@${character.server}`}
                        level={character.level}
                        meta={`${character.date.getMonth() + 1}/${character.date.getDate()} 검색`}
                        onPress={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}
                    />
                )) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                        <span className="text-2xl text-default-400">⌕</span>
                        <p className="mt-2 text-sm text-default-500">최근에 검색한 캐릭터가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export function RecentCharacterSearchMenu({
    historys,
    onSelect
}: {
    historys: CharacterHistory[];
    onSelect: (nickname: string) => void;
}) {
    return (
        <div
            role="listbox"
            aria-label="최근 검색한 캐릭터"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-default-200 bg-content1 p-2 shadow-xl dark:border-white/10 dark:bg-[#1b1b1b]">
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <p className="text-xs font-semibold text-default-500">최근 검색</p>
                <span className="text-[11px] text-default-400">최대 5개</span>
            </div>
            {historys.length > 0 ? (
                <div className="space-y-1">
                    {historys.map((character) => (
                        <button
                            key={character.nickname}
                            type="button"
                            role="option"
                            aria-selected="false"
                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30"
                            onClick={() => onSelect(character.nickname)}>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-default-100 text-foreground dark:bg-white/[0.06]">
                                <JobEmblemIcon job={character.job} size={30}/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-foreground">{character.nickname}</span>
                                <span className="mt-0.5 block truncate text-xs text-default-500">{character.job} · Lv.{character.level.toLocaleString()}</span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="px-2 py-4 text-center text-xs text-default-400">최근 검색한 캐릭터가 없습니다.</p>
            )}
        </div>
    );
}

export function ExpeditionComponent({ setSearched, setLoading, setNickname }: SearchComponentProps) {
    const expedition: Character[] = useSelector((state: RootState) => state.login.user.expedition);
    return (
        <section className="w-full overflow-hidden rounded-xl border border-default-200/80 bg-content1 shadow-sm dark:border-white/10 dark:bg-[#171717] dark:shadow-none">
            <ListSectionHeader title="내 원정대 목록" count={expedition.length} subtitle="등록된 캐릭터를 빠르게 확인" type="expedition" />
            <div className="max-h-[460px] divide-y divide-default-100 overflow-y-auto px-2 py-1 dark:divide-white/[0.06]">
                {expedition.length ? expedition.map((character, index) => (
                    <CharacterListRow
                        key={`${character.nickname}-${index}`}
                        nickname={character.nickname}
                        job={character.job}
                        server={character.server}
                        level={character.level}
                        meta="원정대 캐릭터"
                        onPress={() => handleSearch(character.nickname, setSearched, setLoading, setNickname)}
                    />
                )) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                        <span className="text-2xl text-default-400">♙</span>
                        <p className="mt-2 text-sm text-default-500">로그인이 되어있지 않거나 등록된 원정대 캐릭터가 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    )
}
