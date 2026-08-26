import clsx from "clsx";

const titleIconSrc: Record<string, string> = {
    "세계수의 축복 받은 자": "/title-icons/world-tree-blessed.png",
    "세계수의 축복을 받은 자": "/title-icons/world-tree-blessed.png",
    "홍염의 군주": "/title-icons/flame-lord.png",
    "에스더의 결속자": "/title-icons/esther-bond.png",
    "혹한의 군주": "/title-icons/frost-lord.png",
    "심연의 군주": "/title-icons/abyss-lord.png",
    "이클립스": "/title-icons/eclipse.png",
    "삼라만상": "/title-icons/all-creation.png",
    "에스더의 후계자": "/title-icons/esther-successor.png",
    "천리안": "/title-icons/clairvoyance.png",
    "몽환의 지배자": "/title-icons/phantom-ruler.png",
    "쾌락의 탐닉자": "/title-icons/pleasure-devotee.png",
    "마수의 포효": "/title-icons/beast-roar.png",
    "광기의 그림자": "/title-icons/madness-shadow.png",
    "죽음을 부르는 자": "/title-icons/death-caller.png"
};

export function hasTitleIcon(title: string): boolean {
    return Boolean(titleIconSrc[title]);
}

export function TitleIcon({ title, className }: { title: string, className?: string }) {
    const src = titleIconSrc[title];

    if (!src) return null;

    return (
        <img
            src={src}
            alt=""
            aria-hidden="true"
            className={clsx("shrink-0 object-contain", className)}
        />
    );
}
