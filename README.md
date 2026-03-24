![top](https://github.com/user-attachments/assets/07c3a15c-031a-4df7-be6f-a0772ff9f53d)
# 로츠고(Lot's Go) - 로스트아크 숙제, 정보 및 일정 관리
로스트아크 플레이에 도움이 되는 숙제 체크, 일정 관리, 게임 내 콘텐츠 일정과 이벤트, 공지 확인, 레이드 파티 시스템을 구현한 웹 서비스

## 📑 프로젝트 소개

로츠고(Lot's Go)는 로스트아크 유저의 숙제와 일정, 레이드 관리를 지원하는 웹 서비스입니다.  
여러 캐릭터를 동시에 육성하면서 발생하는 숙제 관리의 불편함을 해결하기 위해 개발되었으며, 게임 외부에서도 진행 상태를 확인하고 관리할 수 있도록 설계되었습니다.  
일일/주간 숙제 추적, 일정 관리, 레이드 파티 기능을 통해 플레이 흐름을 보다 효율적으로 정리할 수 있습니다.

## 🔥 주요 기능
<details>
  <summary><b>📝 숙제 관리</b></summary>
  <ul>
    <li>일일 / 주간 콘텐츠 숙제 체크</li>
    <li>06시 기준 자동 초기화 (일일 / 매주 수요일)</li>
    <li>콘텐츠 외 기타 숙제 커스텀 관리</li>
    <li>주간 총 재화 획득량 집계</li>
  </ul>
</details>

<details>
  <summary><b>📆 일정 관리</b></summary>
  <ul>
    <li>레이드, 숙제, 개인 일정 등록 및 관리</li>
    <li>파티에 등록된 레이드 일정 관리</li>
    <li>특정 날짜에 해야 할 콘텐츠 및 숙제 통합 확인</li>
  </ul>
</details>

<details>
  <summary><b>🧔🏻 전투정보실 (캐릭터 조회)</b></summary>
  <ul>
    <li>캐릭터 전투 정보 조회 (캐릭터 스펙, 특성 등)</li>
    <li>주요 정보를 한눈에 확인할 수 있는 시각화 UI 제공</li>
    <li>원정대 내 캐릭터 정보 통합 확인</li>
    <li>원정대 내 캐릭터 스펙 집계</li>
    <li>캐릭터 세팅 및 성장 상태를 빠르게 파악</li>
    <li>최신 정보 반영을 위한 데이터 동기화</li>
  </ul>
</details>

<details>
  <summary><b>👥 파티 모집</b></summary>
  <ul>
    <li>고정 파티 일정 및 숙제 공유</li>
    <li>레이드 파티 생성 및 참여</li>
    <li>파티 일정 관리</li>
  </ul>
</details>

<details>
  <summary><b>🔧 도구</b></summary>
  <ul>
    <li>경매 최적가 계산</li>
    <li>아이템 시세 조회</li>
    <li>시세 변동 분석</li>
    <li>레이드 참여 비용 계산</li>
  </ul>
</details>

<details>
  <summary><b>🫆 회원 데이터</b></summary>
  <ul>
    <li>회원 가입 및 로그인 기능</li>
    <li>JWT 기반 인증 및 세션 관리 (refresh token)</li>
    <li>사용자 권한 및 접근 제어</li>
  </ul>
</details>

## 🎬 기능 미리보기
<table>
  <tr>
    <td align="center" width="25%"><img src="./assets/readme/home.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/homework.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/add homework.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/calendar.gif" width="160"/></td>
  </tr>
  <tr>
    <td align="center" width="25%"><b>로스트아크 정보</b></td>
    <td align="center" width="25%"><b>숙제 체크</b></td>
    <td align="center" width="25%"><b>숙제 추가</b></td>
    <td align="center" width="25%"><b>일정 관리</b></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="./assets/readme/character.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/party raid add.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/party manage.gif" width="160"/></td>
    <td align="center" width="25%"><img src="./assets/readme/tool.gif" width="160"/></td>
  </tr>
  <tr>
    <td align="center" width="25%"><b>전투정보실</b></td>
    <td align="center" width="25%"><b>파티 레이드 추가</b></td>
    <td align="center" width="25%"><b>파티 레이드 참여 및 관리</b></td>
    <td align="center" width="25%"><b>편의성 도구</b></td>
  </tr>
</table>

## 🧱 기술 스택
### 📌 프레임워크 & 언어
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### 🎨 UI & 스타일링
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![HeroUI](https://img.shields.io/badge/HeroUI-111111?style=for-the-badge&logo=heroui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### 📊 상태 & 데이터 관리
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![React Redux](https://img.shields.io/badge/React_Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### 🗄️ 백엔드 / 인프라
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firebase Admin](https://img.shields.io/badge/Firebase_Admin-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-2E7D32?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### ⚙️ 유틸리티
![Codex](https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=openai&logoColor=white)
![Day.js](https://img.shields.io/badge/Day.js-FF5F5F?style=for-the-badge&logo=javascript&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-8884D8?style=for-the-badge)
![dnd-kit](https://img.shields.io/badge/dnd--kit-3B82F6?style=for-the-badge)
![hello-pangea-dnd](https://img.shields.io/badge/hello--pangea--dnd-3B82F6?style=for-the-badge)
![clsx](https://img.shields.io/badge/clsx-D92C20?style=for-the-badge)

### 🚀 배포 & 운영
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Analytics](https://img.shields.io/badge/Vercel_Analytics-000000?style=for-the-badge&logo=vercel&logoColor=white)
![next-sitemap](https://img.shields.io/badge/next--sitemap-2E7D32?style=for-the-badge&logo=googlechrome&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## 🧠 아키텍처 설계
```mermaid
flowchart TD

User["👤 이용자"]

subgraph FE["프론트엔드 레이어"]
  Frontend["🌐 프론트엔드<br/>Next.js + React<br/>Tailwind + HeroUI"]
end

subgraph BE["서버 레이어"]
  API["⚙️ 서버 / API 로직<br/>Next.js API Routes<br/>JWT 인증 처리"]
end

subgraph DATA["데이터베이스 & 외부 서비스"]
  Firebase["🔥 Firebase<br/>Firestore + 인증"]
  Redis["⚡ Redis"]
  LostArk["🎮 로스트아크 API"]
end

subgraph AUTO["자동화"]
  Scheduler["⏱ Cloud Scheduler<br/>스케줄 실행"]
  Functions["🛠 Cloud Functions<br/>데이터 처리"]
end

subgraph DEPLOY["배포"]
  Dev["💻 개발 환경"]
  GitHub["🐙 GitHub"]
  Vercel["🚀 Vercel 배포"]
end

User --> Frontend
Frontend -->|API 요청| API
API -->|데이터 조회| Firebase
API -->|캐시 조회| Redis
API -->|외부 API 호출| LostArk
Scheduler --> Functions
Functions --> Firebase
Dev --> GitHub
GitHub --> Vercel
Vercel --> Frontend

classDef fe fill:#EAFBF3,stroke:#22C55E,stroke-width:2px,color:#111;
classDef be fill:#FFF4E5,stroke:#F59E0B,stroke-width:2px,color:#111;
classDef data fill:#FCE7F3,stroke:#EC4899,stroke-width:2px,color:#111;
classDef auto fill:#F3F4F6,stroke:#6B7280,stroke-width:2px,color:#111;
classDef deploy fill:#EDE9FE,stroke:#8B5CF6,stroke-width:2px,color:#111;
classDef user fill:#E8F0FE,stroke:#4A90E2,stroke-width:2px,color:#111;

class User user;
class Frontend fe;
class API be;
class Firebase,Redis,LostArk data;
class Scheduler,Functions auto;
class Dev,GitHub,Vercel deploy;
```

## ⚡ 성능 최적화

## 🧪 문제 해결 경험

## 💡 개발하면서 느낀 점

## 🔮 향후 개선 계획
