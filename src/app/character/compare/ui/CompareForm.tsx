import { ComparisonMetricRow, EquipmentCompareSide, EquipmentComparisonRow, getAccessoryComparisonRows, getArkgridComparisonRows, getColorChipByKarmaType, getEngravingComparisonRows, getEquipmentComparisonRows, getGemComparisonRows, getKarmaComparisonRows, getStatComparisonRows, toExpeditionCharacter } from "../lib/compareFeat";
import { getColorTextByGrade, useMobileQuery } from "@/utiils/utils";
import { Card, CardBody, Chip, Divider } from "@heroui/react";
import { CharacterInfo } from "../../model/types";
import SearchEmptyIcon from "@/Icons/SearchEmptyIcon";
import clsx from "clsx";
import { getColorByType, getEngravingSrcByName, getParsedText, getTitleData, printEngravingLevel } from "../../lib/characterFeat";
import SupportorIcon from "@/Icons/SupportorIcon";
import AttackIcon from "@/Icons/AttackIcon";
import { AccessoriesComponent, ArkgridComponent, EquipmentComponent, GemComponent, StatComponent } from "../../characterlist/ui/CharacterForm";
import { CompareProfile } from "./CompareProfile";

// 검색되지 않았을 때 표시되는 내용
function NotSearchComponent() {
    return (
        <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <SearchEmptyIcon size={64} className="mb-2 text-default-400" />
            <p className="text-base text-foreground">검색한 캐릭터가 없습니다</p>
            <p className="text-xs mt-1 fadedtext mb-3">
                아직 캐릭터를 조회하지 않았거나 표시할 내용이 비어 있습니다.
            </p>
        </div>
    );
}

function NotSearchVerticalComponent() {
    return (
        <div className="w-full h-full gap-2 flex items-center justify-center">
            <SearchEmptyIcon size={64} className="text-default-400" />
            <div>
                <p className="text-base text-foreground">검색한 캐릭터가 없습니다</p>
                <p className="text-xs mt-1 fadedtext">
                    아직 캐릭터를 조회하지 않았거나 표시할 내용이 비어 있습니다.
                </p>
            </div>
        </div>
    );
}

// 캐릭터 정보 출력 컴포넌트
type CharactersComponentProps = {
    leftInfo: CharacterInfo | null;
    rightInfo: CharacterInfo | null;
};

export function CharactersComponent({ leftInfo, rightInfo }: CharactersComponentProps) {
    const isMobile = useMobileQuery();
    return (
        <div className="mt-8 flex w-full flex-col gap-5 [&_[data-slot=base]]:border [&_[data-slot=base]]:border-gray-200/80 [&_[data-slot=base]]:shadow-sm dark:[&_[data-slot=base]]:border-white/10 [&_h2]:flex [&_h2]:items-center [&_h2]:justify-center [&_h2]:gap-2 [&_h2]:tracking-tight [&_h2]:before:h-4 [&_h2]:before:w-1 [&_h2]:before:rounded-full [&_h2]:before:bg-primary [&_h2]:before:content-['']">
            <CompareProfile leftInfo={leftInfo} rightInfo={rightInfo}/>
            <Equipments leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <Accessories leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <Stats leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <KarmaSection leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <Engravings leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <Gems leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
            <ArkGrids leftInfo={leftInfo} rightInfo={rightInfo} isMobile={isMobile}/>
        </div>
    );
}

type CharacterProps = {
    leftInfo: CharacterInfo | null;
    rightInfo: CharacterInfo | null;
    isMobile: boolean;
};

const ATTACK_ARKGRID_OPTION_NAMES = ["공격력", "보스 피해", "추가 피해"];
const COMPARE_CARD_CLASS = "border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]";

// 캐릭터 타입에 맞게 아크 그리드 옵션 목록을 필터링한다.
function getFilteredArkgridOptions(info: CharacterInfo | null) {
    if (!info) {
        return [];
    }

    const sortedOptions = [...info.arkgrid.options].sort((a, b) => b.level - a.level);
    if (info.profile.characterType === "attack") {
        return sortedOptions.filter((item) => ATTACK_ARKGRID_OPTION_NAMES.includes(item.name));
    }

    return sortedOptions.filter((item) => !ATTACK_ARKGRID_OPTION_NAMES.includes(item.name));
}

