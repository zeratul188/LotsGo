import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: '도구 · 로츠고 가이드',
    description: '로츠고 사이트에서 도구 기능을 어떻게 이용하는 방법에 대해서 알려드립니다.',
};

export default function Addons() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">도구</h1>
            <p>로스트아크에서 경매 계산기, 유물 각인서 시세 등과 같은 유용하게 이용할 수 있는 도구들을 제공해드립니다.</p>
            <h1 className="font-bold mt-10 mb-2">경매 계산기</h1>
            <Image src="/about/addons1.webp" alt="로츠고 경매 계산기" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>레이드를 마치고 경매 중에 가격이 비싼 아이템을 얼마나 입찰을 해야할지 계산해주는 경매 계산기입니다.</p>
            <p>경매 아이템 가격과 인원 수를 입력하면 자동으로 계산이 되며, 해당 항목을 클릭하면 경매가가 자동으로 클립보드에 복사됩니다.</p>
            <p>자주 이용하는 경매 아이템 가격이라면 "저장" 버튼을 통해 컴퓨터 브라우저에 기록을 저장할 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">유물 각인서 시세</h1>
            <Image src="/about/addons2.webp" alt="로츠고 유물 각인서 시세 목록" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>현재 로스트아크의 유물 각인서 시세를 높은 가격 순서대로 확인하실 수 있습니다.</p>
            <p>유물 각인서 시세 업데이트는 매 정각마다 자동으로 업데이트가 되며, 하루에 1번씩 그 당시의 가격을 매일 기록합니다.</p>
            <Image src="/about/addons3.webp" alt="로츠고 유물 각인서 특정 차트" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>"기록 보기"를 통해 해당 유물각인서의 시세가 얼마나 변동하는지 확인하실 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">버스 계산기</h1>
            <Image src="/about/addons4.webp" alt="로츠고 버스 계산기" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>
                로스트아크에서 골드를 벌기 위해 버스를 돌리게 되면서 독식 입찰, 기사와 손님의 비율이 다를 경우 손님이 
                거래해야 할 금액이 독식 금액, 미참 금액에 따라 달라지게 됩니다.
            </p>
            <p>매번 복잡하게 계산할 필요없이 로츠고 버스 계산기를 통해 손쉽게 계산을 해드립니다.</p>
            <p>인원수, 기사 인원 수, 버스비를 입력하고 계산된 값을 누르면 자동으로 클립보드에 복사됩니다.</p>
            <Image src="/about/addons5.webp" alt="로츠고 입찰 아이템 분배" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>버스를 마치고 경매 입찰을 할 때 유물 각인서 등 값비싼 아이템을 분배를 해야 할 경우에 이 계산기를 이용합니다.</p>
            <p>기사 인원 수, 경매 아이템 가격만 입력하면 자동으로 계산되어 분배 금액을 알려드립니다.</p>
            <p className="mt-2">위 버스 계산기의 계산은 최초 입찰 골드(50골드)와 신뢰도로 인한 수수료는 무시하고 계산됩니다.</p>
        </div>   
    )
}