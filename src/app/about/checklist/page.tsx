import { Metadata } from "next";

export const metadata: Metadata = {
    title: '숙제 · 로츠고 가이드',
    description: '로츠고 사이트에서 숙제 기능을 어떻게 이용하는 방법에 대해서 알려드립니다.',
};

export default function Checklist() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">숙제</h1>
            <p>캐릭터들을 등록하여 일일 콘텐츠, 주간 콘텐츠 등을 기록하고 관리할 수 잇는 기능입니다.</p>
            <img src="/about/checklist1.webp" alt="로츠고 숙제 페이지" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <h1 className="font-bold mt-10 mb-2">숙제 초기 세팅</h1>
            <p>초기세팅은 회원가입 후 숙제 페이지로 이동하면 별도 설정없이 자동으로 초기세팅이 완료됩니다.</p>
            <p>초기세팅 내용은 회원가입 시 등록했던 원정대에서 레벨이 높은 순서대로 6캐릭이 골드 지정으로 선택된 상태에서 자동으로 등록됩니다.</p>
            <p>추가된 캐릭터는 주요 콘텐츠에서 레벨이 맞는 주간 레이드를 레벨 높은 순서대로 3개의 레이드가 주간 콘텐츠에 추가됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">캐릭터 추가하기</h1>
            <div className="w-full grid sm:grid-cols-[1fr_2fr] gap-4">
                <img src="/about/checklist2.webp" alt="로츠고 캐릭터 추가" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <ul className="list-decimal pl-4">
                    <li>페이지 상단에 고정된 요소에서 "캐릭터 추가"를 누르면 창이 나오게 됩니다.</li>
                    <li>추가할 캐릭터 명 또는 해당 원정대의 대표 캐릭터 명을 입력하신 후 "조회" 버튼을 통해 데이터를 불러옵니다.</li>
                    <li>해당 캐릭터 명이 있는 원정대 데이터가 불러와지며 추가할 캐릭터들을 체크합니다.</li>
                    <li>골드 지정이 필요한 경우 "골드 지정"을 체크하시면 골드 지정이 된 캐릭터로 추가가 가능합니다.</li>
                    <li>"추가" 버튼을 누르게 되면 체크된 캐릭터들이 추가되며 주간 콘텐츠도 자동으로 3개가 채워집니다.</li>
                </ul>
            </div>
            <h1 className="font-bold mt-10 mb-2">남은 숙제 확인하기</h1>
            <img src="/about/checklist3.webp" alt="로츠고 남은 숙제 확인" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>서버 선택 우측에 위치한 "남은 숙제 현황 보기"를 누르면 현재 체크하지 않은 주간 콘텐츠를 표시합니다.</p>
            <p>항목의 좌측의 색은 골드 지정된 레이드를 뜻합니다. 노란색은 골드 지정 레이드이며, 회색은 골드 지정이 아닌 레이드를 뜻합니다.</p>
            <p>콘텐츠 선택으로 특정 콘텐츠를 선택하면 해당 레이드의 체크하지 않은 항목만 표시됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">계정 관리하기</h1>
            <div className="w-full grid sm:grid-cols-[1fr_2fr] gap-2 mb-2">
                <div className="w-full flex flex-col gap-2">
                    <img src="/about/checklist11.webp" alt="로츠고 계정 버튼 위치" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                    <img src="/about/checklist12.webp" alt="로츠고 계정 관리" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                </div>
                <div className="w-full">
                    <p>로스트아크를 플레이 할 경우 다계정을 이용하게 되면 숙제로 등록된 캐릭터 수가 많아졌을 경우 캐릭터마다 계정을 지정하여 관리하실 수 있습니다.</p>
                    <p>캐릭터 설정 버튼을 눌러 "계정 선택"을 통해 캐릭터의 계정을 지정하실 수 있습니다.</p>
                    <p>
                        2번째 이미지를 보시면 기존에 등록되어 있던 계정을 선택하거나 새로운 계정을 등록할려면 하단의 입력란에 새로운 계정명을 입력하신 후 "계정 추가"를 통해 
                        계정을 추가하고 추가된 계정을 선택하여 "계정 선택"을 통해 계정을 지정하실 수 있습니다.
                    </p>
                    <p>이후 계정마다 숙제를 간략하게 확인하고 싶으시다면 상단의 "검색 필터"를 통해 계정 별로 검색하실 수 있습니다.</p>
                </div>
            </div>
            <h1 className="font-bold mt-10 mb-2">휴식 게이지 관리하기</h1>
            <img src="/about/checklist4.webp" alt="로츠고 휴식 게이지 관리" className="w-full sm:w-1/2 h-auto rounded-xl mt-2 mb-2"/>
            <p>휴식게이지를 관리하기 위해서 해당 캐릭터의 일일콘텐츠 및에 있는 "추가" 버튼을 누르면 휴식 게이지를 관리할 수 있습니다.</p>
            <p>쿠르잔 전선, 가디언 토벌에서 휴식 게이지를 조절하여 휴식 게이지를 수정할 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">콘텐츠 관리하기</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <img src="/about/checklist5.webp" alt="로츠고 주간 콘텐츠 관리" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <img src="/about/checklist6.webp" alt="로츠고 기타 콘텐츠 관리" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            </div>
            <p>주간 콘텐츠를 추가하기 위해 주간 콘텐츠 영역의 하단에 위치한 "추가" 버튼을 통해 창을 여실 수 있습니다.</p>
            <p>하단의 콘텐츠의 종류와 난이도를 선택하신 후 골드 지정을 선택하고 "추가"를 누르시면 해당 콘텐츠가 추가됩니다.</p>
            <p className="mb-3">콘텐츠의 골드지정을 변경하거나 삭제하기 위해서 콘텐츠 추가 영역 위에서 골드지정을 변경하실 수 있으며, 삭제를 할 수 있습니다.</p>
            <p>주간 콘텐츠, 일일 콘텐츠 외에도 본인이 로스트아크에서 별도로 해야할 일이 필요하다면 커스텀 숙제 항목을 추가할 수 있습니다.</p>
            <p>기타 콘텐츠는 일일, 주간 모두 존재하며 탭에서 "기타"로 넘어가시면 커스텀 숙제를 추가하실 수 있습니다.</p>
            <p className="mb-3">주간 콘텐츠와 비슷하게 관리가 가능합니다.</p>
            <p>주간 콘텐츠에서 추가된 주간 숙제에서 "카멘 하드 4관문"처럼 2주마다 1번씩 돌 수 있는 격주의 레이드일 경우 1주차때 체크하셨다면 자동으로 2주차때는 체크가 불가능합니다.</p>
            <p>단, 다시 1주차로 넘어올 경우에는 다시 활성화됩니다. 반대로 2주차때 체크해도 1주차로 돌아올 때는 비활성화되지 않습니다.</p>
            <h1 className="font-bold mt-10 mb-2">버스비 설정</h1>
            <img src="/about/checklist13.webp" alt="로츠고 버스비" className="w-full sm:w-1/2 h-auto rounded-xl mt-2 mb-2"/>
            <p>버스비를 설정하기 위해서 체크박스에 있는 버스 모양 아이콘을 누르면 버스비를 설정할 수 있습니다. 버스비를 입력하면 자동으로 적용됩니다.</p>
            <p>버스비는 해당 콘텐츠의 모든 관문을 완료해야만 적용됩니다. 골드지정 콘텐츠, 골드지정 캐릭터와 상관없이 골드가 적용됩니다.</p>
            <p>버스를 해제하기 위해서 버스비를 0으로 설정하시면 해제됩니다. 적용되면 초록색, 해제되면 회색으로 표시됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">더보기 설정</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <img src="/about/checklist14.webp" alt="로츠고 더보기 전" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <img src="/about/checklist15.webp" alt="로츠고 더보기 이후" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            </div>
            <p>더보기를 체크하기 위해서 캐릭터 하단의 "더보기 관리 모드"를 체크하면 더보기를 체크하실 수 있습니다.</p>
            <p>더보기가 체크된 관문은 관문 밑에 노란색 글씨의 "더보기" 문구가 표시됩니다.</p>
            <p>더보기는 클리어 완료된 관문만 적용이 가능하며 클리어 취소할 경우 더보기도 같이 취소됩니다.</p>
            <p>더보기를 이용하지 않고 "더보기 관리 모드" 스위치가 보이지 않길 원하는 경우, 계정 설정에서 "더보기 관리 모드"를 숨길 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">큐브 관리하기</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <img src="/about/checklist7.webp" alt="로츠고 큐브 추가 및 감소" className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <img src="/about/checklist8.webp" alt="로츠고 큐브 보상 보기" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            </div>
            <p>
                캐릭터 하단의 큐브 영역을 클릭하면 각 캐릭터의 레벨에 따라 큐브들의 목록이 표시됩니다.
                (큐브 항목은 캐릭터 레벨에 따라 표시되므로 실제 레벨과 등록된 캐릭터의 레벨이 다를 경우 상단에 고정된 요소의 "캐릭터 갱신하기" 버튼을 통해 캐릭터 정보를 최신화하세요.)
            </p>
            <p>큐브의 개수는 추가할 항목의 "증가", "감소"로 개수를 조절하실 수 있습니다.</p>
            <p>
                "보상" 탭에서는 가지고 있는 큐브 티켓의 모든 보상을 합친 보석의 결과가 표시됩니다.
                단, 황금방처럼 추가로 얻는 보석은 포함하지 않습니다.
            </p>
            <img src="/about/checklist9.webp" alt="로츠고 큐브 총 개수" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <img src="/about/checklist10.webp" alt="로츠고 큐브 총 보상" className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>큐브 전체 현황은 서버 선택의 우측에 "남은 숙제 현황 보기" 우측의 "큐브 현황 보기"를 누르시면 해당 요소가 표시됩니다.</p>
            <p>"개수" 탭에서는 캐릭터 별로 큐브 개수를 확인할 수 있으며 전체 캐릭터의 큐브 총합도 확인을 하실 수 있습니다.</p>
            <p>"보상" 탭에서는 보석의 티어별로 표시가 되며, 캐릭터 별로 큐브 보상을 확인할 수 있으며 전체 캐릭터의 큐브 총 보상을 확인할 수 있습니다.</p>
        </div>
    )
}