function EquipmentSideValue({
    side,
    winner,
    align,
}: {
    side: EquipmentCompareSide | null;
    winner: boolean;
    align: "left" | "right";
}) {
    if (!side) {
        return <p className="text-center text-xs fadedtext">정보 없음</p>;
    }

    return (
        <div className={clsx(
            "min-w-0 rounded-lg border px-2 py-1.5",
            winner && align === "left" && "border-primary/30 bg-primary-50/70 dark:border-primary/30 dark:bg-primary/10",
            winner && align === "right" && "border-orange-300/50 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/10",
            !winner && "border-transparent bg-gray-50/80 dark:bg-white/[0.035]",
            align === "right" ? "text-right" : "text-left"
        )}>
            <div className={clsx(
                "flex items-center gap-1",
                align === "right" ? "justify-end" : "justify-start"
            )}>
                <p className="whitespace-nowrap text-sm font-bold">+{side.enhanceLevel}</p>
                {side.highUpgrade > 0 ? (
                    <Chip size="sm" radius="sm" variant="flat" color="primary" className="h-5 px-1 text-[9px]">
                        상재 +{side.highUpgrade}
                    </Chip>
                ) : null}
                {side.isEsther ? (
                    <Chip size="sm" radius="sm" variant="flat" color="secondary" className="h-5 px-1 text-[9px]">
                        에스더
                    </Chip>
                ) : null}
            </div>
            <p className="mt-0.5 whitespace-nowrap text-[10px] fadedtext">
                환산 {side.effectiveItemLevel.toLocaleString()} · 품질 {side.quality}
            </p>
        </div>
    );
}

function EquipmentComparisonResult({ row }: { row: EquipmentComparisonRow }) {
    const levelText = row.levelWinner === "special"
        ? "무기 유형 다름"
        : row.levelWinner === "unavailable"
            ? "비교 불가"
            : row.levelWinner === "equal"
                ? "장비 Lv 동일"
                : `장비 Lv +${row.levelDiff}`;
    const qualityText = row.qualityWinner === "unavailable"
        ? ""
        : row.qualityWinner === "equal"
            ? "품질 동일"
            : `품질 +${row.qualityDiff}`;

    return (
        <div className="min-w-[92px] text-center">
            <p className="whitespace-nowrap text-xs font-semibold">{row.type}</p>
            <p className={clsx(
                "mt-0.5 whitespace-nowrap text-[10px] font-medium",
                row.levelWinner === "left" && "text-primary",
                row.levelWinner === "right" && "text-orange-600 dark:text-orange-300",
                (row.levelWinner === "equal" || row.levelWinner === "unavailable") && "fadedtext",
                row.levelWinner === "special" && "text-secondary"
            )}>
                {row.levelWinner === "left" ? "← " : ""}
                {levelText}
                {row.levelWinner === "right" ? " →" : ""}
            </p>
            {qualityText ? (
                <p className={clsx(
                    "whitespace-nowrap text-[9px]",
                    row.qualityWinner === "left" && "text-primary",
                    row.qualityWinner === "right" && "text-orange-600 dark:text-orange-300",
                    row.qualityWinner === "equal" && "fadedtext"
                )}>
                    {row.qualityWinner === "left" ? "← " : ""}
                    {qualityText}
                    {row.qualityWinner === "right" ? " →" : ""}
                </p>
            ) : null}
        </div>
    );
}

function MetricSideValue({
    value,
    winner,
    align,
}: {
    value: string;
    winner: boolean;
    align: "left" | "right";
}) {
    return (
        <div className={clsx(
            "min-w-0 rounded-lg border px-2 py-2",
            winner && align === "left" && "border-primary/30 bg-primary-50/70 dark:border-primary/30 dark:bg-primary/10",
            winner && align === "right" && "border-orange-300/50 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/10",
            !winner && "border-transparent bg-gray-50/80 dark:bg-white/[0.035]",
            align === "right" ? "text-right" : "text-left"
        )}>
            <p className="whitespace-nowrap text-[11px] font-semibold">{value}</p>
        </div>
    );
}

