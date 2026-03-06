# 🏥 AIchatbot — 요양병원 보호자 상담 챗봇

> 한국의 초고령화 사회 진입에 따른 요양병원 보호자의 불안과 의료진의 반복 업무 부담을 AI 챗봇으로 해소하는 서비스입니다.

---

## 📌 프로젝트 배경 & 문제

한국은 2025년 초고령화 사회(노인 인구 20% 이상)로 진입하면서 요양병원 수요가 급증하고 있습니다.

| 문제 | 설명 |
|------|------|
| 실시간 정보 접근 어려움 | 보호자가 환자의 건강 상태, 복약, 치료 일정을 병원을 통하지 않고는 알 수 없음 |
| 의료진 반복 업무 부담 | 반복적인 보호자 전화 문의로 핵심 업무 집중도 저하 |
| 낮은 병원-보호자 신뢰도 | 소통 단절로 인한 불신 증가 |

---

## 🎯 목표 & 성공 지표

**단기 목표**
- 보호자 상담 챗봇 MVP 개발 및 배포
- 환자 상태 / 복약 / 입원일정 정보 제공 기능 구현
- 보호자 FAQ 자동 응답 기능 탑재

**중장기 목표**
- AI Fine-tuning을 통한 자연어 이해 및 상담 기능 고도화
- 타 병원 및 기관으로 서비스 확장 및 표준화

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React (JSX), React Router |
| Backend | FastAPI (Python) |
| AI / LLM | OpenAI GPT-4o-mini + LangChain |
| 인증 | 카카오 OAuth2 |
| DB | SQLite |
| 기록 파싱 | PDF OCR (간호기록지) |

---

## 📱 화면 구성 (5개 페이지)

### 1. 로그인 화면 `LoginPage`
- 카카오 OAuth2 소셜 로그인
- 이메일 기반 보호자–환자 매핑 확인
- 인증 성공 → 홈 화면 이동 / 실패 → 오류 메시지 표시

### 2. 홈 화면 `HomePage`
- 헤더: 효림요양병원 로고, 카카오 프로필, 로그아웃 / 연결해제 버튼
- 내 환자 정보 카드 (환자명, 관계, 환자번호, 병실, 생년월일)
- 병원 대표번호 `031-919-0041` / 입원상담 `010-4130-0041`
- 외래 진료시간 안내 (평일 08:30~17:30, 토 08:30~13:00)
- 주요 버튼: 💬 챗봇 질문하기 / 🧾 환자 상태 보기 / 📝 고객 평가 남기기
- 푸터: 병원 주소, 공식 홈페이지 링크

### 3. 챗봇 화면 `ChatBotPage`
- GPT-4o-mini + LangChain 기반 감정케어 챗봇
- 보호자 감정 공감 및 위로 / 환자 상태 문의 시 병원 페이지 안내
- 세션별 대화 메모리 유지 + SQLite 로그 저장
- 우측 상단 `?` 버튼 → FAQ 모달 팝업

### 4. 환자 정보 화면 `PatientInfoPage`
- PDF 간호기록지 OCR 파싱 → 날짜별 기록 조회
- 키워드 요약 + 키워드/내용 검색 기능

### 5. 고객평가 화면 `FeedbackPage`
- 별점(1~5점) + 텍스트 의견 입력
- 마우스 호버 시 별 채우기 애니메이션
- 제출 성공/실패 메시지 표시

---

## 📂 프로젝트 구조

```
AIchatbotProject/
├── backend/
│   ├── main.py              # FastAPI 라우터 (chat, feedback, patients 등)
│   ├── chatbot_core.py      # LangChain + GPT-4o-mini 챗봇 로직
│   ├── auth_kakao.py        # 카카오 OAuth 인증
│   ├── database.py          # SQLite DB 매니저
│   ├── ocr_records.py       # PDF OCR 파싱 (간호기록지)
│   └── uploads/             # 환자 PDF 파일
└── frontend/
    └── src/
        ├── pages/           # LoginPage, HomePage, ChatBotPage, PatientInfoPage, FeedbackPage
        ├── components/      # Header, FAQModal, PatientHistoryCard 등
        └── context/         # 전역 상태 관리
```

---

## 참고문헌

- Lancet Regional Health – *South Korea's population shift: challenges and opportunities* [NIH 원문 보기](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10447181/)
