import clsx from "clsx";
import { jobEmblemMap } from "@/Icons/job-emblems";

type JobEmblemIconProps = {
    job: string;
    size?: number;
    className?: string;
};

export default function JobEmblemIcon({
    job,
    size = 24,
    className
}: JobEmblemIconProps) {
    const normalizedJob = job.trim();
    const Icon = jobEmblemMap[normalizedJob as keyof typeof jobEmblemMap];

    if (!normalizedJob || !Icon) {
        return null;
    }

    return <Icon size={size} className={clsx("inline-block shrink-0", className)} />;
}