function MetricComparisonResult({ row }: { row: ComparisonMetricRow }) {
    return (
        <div className="min-w-[96px] text-center">
            <p className="whitespace-nowrap text-xs font-semibold">{row.label}</p>
            <div className="mt-0.5 flex flex-col items-center gap-0.5">
                {row.differences.map((difference) => (
                    <p
                        key={`${row.key}-${difference.label}`}
                        className={clsx(
                            "whitespace-nowrap text-[9px] font-medium",
                            difference.winner === "left" && difference.tone === "primary" && "text-primary",
                            difference.winner === "right" && difference.tone === "primary" && "text-orange-600 dark:text-orange-300",
                            difference.tone === "warning" && "text-amber-600 dark:text-amber-300",
                            difference.tone === "secondary" && "text-secondary"
                        )}
                    >
                        {difference.winner === "left" ? "← " : ""}
                        {difference.label} {difference.value}
                        {difference.winner === "right" ? " →" : ""}
                    </p>
                ))}
            </div>
        </div>
    );
}

function MetricComparisonPanel({
    rows,
    leftName,
    rightName,
    canCompare,
    basis,
    equalText,
}: {
    rows: ComparisonMetricRow[];
    leftName?: string;
    rightName?: string;
    canCompare: boolean;
    basis: string;
    equalText: string;
}) {
    if (!canCompare) {
        return (
            <p className="rounded-xl bg-white/80 px-3 py-5 text-center text-xs fadedtext dark:bg-white/[0.035]">
                두 캐릭터를 모두 조회하면 비교가 표시됩니다.
            </p>
        );
    }

    if (rows.length === 0) {
        return (
            <p className="rounded-xl bg-white/80 px-3 py-5 text-center text-xs fadedtext dark:bg-white/[0.035]">
                {equalText}
            </p>
        );
    }

    return (
        <>
            <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[10px] fadedtext">
                <p className="whitespace-nowrap">{leftName}</p>
                <p className="whitespace-nowrap">{basis}</p>
                <p className="whitespace-nowrap">{rightName}</p>
            </div>
            <div className="flex flex-col gap-1.5">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1.5 dark:border-white/10 dark:bg-[#171717]"
                    >
                        <MetricSideValue
                            value={row.leftValue}
                            winner={row.differences.some((difference) => difference.winner === "left")}
                            align="left"
                        />
                        <MetricComparisonResult row={row}/>
                        <MetricSideValue
                            value={row.rightValue}
                            winner={row.differences.some((difference) => difference.winner === "right")}
                            align="right"
                        />
                    </div>
                ))}
            </div>
        </>
    );
}

