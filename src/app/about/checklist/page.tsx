import Image from "next/image";

export default function Checklist() {
    return (
        <div className="w-full [&_p]:text-lg [&_li]:text-lg [&_h3]:text-xl [&_h1]:text-3xl">
            <h1 className="font-bold mb-2">숙제</h1>
            <p>캐릭터들을 등록하여 일일 콘텐츠, 주간 콘텐츠 등을 기록하고 관리할 수 잇는 기능입니다.</p>
            <Image src="/about/checklist1.webp" alt="로츠고 숙제 페이지" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <h1 className="font-bold mt-10 mb-2">숙제 초기 세팅</h1>
            <p>초기세팅은 회원가입 후 숙제 페이지로 이동하면 별도 설정없이 자동으로 초기세팅이 완료됩니다.</p>
            <p>초기세팅 내용은 회원가입 시 등록했던 원정대에서 레벨이 높은 순서대로 6캐릭이 골드 지정으로 선택된 상태에서 자동으로 등록됩니다.</p>
            <p>추가된 캐릭터는 주요 콘텐츠에서 레벨이 맞는 주간 레이드를 레벨 높은 순서대로 3개의 레이드가 주간 콘텐츠에 추가됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">캐릭터 추가하기</h1>
            <div className="w-full grid sm:grid-cols-[1fr_2fr] gap-4">
                <Image src="/about/checklist2.webp" alt="로츠고 캐릭터 추가" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <ul className="list-decimal pl-4">
                    <li>페이지 상단에 고정된 요소에서 "캐릭터 추가"를 누르면 창이 나오게 됩니다.</li>
                    <li>추가할 캐릭터 명 또는 해당 원정대의 대표 캐릭터 명을 입력하신 후 "조회" 버튼을 통해 데이터를 불러옵니다.</li>
                    <li>해당 캐릭터 명이 있는 원정대 데이터가 불러와지며 추가할 캐릭터들을 체크합니다.</li>
                    <li>골드 지정이 필요한 경우 "골드 지정"을 체크하시면 골드 지정이 된 캐릭터로 추가가 가능합니다.</li>
                    <li>"추가" 버튼을 누르게 되면 체크된 캐릭터들이 추가되며 주간 콘텐츠도 자동으로 3개가 채워집니다.</li>
                </ul>
            </div>
            <h1 className="font-bold mt-10 mb-2">남은 숙제 확인하기</h1>
            <Image src="/about/checklist3.webp" alt="로츠고 남은 숙제 확인" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>서버 선택 우측에 위치한 "남은 숙제 현황 보기"를 누르면 현재 체크하지 않은 주간 콘텐츠를 표시합니다.</p>
            <p>항목의 좌측의 색은 골드 지정된 레이드를 뜻합니다. 노란색은 골드 지정 레이드이며, 회색은 골드 지정이 아닌 레이드를 뜻합니다.</p>
            <p>콘텐츠 선택으로 특정 콘텐츠를 선택하면 해당 레이드의 체크하지 않은 항목만 표시됩니다.</p>
            <h1 className="font-bold mt-10 mb-2">휴식 게이지 관리하기</h1>
            <Image src="/about/checklist4.webp" alt="로츠고 휴식 게이지 관리" width={800} height={0} className="w-full sm:w-1/2 h-auto rounded-xl mt-2 mb-2"/>
            <p>휴식게이지를 관리하기 위해서 해당 캐릭터의 일일콘텐츠 및에 있는 "추가" 버튼을 누르면 휴식 게이지를 관리할 수 있습니다.</p>
            <p>쿠르잔 전선, 가디언 토벌에서 휴식 게이지를 조절하여 휴식 게이지를 수정할 수 있습니다.</p>
            <h1 className="font-bold mt-10 mb-2">콘텐츠 관리하기</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <Image src="/about/checklist5.webp" alt="로츠고 주간 콘텐츠 관리" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <Image src="/about/checklist6.webp" alt="로츠고 기타 콘텐츠 관리" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            </div>
            <p>주간 콘텐츠를 추가하기 위해 주간 콘텐츠 영역의 하단에 위치한 "추가" 버튼을 통해 창을 여실 수 있습니다.</p>
            <p>하단의 콘텐츠의 종류와 난이도를 선택하신 후 골드 지정을 선택하고 "추가"를 누르시면 해당 콘텐츠가 추가됩니다.</p>
            <p className="mb-3">콘텐츠의 골드지정을 변경하거나 삭제하기 위해서 콘텐츠 추가 영역 위에서 골드지정을 변경하실 수 있으며, 삭제를 할 수 있습니다.</p>
            <p>주간 콘텐츠, 일일 콘텐츠 외에도 본인이 로스트아크에서 별도로 해야할 일이 필요하다면 커스텀 숙제 항목을 추가할 수 있습니다.</p>
            <p>기타 콘텐츠는 일일, 주간 모두 존재하며 탭에서 "기타"로 넘어가시면 커스텀 숙제를 추가하실 수 있습니다.</p>
            <p className="mb-3">주간 콘텐츠와 비슷하게 관리가 가능합니다.</p>
            <p>주간 콘텐츠에서 추가된 주간 숙제에서 "카멘 하드 4관문"처럼 2주마다 1번씩 돌 수 있는 격주의 레이드일 경우 1주차때 체크하셨다면 자동으로 2주차때는 체크가 불가능합니다.</p>
            <p>단, 다시 1주차로 넘어올 경우에는 다시 활성화됩니다. 반대로 2주차때 체크해도 1주차로 돌아올 때는 비활성화되지 않습니다.</p>
            <h1 className="font-bold mt-10 mb-2">큐브 관리하기</h1>
            <div className="w-full grid sm:grid-cols-2 gap-2 mb-2">
                <Image src="/about/checklist7.webp" alt="로츠고 큐브 추가 및 감소" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
                <Image src="/about/checklist8.webp" alt="로츠고 큐브 보상 보기" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
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
            <Image src="/about/checklist9.webp" alt="로츠고 큐브 총 개수" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <Image src="/about/checklist10.webp" alt="로츠고 큐브 총 보상" width={800} height={0} className="w-full h-auto rounded-xl mt-2 mb-2"/>
            <p>큐브 전체 현황은 서버 선택의 우측에 "남은 숙제 현황 보기" 우측의 "큐브 현황 보기"를 누르시면 해당 요소가 표시됩니다.</p>
            <p>"개수" 탭에서는 캐릭터 별로 큐브 개수를 확인할 수 있으며 전체 캐릭터의 큐브 총합도 확인을 하실 수 있습니다.</p>
            <p>"보상" 탭에서는 보석의 티어별로 표시가 되며, 캐릭터 별로 큐브 보상을 확인할 수 있으며 전체 캐릭터의 큐브 총 보상을 확인할 수 있습니다.</p>
        </div>
    )
}