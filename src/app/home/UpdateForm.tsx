import Image from "next/image";
import { useEffect, useState } from "react"
import data from '@/data/mains/data.json';
import clsx from "clsx";
import { Pagination } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdateComponent() {
    const [page, setPage] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setPage((prev) => {
                let value = prev;
                value++;
                if (value > data.length) {
                    value = 1;
                }
                return value;
            })
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full mb-6">
            <div className="w-full aspect-[3/1] relative">
                <motion.div
                    className={clsx(
                        "w-full h-full sm:h-1/2 rounded-xl p-5 sm:p-10 flex flex-col gap-1 justify-center sm:justify-end absolute bottom-0",
                        data[page - 1].isBlack ? "text-black" : "text-white"
                    )}
                    animate={{ backgroundColor: data[page - 1].color }}
                    transition={{ duration: 0.6 }}
                    >
                    <Pagination
                        loop
                        size="sm"
                        radius="full"
                        page={page}
                        total={data.length}
                        classNames={{
                        wrapper: "z-3 hidden sm:flex",
                        item: "bg-white/20 text-black/50 cursor-pointer",
                        cursor: "bg-white/50 text-black",
                        }}
                        onChange={setPage}
                    />
                    <div className="grow" />
                    <p className="text-md sm:text-lg z-2">{data[page - 1].sub}</p>
                    <p className="text-xl sm:text-3xl font-bold z-2">{data[page - 1].title}</p>
                </motion.div>
                <AnimatePresence mode="wait">
                    <motion.div
                    key={`img-${page}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 z-1 w-full h-full"
                    >
                    <Image
                        src={data[page - 1].url}
                        alt={`${data[page - 1].sub} ${data[page - 1].title}`}
                        fill
                        className="object-contain"
                    />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}