// 장비 컴포넌트
function Equipments({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const equipmentComparisonRows = getEquipmentComparisonRows(leftCharacter, rightCharacter).filter(
        (row) =>
            row.levelWinner !== "equal" ||
            row.qualityWinner !== "equal"
    );
    const canCompareEquipment = Boolean(leftCharacter && rightCharacter);

    return (
        <>  
            {isMobile ? (
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <span className="h-5 w-1 rounded-full bg-primary"/>
                    장비
                </h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="lg" shadow="sm" className={COMPARE_CARD_CLASS}>
                    <CardBody>
                        {leftCharacter ? <EquipmentComponent character={leftCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div className="min-w-0">
                    {!isMobile ? (
                        <>
                            <h2 className="mb-1.5 flex w-full items-center justify-center gap-2 text-lg font-semibold">
                                장비
                            </h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        {!canCompareEquipment ? (
                            <p className="rounded-xl bg-white/80 px-3 py-5 text-center text-xs fadedtext dark:bg-white/[0.035]">
                                두 캐릭터를 모두 조회하면 비교가 표시됩니다.
                            </p>
                        ) : equipmentComparisonRows.length === 0 ? (
                            <p className="rounded-xl bg-white/80 px-3 py-5 text-center text-xs fadedtext dark:bg-white/[0.035]">
                                장비 환산 레벨과 품질이 모두 동일합니다.
                            </p>
                        ) : (
                            <>
                                <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[10px] fadedtext">
                                    <p className="whitespace-nowrap">{leftInfo?.nickname}</p>
                                    <p className="whitespace-nowrap">티어 · 강화 · 상급 재련 환산</p>
                                    <p className="whitespace-nowrap">{rightInfo?.nickname}</p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {equipmentComparisonRows.map((row) => (
                                        <div
                                            key={row.type}
                                            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1.5 dark:border-white/10 dark:bg-[#171717]"
                                        >
                                            <EquipmentSideValue
                                                side={row.left}
                                                winner={row.levelWinner === "left" || row.qualityWinner === "left"}
                                                align="left"
                                            />
                                            <EquipmentComparisonResult row={row}/>
                                            <EquipmentSideValue
                                                side={row.right}
                                                winner={row.levelWinner === "right" || row.qualityWinner === "right"}
                                                align="right"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <Card radius="lg" shadow="sm" className={COMPARE_CARD_CLASS}>
                    <CardBody>
                        {rightCharacter ? <EquipmentComponent character={rightCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

// 악세서리 컴포넌트
function Accessories({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const accessoryComparisonRows = getAccessoryComparisonRows(leftCharacter, rightCharacter);
    const canCompareAccessory = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">악세서리</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftCharacter ? <AccessoriesComponent character={leftCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            <h2 className="w-full text-center text-lg font-semibold mb-1.5">악세서리</h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        <MetricComparisonPanel
                            rows={accessoryComparisonRows}
                            leftName={leftInfo?.nickname}
                            rightName={rightInfo?.nickname}
                            canCompare={canCompareAccessory}
                            basis="유효 옵션 등급 · 품질"
                            equalText="유효 옵션, 품질, 팔찌와 스톤 점수가 모두 동일합니다."
                        />
                    </div>
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightCharacter ? <AccessoriesComponent character={rightCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

// 특성 컴포넌트
function Stats({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const statComparisonRows = getStatComparisonRows(leftCharacter, rightCharacter);
    const canCompareStat = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">특성</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftCharacter ? <StatComponent character={leftCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            <h2 className="w-full text-center text-lg font-semibold mb-1.5">특성</h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        <MetricComparisonPanel
                            rows={statComparisonRows}
                            leftName={leftInfo?.nickname}
                            rightName={rightInfo?.nickname}
                            canCompare={canCompareStat}
                            basis="공격력 · 생명력 · 주특성"
                            equalText="공격력, 생명력과 주특성 합이 모두 동일합니다."
                        />
                    </div>
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightCharacter ? <StatComponent character={rightCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

// 아크 패시브
function Karma({ leftInfo, rightInfo, isMobile }: CharacterProps) {

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">카르마</h3>
            ) : null}
            <div className="grid w-full items-start gap-1 min-[1257px]:gap-5 min-[1257px]:grid-cols-[420px_1fr_420px]">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftInfo ? <KarmaComponent info={leftInfo}/> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            {!isMobile ? (
                                <>
                                    <h2 className="w-full text-center text-lg font-semibold mb-1.5">카르마</h2>
                                    <Divider />
                                </>
                            ) : null}
                            <div className="mt-3 grid w-full grid-cols-2 gap-2 text-sm mb-2 min-[1257px]:mb-0">
                                {isMobile ? (
                                    <>
                                        <div className="w-full">
                                            <h3 className="font-semibold text-center">{leftInfo ? leftInfo.nickname : '-'}</h3>
                                            <Divider className="mt-1"/>
                                        </div>
                                        <div className="w-full">
                                            <h3 className="font-semibold text-center">{rightInfo ? rightInfo.nickname : '-'}</h3>
                                            <Divider className="mt-1"/>
                                        </div>
                                    </>
                                ) : null}

                            </div>
                        </>
                    ) : null}
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightInfo ? <KarmaComponent info={rightInfo}/> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

function KarmaComponent({ info }: { info: CharacterInfo }) {
    return (
        <div className="w-full flex flex-col gap-2">
            {info.arkpassive.points.map((point, idx) => {
                const parsed = point.description?.match(/^(\d+)(랭크)\s+(\d+)(레벨)$/);
                return (
                    <div key={idx} className="w-full flex gap-2 text-[10pt] items-center">
                        <Chip
                            radius="sm"
                            size="sm"
                            variant="flat"
                            color={getColorChipByKarmaType(point.type)}
                            className="min-w-[50px] text-center">
                            {point.type}
                        </Chip>
                        {!point.description ? (
                            <p className="fadedtext">미개방</p>
                        ) : parsed ? (
                            <p>
                                {parsed[1]}
                                <span className="fadedtext text-[8pt]">{parsed[2]}</span>{" "}
                                {parsed[3]}
                                <span className="fadedtext text-[8pt]">{parsed[4]}</span>
                            </p>
                        ) : (
                            <p>{point.description}</p>
                        )}
                        <p className={`ml-auto font-bold ${getColorByType(point.type)}`}>{point.point}</p>
                    </div>
                )
            })}
        </div>
    )
}

function KarmaSection({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const karmaComparisonRows = getKarmaComparisonRows(leftCharacter, rightCharacter);
    const canCompareKarma = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">카르마</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftInfo ? <KarmaComponent info={leftInfo}/> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            <h2 className="w-full text-center text-lg font-semibold mb-1.5">카르마</h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        <MetricComparisonPanel
                            rows={karmaComparisonRows}
                            leftName={leftInfo?.nickname}
                            rightName={rightInfo?.nickname}
                            canCompare={canCompareKarma}
                            basis="타입별 레벨 · 포인트"
                            equalText="카르마 레벨과 포인트가 모두 동일합니다."
                        />
                    </div>
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightInfo ? <KarmaComponent info={rightInfo}/> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

// 각인
function Engravings({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const engravingComparisonRows = getEngravingComparisonRows(leftCharacter, rightCharacter);
    const canCompareEngraving = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">각인</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                    <Card radius="sm" shadow="sm">
                        <CardBody>
                            {leftInfo ? <EngravingComponent info={leftInfo} /> : <NotSearchVerticalComponent />}
                        </CardBody>
                    </Card>
                    <div>
                        {!isMobile ? (
                            <>
                                <h2 className="w-full text-center text-lg font-semibold mb-1.5">각인</h2>
                                <Divider />
                            </>
                        ) : null}
                        <div className="mt-3 mb-2 min-[1257px]:mb-0">
                            <MetricComparisonPanel
                                rows={engravingComparisonRows}
                                leftName={leftInfo?.nickname}
                                rightName={rightInfo?.nickname}
                                canCompare={canCompareEngraving}
                                basis="등급 보정 · 각인 합"
                                equalText="등급 보정을 포함한 각인 합이 동일합니다."
                            />
                        </div>
                    </div>
                    <Card radius="sm" shadow="sm">
                        <CardBody>
                            {rightInfo ? <EngravingComponent info={rightInfo} /> : <NotSearchVerticalComponent />}
                        </CardBody>
                    </Card>
            </div>
        </>
    )
}

function EngravingComponent({ info }: { info: CharacterInfo }) {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {info.engravings.sort((a, b) => b.level - a.level).map((engraving, index) => (
                <div key={index} className={"flex gap-2 rounded-md items-center"}>
                    <img
                        src={getEngravingSrcByName(engraving.name)}
                        alt={engraving.name}
                        className="w-6 h-6 rounded-md"/>
                    <p className={`grow ${getColorTextByGrade(engraving.grade)}`}>{engraving.name}</p>
                    {engraving.stoneLevel > 0 ? (
                        <Chip size="sm" radius="sm" variant="faded" color="primary" className="min-w-[48px]">
                            <div className="flex gap-0.5 items-center justify-center font-bold">
                                <img
                                    src={'/icons/stoneicon.png'}
                                    alt="stone-icon"
                                    className="w-2.5 h-4"/>
                                <p className="text-[7pt]">×</p>
                                <p>{engraving.stoneLevel}</p>
                            </div>
                        </Chip>
                    ) : <></>}
                    <p className={`${getColorTextByGrade(engraving.grade)}`}>{printEngravingLevel(engraving.level)}</p>
                </div>
            ))}
        </div>
    )
}

// 보석
function Gems({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const gemComparisonRows = getGemComparisonRows(leftCharacter, rightCharacter);
    const canCompareGem = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">보석</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftCharacter ? <GemComponent character={leftCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            <h2 className="w-full text-center text-lg font-semibold mb-1.5">보석</h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        <MetricComparisonPanel
                            rows={gemComparisonRows}
                            leftName={leftInfo?.nickname}
                            rightName={rightInfo?.nickname}
                            canCompare={canCompareGem}
                            basis="티어 보정 레벨 · 공격력"
                            equalText="보석 레벨 합과 기본 공격력 증가량이 모두 동일합니다."
                        />
                    </div>
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightCharacter ? <GemComponent character={rightCharacter} /> : <NotSearchVerticalComponent />}
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

// 아크 그리드
function ArkGrids({ leftInfo, rightInfo, isMobile }: CharacterProps) {
    const leftCharacter = toExpeditionCharacter(leftInfo);
    const rightCharacter = toExpeditionCharacter(rightInfo);
    const leftArkgridOptions = getFilteredArkgridOptions(leftInfo);
    const rightArkgridOptions = getFilteredArkgridOptions(rightInfo);
    const arkgridComparisonRows = getArkgridComparisonRows(leftCharacter, rightCharacter);
    const canCompareArkgrid = Boolean(leftCharacter && rightCharacter);

    return (
        <>
            {isMobile ? (
                <h3 className="text-lg font-semibold">아크그리드</h3>
            ) : null}
            <div className="grid w-full items-start gap-2 rounded-2xl border border-gray-200/70 bg-gray-50/40 p-3 dark:border-white/10 dark:bg-white/[0.02] min-[1257px]:grid-cols-[420px_1fr_420px] min-[1257px]:gap-5">
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {leftCharacter ? <ArkgridComponent character={leftCharacter} /> : <NotSearchVerticalComponent />}
                        <Divider className="my-2"/>
                        <div className="w-full grid grid-cols-2 gap-2 text-xs">
                            {leftArkgridOptions.map((item, index) => (
                                <div key={index} className="w-full flex gap-1">
                                    <p>{item.name}</p>
                                    <p className="text-orange-700 dark:text-orange-400 ml-auto font-semibold">Lv.{item.level}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
                <div>
                    {!isMobile ? (
                        <>
                            <h2 className="w-full text-center text-lg font-semibold mb-1.5">아크그리드</h2>
                            <Divider />
                        </>
                    ) : null}
                    <div className="mt-3 mb-2 min-[1257px]:mb-0">
                        <MetricComparisonPanel
                            rows={arkgridComparisonRows}
                            leftName={leftInfo?.nickname}
                            rightName={rightInfo?.nickname}
                            canCompare={canCompareArkgrid}
                            basis="코어 등급 · 역할별 유효 효과"
                            equalText="코어 등급 합과 유효 효과 레벨 합이 모두 동일합니다."
                        />
                    </div>
                </div>
                <Card radius="sm" shadow="sm">
                    <CardBody>
                        {rightCharacter ? <ArkgridComponent character={rightCharacter} /> : <NotSearchVerticalComponent />}
                        <Divider className="my-2"/>
                        <div className="w-full grid grid-cols-2 gap-2 text-xs">
                            {rightArkgridOptions.map((item, index) => (
                                <div key={index} className="w-full flex gap-1">
                                    <p>{item.name}</p>
                                    <p className="text-orange-700 dark:text-orange-400 ml-auto font-semibold">Lv.{item.level}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}
