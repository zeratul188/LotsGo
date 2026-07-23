import { useEffect, useState } from "react"
import data from '@/data/mains/data.json';
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdateComponent() {
    const [page, setPage] = useState(1);
    const update = data[page - 1];

    useEffect(() => {
        const interval = setInterval(() => {
            setPage((prev) => prev >= data.length ? 1 : prev + 1);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const movePage = (direction: 'previous' | 'next') => {
        setPage((currentPage) => {
            if (direction === 'previous') {
                return currentPage <= 1 ? data.length : currentPage - 1;
            }
            return currentPage >= data.length ? 1 : currentPage + 1;
        });
    }

    return (
        <section
            aria-label="로스트아크 주요 업데이트"
            aria-roledescription="carousel"
            className="mb-6 w-full">
            <div
                className={clsx(
                    "relative isolate h-[130px] w-full overflow-hidden rounded-2xl sm:h-auto sm:aspect-[3/1] sm:overflow-visible sm:rounded-none",
                    update.isBlack ? "text-gray-950" : "text-white"
                )}>
                <motion.div
                    aria-hidden="true"
                    className={clsx(
                        "absolute bottom-0 h-full w-full overflow-hidden rounded-2xl border shadow-[0_12px_35px_rgba(15,23,42,0.12)] sm:h-1/2",
                        update.isBlack ? "border-black/10" : "border-white/10"
                    )}
                    animate={{ backgroundColor: update.color }}
                    transition={{ duration: 0.5 }}>
                    <div
                        className="absolute inset-0 opacity-80"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 12% 10%, rgba(255,255,255,0.2), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 55%)'
                        }}/>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.img
                        key={`update-image-${page}`}
                        src={update.url}
                        alt=""
                        draggable={false}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain object-[right_bottom] sm:object-right"/>
                </AnimatePresence>

                <div
                    aria-hidden="true"
                    className={clsx(
                        "absolute inset-0 z-[15] h-full w-full overflow-hidden rounded-2xl sm:inset-x-0 sm:top-auto sm:bottom-0 sm:h-1/2",
                        update.isBlack
                            ? "bg-gradient-to-r from-white/90 via-white/55 to-transparent sm:from-white/60 sm:via-white/15"
                            : "bg-gradient-to-r from-black/75 via-black/40 to-transparent sm:from-black/45 sm:via-black/10"
                    )}/>

                <div
                    aria-live="polite"
                    className="absolute inset-0 z-20 flex h-full w-full flex-col justify-end px-6 py-5 sm:inset-x-0 sm:top-auto sm:bottom-0 sm:h-1/2 sm:justify-between sm:px-6 sm:py-4 lg:px-9 lg:py-7">
                    <div className="hidden items-center gap-2 sm:flex">
                        <button
                            type="button"
                            aria-label="이전 업데이트"
                            className={clsx(
                                "flex h-7 w-7 items-center justify-center rounded-full border text-base transition-colors sm:h-8 sm:w-8 sm:text-lg",
                                update.isBlack
                                    ? "border-black/15 bg-black/5 hover:bg-black/10"
                                    : "border-white/25 bg-white/10 hover:bg-white/20"
                            )}
                            onClick={() => movePage('previous')}>
                            <span aria-hidden="true">‹</span>
                        </button>

                        <div className="flex items-center gap-1.5 px-1">
                            {data.map((item, index) => {
                                const itemPage = index + 1;
                                const isSelected = itemPage === page;

                                return (
                                    <button
                                        key={item.title}
                                        type="button"
                                        aria-label={`${itemPage}번째 업데이트 보기`}
                                        aria-current={isSelected ? 'true' : undefined}
                                        className={clsx(
                                            "h-1.5 rounded-full bg-current transition-all",
                                            isSelected ? "w-6 opacity-100" : "w-1.5 opacity-35 hover:opacity-70"
                                        )}
                                        onClick={() => setPage(itemPage)}/>
                                )
                            })}
                        </div>

                        <button
                            type="button"
                            aria-label="다음 업데이트"
                            className={clsx(
                                "flex h-7 w-7 items-center justify-center rounded-full border text-base transition-colors sm:h-8 sm:w-8 sm:text-lg",
                                update.isBlack
                                    ? "border-black/15 bg-black/5 hover:bg-black/10"
                                    : "border-white/25 bg-white/10 hover:bg-white/20"
                            )}
                            onClick={() => movePage('next')}>
                            <span aria-hidden="true">›</span>
                        </button>

                        <span className="ml-1 text-[10px] font-medium tabular-nums opacity-60 sm:text-xs">
                            {String(page).padStart(2, '0')} / {String(data.length).padStart(2, '0')}
                        </span>
                    </div>

                    <div>
                        <p className="mb-0.5 text-xs font-semibold opacity-80 sm:text-sm lg:text-base">{update.sub}</p>
                        <h2 className="max-w-[62%] break-keep text-balance text-base font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                            {update.title.replace(' : ', '\u00A0:\u00A0')}
                        </h2>
                    </div>
                </div>
            </div>
        </section>
    )
}
