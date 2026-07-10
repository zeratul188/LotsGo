import type { ComponentType, SVGProps } from "react";

import JobEmblem01 from "./generated/JobEmblem01";
import JobEmblem02 from "./generated/JobEmblem02";
import JobEmblem03 from "./generated/JobEmblem03";
import JobEmblem04 from "./generated/JobEmblem04";
import JobEmblem05 from "./generated/JobEmblem05";
import JobEmblem06 from "./generated/JobEmblem06";
import JobEmblem07 from "./generated/JobEmblem07";
import JobEmblem08 from "./generated/JobEmblem08";
import JobEmblem09 from "./generated/JobEmblem09";
import JobEmblem10 from "./generated/JobEmblem10";
import JobEmblem11 from "./generated/JobEmblem11";
import JobEmblem12 from "./generated/JobEmblem12";
import JobEmblem13 from "./generated/JobEmblem13";
import JobEmblem14 from "./generated/JobEmblem14";
import JobEmblem15 from "./generated/JobEmblem15";
import JobEmblem16 from "./generated/JobEmblem16";
import JobEmblem17 from "./generated/JobEmblem17";
import JobEmblem18 from "./generated/JobEmblem18";
import JobEmblem19 from "./generated/JobEmblem19";
import JobEmblem20 from "./generated/JobEmblem20";
import JobEmblem21 from "./generated/JobEmblem21";
import JobEmblem22 from "./generated/JobEmblem22";
import JobEmblem23 from "./generated/JobEmblem23";
import JobEmblem24 from "./generated/JobEmblem24";
import JobEmblem25 from "./generated/JobEmblem25";
import JobEmblem26 from "./generated/JobEmblem26";
import JobEmblem27 from "./generated/JobEmblem27";
import JobEmblem28 from "./generated/JobEmblem28";
import JobEmblem29 from "./generated/JobEmblem29";
import JobEmblem30 from "./generated/JobEmblem30";

export type JobEmblemComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const jobEmblemMap = {
    "가디언나이트": JobEmblem01,
    "건슬링어": JobEmblem02,
    "기공사": JobEmblem03,
    "기상술사": JobEmblem04,
    "데모닉": JobEmblem05,
    "데빌헌터": JobEmblem06,
    "도화가": JobEmblem07,
    "디스트로이어": JobEmblem08,
    "리퍼": JobEmblem09,
    "바드": JobEmblem10,
    "발키리": JobEmblem11,
    "배틀마스터": JobEmblem12,
    "버서커": JobEmblem13,
    "브레이커": JobEmblem14,
    "블래스터": JobEmblem15,
    "블레이드": JobEmblem16,
    "서머너": JobEmblem17,
    "소서리스": JobEmblem18,
    "소울이터": JobEmblem19,
    "스카우터": JobEmblem20,
    "스트라이커": JobEmblem21,
    "슬레이어": JobEmblem22,
    "아르카나": JobEmblem23,
    "워로드": JobEmblem24,
    "인파이터": JobEmblem25,
    "창술사": JobEmblem26,
    "호크아이": JobEmblem27,
    "홀리나이트": JobEmblem28,
    "환수사": JobEmblem29,
    "차원술사": JobEmblem30
} as const;

export type JobEmblemName = keyof typeof jobEmblemMap;
