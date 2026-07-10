import clsx from "clsx";

import JobEmblemIcon from "@/Icons/JobEmblemIcon";

type JobAvatarSize = "sm" | "md" | "lg" | number;

const emblemSizeMap: Record<"sm" | "md" | "lg", number> = {
    sm: 28,
    md: 38,
    lg: 48
};

type JobAvatarProps = {
    job: string;
    size?: JobAvatarSize;
    className?: string;
};

export default function JobAvatar({
    job,
    size = "md",
    className
}: JobAvatarProps) {
    const resolvedSize = typeof size === "number" ? size : emblemSizeMap[size];

    return (
        <JobEmblemIcon
            job={job}
            size={resolvedSize}
            className={clsx("shrink-0 text-black dark:text-white", className)}
        />
    );
}
