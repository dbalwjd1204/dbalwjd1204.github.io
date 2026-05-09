# 민화 작가 포트폴리오 웹사이트 설계 문서

> 작성일: 2026-05-08  
> 최종 수정: 2026-05-09  
> 버전: 1.1.0

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [파일 구조](#3-파일-구조)
4. [공통 모듈 설계](#4-공통-모듈-설계)
5. [데이터 모델](#5-데이터-모델)
6. [페이지별 설계](#6-페이지별-설계)
7. [디자인 시스템](#7-디자인-시스템)
8. [Google Stitch 연동](#8-google-stitch-연동)
9. [확장 가이드](#9-확장-가이드)
10. [변경 이력](#10-변경-이력)

---

## 1. 프로젝트 개요

### 1.1 목적

민화 작가의 작품 세계, 수상 경력, 전시 이력을 체계적으로 소개하여 작가의 전문성과 신뢰도를 강화하는 포트폴리오 웹사이트입니다. Google Stitch로 디자인한 UI를 바탕으로 마크다운 기반의 콘텐츠 관리가 가능한 구조로 개발합니다.

### 1.2 핵심 요구사항

| 구분 | 내용 |
|---|---|
| 콘셉트 | "전통의 아름다움을 현대 공간에 담다" |
| 타깃 | 갤러리/전시 기획자, 작품 구매 고객, 예술 교육 관계자 |
| 구축 방식 | 순수 HTML/CSS/JS (서버 없이 동작, 정적 파일) |
| 반응형 | 모바일 우선 반응형 레이아웃 |

### 1.3 사이트 맵

```
index.html          Home
├── about.html      작가 소개
├── portfolio.html  Portfolio (갤러리)
│   └── artwork.html?id={n}  작품 상세
├── awards.html     수상 경력
├── exhibitions.html 전시 이력
└── contact.html    Contact
```

---

## 2. 기술 스택

| 구성 요소 | 기술 | 버전 / 출처 |
|---|---|---|
| UI 프레임워크 | Tailwind CSS | CDN (v3) |
| 폰트 | Nanum Myeongjo, Nanum Gothic | Google Fonts |
| JavaScript | Vanilla ES6+ | 빌드 도구 없음 |
| 디자인 툴 | Google Stitch | stitch.withgoogle.com |
| 로컬 서버 | python -m http.server 또는 npx serve | — |

### 빌드 없는 정적 구조의 장점

- 별도 Node.js / 빌드 파이프라인 불필요
- 파일 수정 즉시 브라우저에서 확인
- GitHub Pages, Netlify, Vercel 등 어디서든 무료 배포 가능
- Google Stitch HTML export를 그대로 붙여넣기 가능

---

## 3. 파일 구조

```
C:\HD\
│
├── index.html              # Home 페이지
├── about.html              # 작가 소개 페이지
├── portfolio.html          # Portfolio 갤러리
├── artwork.html            # 작품 상세 (동적, ?id=N)
├── awards.html             # 수상 경력
├── exhibitions.html        # 전시 이력
├── contact.html            # Contact
│
├── js/
│   ├── data.js             # 공유 데이터 (작품, 수상, 전시)
│   └── nav.js              # 공유 네비게이션 & 푸터 렌더러
│
├── artworks/               # 작품 이미지 파일 (총 10개)
│   ├── 유미정_맹호도.jpg
│   ├── 유미정 130x75cm -3119-보자기-정담.jpg
│   ├── 유미정_감로도(37cmX27cm).jpg
│   ├── 유미정_선물.jpg
│   ├── 유미정_운수좋은날.jpg
│   ├── 유미정_제국의왈츠.jpg
│   ├── 유미정-문자도-37cmX48cm_1.jpg
│   ├── 유미정-문자도-37cmX48cm_2.jpg
│   ├── 유미정-연화도_142cmX53cm.jpg
│   ├── 유미정-일월오봉도_74cmX119cm.jpg
│   └── 유미정_여왕의꽃.jpg
│
├── author.jpg              # 작가 프로필 사진 (about.html, index.html About 섹션)
├── design_document.md      # 본 설계 문서
└── minhwa_artist_portfolio_homepage_plan.md  # 원본 기획안
```

### 의존 관계

```
각 HTML 페이지
    └── js/data.js    (SITE, artworks, awards, exhibitions 변수 노출)
    └── js/nav.js     (data.js 이후 로드, SITE 변수 사용)
         ├── initNav(pageId)    → #nav-container 에 네비게이션 주입
         └── renderFooter()    → #footer-container 에 푸터 주입
```

> **로드 순서**: `data.js` → `nav.js` → 페이지 인라인 스크립트  
> `<script src="js/data.js">` 가 `nav.js` 보다 먼저 선언되어야 합니다.

---

## 4. 공통 모듈 설계

### 4.1 `js/data.js`

전체 사이트의 콘텐츠 데이터를 관리하는 단일 파일입니다.  
**콘텐츠 수정은 이 파일만 편집하면 전체 사이트에 반영됩니다.**

#### 노출 전역 변수

| 변수명 | 타입 | 설명 |
|---|---|---|
| `SITE` | Object | 작가명, 이메일, 전화번호 등 기본 정보 |
| `artworks` | Array\<Artwork\> | 전체 작품 목록 |
| `awards` | Array\<Award\> | 수상 경력 목록 |
| `exhibitions` | Object | 전시 이력 (solo/group/invited/artfair) |

---

### 4.2 `js/nav.js`

네비게이션과 푸터를 모든 페이지에 동일하게 주입하는 모듈입니다.  
내부 IIFE(즉시 실행 함수)로 감싸져 전역 오염을 최소화합니다.

#### 노출 전역 함수

| 함수 | 인수 | 설명 |
|---|---|---|
| `initNav(pageId)` | `string` | 지정한 pageId의 링크를 활성 표시하며 네비게이션을 `#nav-container`에 주입 |
| `renderFooter()` | — | 푸터를 `#footer-container`에 주입 |
| `toggleMenu()` | — | 모바일 햄버거 메뉴 토글 |
| `closeMenu()` | — | 모바일 메뉴 닫기 |

#### pageId 목록

| pageId | 해당 페이지 |
|---|---|
| `home` | index.html |
| `about` | about.html |
| `portfolio` | portfolio.html, artwork.html |
| `awards` | awards.html |
| `exhibitions` | exhibitions.html |
| `contact` | contact.html |

#### 각 HTML 페이지 필수 구조

```html
<body>
  <div id="nav-container"></div>   <!-- 네비게이션 주입 대상 -->

  <main>
    <!-- 페이지별 콘텐츠 -->
  </main>

  <div id="footer-container"></div> <!-- 푸터 주입 대상 -->

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      initNav('pageId');   // 필수
      renderFooter();      // 필수
      // 페이지별 초기화 코드
    });
  </script>
</body>
```

---

## 5. 데이터 모델

### 5.1 SITE

```js
{
  name:       string,  // 작가명
  subtitle:   string,  // 영문 직함
  tagline:    string,  // 슬로건
  email:      string,
  phone:      string,
  instagram:  string,
  stats: {
    awards:      string,  // "20+"
    exhibitions: string,  // "50+"
    works:       string,  // "100+"
  }
}
```

---

### 5.2 Artwork

```js
{
  id:          number,   // 고유 ID (artwork.html?id=N 에 사용)
  title:       string,   // 작품명
  subtitle:    string,   // 부제목
  category:    string,   // "전통" | "창작"
  year:        number,   // 제작연도
  size:        string,   // "60×90cm" (미정인 경우 빈 문자열 '')
  material:    string,   // "한지에 분채, 봉채"
  frame:       boolean,  // 액자 유무
  meaning:     string,   // 짧은 작품 의미 (1~2줄)
  description: string,   // 상세 설명 (단락 구분: \n\n)
  spaces:      string[], // 추천 공간 목록
  image:       string,   // 이미지 경로 (예: 'artworks/파일명.jpg'), 없으면 SVG 플레이스홀더 표시
}
```

#### 현재 등록 작품 목록 (총 10점)

| id | 제목 | 카테고리 | 크기 | 이미지 파일 |
|---|---|---|---|---|
| 1 | 맹호도 | 전통 | — | 유미정_맹호도.jpg |
| 2 | 정담 | 현대 | 130×75cm | 유미정 130x75cm -3119-보자기-정담.jpg |
| 3 | 감로도 | 전통 | 37×27cm | 유미정_감로도(37cmX27cm).jpg |
| 4 | 선물 | 현대 | — | 유미정_선물.jpg |
| 5 | 운수좋은날 | 현대 | — | 유미정_운수좋은날.jpg |
| 6 | 제국의왈츠 | 현대 | — | 유미정_제국의왈츠.jpg |
| 7 | 문자도 I | 전통 | 37×48cm | 유미정-문자도-37cmX48cm_1.jpg |
| 8 | 문자도 II | 전통 | 37×48cm | 유미정-문자도-37cmX48cm_2.jpg |
| 9 | 연화도 | 전통 | 142×53cm | 유미정-연화도_142cmX53cm.jpg |
| 10 | 일월오봉도 | 전통 | 74×119cm | 유미정-일월오봉도_74cmX119cm.jpg |
| 11 | 여왕의 꽃 | 전통 | — | 유미정_여왕의꽃.jpg |

---

### 5.3 Award

```js
{
  year:  number,  // 수상 연도
  title: string,  // 공모전/대전명
  prize: string,  // "대상" | "우수상" | "장려상" | "특선" | "입선"
  org:   string,  // 주관 기관
  work:  string,  // 출품 작품명 (선택, 있으면 카드에 표시)
}
```

---

### 5.4 Exhibitions

```js
{
  solo:    ExhibitionItem[],   // 개인전
  group:   ExhibitionItem[],   // 단체전
  invited: ExhibitionItem[],   // 초대전
  artfair: ExhibitionItem[],   // 아트페어
}

// ExhibitionItem
{
  year:   number,
  title:  string,
  venue:  string,   // "○○갤러리, 서울"
  period: string,   // "2024.03.15 – 03.25"
}
```

---

## 6. 페이지별 설계

### 6.1 `index.html` — Home

| 섹션 | 구성 요소 | 데이터 소스 |
|---|---|---|
| Hero | 슬로건, CTA 버튼 3개, 통계 수치 | `SITE.stats` |
| Featured Works | 대표 작품 카드 3개 (최신순) | `[...artworks].sort((a,b)=>b.year-a.year).slice(0,3)` |
| About Summary | 작가 소개 요약 + 사진 플레이스홀더 | 하드코딩 |
| Awards Highlight | 수상 카드 3개 | `awards.slice(0, 3)` |
| Exhibitions Highlight | 최근 전시 4개 | `solo + group` 합산 앞 4개 |
| Contact CTA | 어두운 배경 배너 + 문의 버튼 | — |

**카드 클릭 이동**: `artwork.html?id={w.id}`

---

### 6.2 `about.html` — 작가 소개

| 섹션 | 구성 요소 |
|---|---|
| 프로필 | 사진(좌) + 바이오 텍스트(우), 정보 그리드 6칸 |
| 작가 노트 | 흰색 박스 내 3단락 텍스트 |
| 주요 이력 | 타임라인 (왼쪽 세로선 + 연도 + 내용) |
| 철학 배너 | 어두운 배경 인용문 + Portfolio 링크 |

---

### 6.3 `portfolio.html` — Portfolio 갤러리

| 요소 | 설명 |
|---|---|
| 카테고리 필터 | 전체 / 전통민화 / 창작민화 |
| 작품 수 표시 | 필터 적용 후 `총 N점` 텍스트 업데이트 |
| 그리드 | 3열 (lg) / 2열 (sm) / 1열 (기본) |
| 카드 클릭 | `artwork.html?id={id}` 이동 |

#### 필터 로직

```js
const filtered = currentFilter === 'all'
  ? artworks
  : artworks.filter(w => w.category === currentFilter);
```

---

### 6.4 `artwork.html` — 작품 상세

동적 라우팅 페이지입니다. URL 파라미터 `?id=N` 으로 작품을 특정합니다.  
`artwork.html`은 단일 공유 페이지이며, `data.js`의 `artworks` 항목 수만큼 상세 페이지가 생성됩니다.

#### 렌더링 흐름

```
DOMContentLoaded
  └── URLSearchParams('id') 파싱
       ├── artworks.find(a => a.id === id)
       │    ├── 찾음 → 상세 레이아웃 렌더링
       │    └── 없음 → "작품을 찾을 수 없습니다" 오류 메시지 + Portfolio 링크
       └── 같은 category 작품 필터링 → 관련 작품 그리드 (0개이면 섹션 숨김)
```

| 구성 요소 | 내용 |
|---|---|
| 브레드크럼 | Home > Portfolio > {작품명} |
| 이미지 영역 | 좌측 sticky, 3:4 비율 (`image` 필드 있으면 실제 이미지, 없으면 SVG 플레이스홀더) |
| 스펙 테이블 | 제작연도 / 크기 / 재료 / 액자 |
| 작품 의미 | 짧은 인용 (`meaning`) + 상세 설명 단락 (`description`, `\n\n` 구분) |
| 액션 버튼 | 작품 문의하기 (contact.html) / Portfolio로 돌아가기 |
| 관련 작품 | 동일 `category` 최대 4개 (현재 작품 제외), `id="related-section"` |

#### 상세 페이지 추가 방법

새 작품의 상세 페이지를 추가하려면 `js/data.js`의 `artworks` 배열에 항목을 추가하는 것만으로 충분합니다.  
별도 HTML 파일 생성 없이 `artwork.html?id=N` URL로 자동 접근됩니다.  
→ 상세 절차는 [9.1 작품 추가](#91-작품-추가) 참조

---

### 6.5 `awards.html` — 수상 경력

| 요소 | 설명 |
|---|---|
| 요약 통계 | 총 수상 / 대상 / 우수상 / 장려상+특선 카드 4개 |
| 연도별 그룹 | `year` 기준 내림차순 정렬 후 섹션 분리 |
| 상장 뱃지 색상 | 대상=황색, 우수상=보라, 장려상=녹색, 특선=파랑, 입선=회색 |

#### 연도별 그룹화 로직

```js
const byYear = {};
awards.forEach(a => {
  if (!byYear[a.year]) byYear[a.year] = [];
  byYear[a.year].push(a);
});
Object.keys(byYear).sort((a, b) => b - a); // 최신 연도 우선
```

---

### 6.6 `exhibitions.html` — 전시 이력

| 요소 | 설명 |
|---|---|
| 요약 통계 | 개인전 / 단체전 / 초대전 / 아트페어 횟수 |
| 탭 메뉴 | solo / group / invited / artfair 전환 |
| 탭 전환 | `showTab(tab, btn)` — 탭 스타일 업데이트 + 목록 재렌더링 |
| 기본 탭 | 개인전 (solo) |

---

### 6.7 `contact.html` — Contact

| 요소 | 설명 |
|---|---|
| 연락처 정보 | 이메일(`mailto:`링크) / 전화(`tel:`링크) / 인스타그램(새 탭 링크) |
| 문의 유형 안내 | 작품 구매 / 전시 제안 / 강의 / 기타 협업 설명 카드 |
| 폼 필드 | 이름* / 연락처* / 이메일 / 소속 / 문의유형* / 내용* / 개인정보 동의* |
| 제출 처리 | 폼 숨김 + 완료 메시지 표시 (현재 프론트엔드 전용) |

#### 연락처 렌더링 방식

연락처 값은 `SITE` 객체에서 동적으로 읽어오며, `DOMContentLoaded`에서 아래와 같이 링크를 구성합니다.

```js
// 이메일 — mailto:
emailEl.textContent = SITE.email;
emailEl.href = 'mailto:' + SITE.email;

// 전화 — tel:
phoneEl.textContent = SITE.phone;
phoneEl.href = 'tel:' + SITE.phone;

// 인스타그램 — 새 탭
igEl.textContent = SITE.instagram;
igEl.href = 'https://instagram.com/' + SITE.instagram.replace('@', '');
```

footer(`nav.js`)의 연락처 항목도 동일한 방식으로 링크 처리됩니다.

> **백엔드 연동 시**: `submitForm()` 내부에서 `fetch('/api/contact', {...})` 호출로 교체

---

## 7. 디자인 시스템

### 7.1 색상 팔레트 — 오방색(五方色) 기반

| 변수명 | 헥스 코드 | 의미 / 용도 |
|---|---|---|
| `--p` / `hw-red` | `#8B1A1A` | Primary — 적(赤), 강조·CTA·포인트 |
| `hw-blue` | `#1A4A6B` | Secondary — 청(靑), 미사용 (확장용) |
| `hw-yellow` | `#C9960A` | Accent — 황(黃), 미사용 (확장용) |
| `hw-bg` | `#F8F4ED` | 배경 — 백(白) 한지색 |
| `hw-bg2` | `#EFE9DB` | 보조 배경 — 약간 어두운 한지색 |
| `hw-text` | `#2C2826` | 본문 텍스트 — 흑(黑) |
| `hw-muted` | `#7A6B5A` | 보조 텍스트 |
| `hw-border` | `#D4C9B5` | 테두리 |
| `hw-black` | `#1A1714` | 다크 섹션 배경 |

### 7.2 타이포그래피

| 구분 | 폰트 | 클래스 | 용도 |
|---|---|---|---|
| Heading | Nanum Myeongjo | `font-heading` | h1~h4, 작품명, 섹션 제목 |
| Body | Nanum Gothic | `font-body` | 본문, 레이블, 버튼 텍스트 |

### 7.3 공통 CSS 클래스

| 클래스 | 스타일 | 용도 |
|---|---|---|
| `.nav-link` | 호버 시 하단 줄 애니메이션 | 네비게이션 링크 |
| `.card` | 드롭 섀도 + hover 위로 이동 | 작품 카드 |
| `.sec-title::after` | 하단 44px 적색 바 | 섹션 제목 장식 |
| `.fa` | bg=primary, color=white | 활성 필터 버튼 |
| `.tab-active` | color/border=primary | 활성 탭 |

### 7.4 Google Stitch Design Token 연동 포인트

Stitch에서 export한 색상값을 아래 두 곳에 붙여넣으면 전체 사이트에 적용됩니다.

```html
<!-- ① CSS 변수 (각 HTML <style> 블록) -->
<style>
:root {
  --p:   #8B1A1A;  /* ← Stitch Primary Color */
  --bg:  #F8F4ED;  /* ← Stitch Background */
  ...
}
</style>

<!-- ② Tailwind 커스텀 색상 (각 HTML <script> 블록) -->
<script>
tailwind.config = {
  theme: { extend: { colors: {
    'hw-red': '#8B1A1A',  /* ← Stitch Primary Color */
    'hw-bg':  '#F8F4ED',  /* ← Stitch Background */
    ...
  }}}
}
</script>
```

---

## 8. Google Stitch 연동

### 8.1 연동 워크플로

```
[Google Stitch]
    1. 프롬프트로 UI 생성
    2. 화면 구성 및 색상/폰트 조정
    3. "Export → Tailwind HTML" 클릭
         │
         ▼
[내보낸 코드 적용]
    4. 색상값 → 각 HTML 파일 :root 변수 교체
    5. 새 섹션 HTML → 해당 페이지 <main> 내 붙여넣기
    6. Tailwind 클래스명은 그대로 사용 가능
```

### 8.2 섹션별 Stitch 활용 권장 영역

| 페이지 | 재디자인 권장 섹션 |
|---|---|
| index.html | Hero 비주얼 영역, Contact CTA 배너 |
| about.html | 프로필 레이아웃, Artist Philosophy 섹션 |
| portfolio.html | 작품 카드 스타일 |
| artwork.html | 작품 상세 스펙 테이블 |
| contact.html | 폼 레이아웃 및 버튼 스타일 |

### 8.3 주의사항

- Stitch export HTML에는 `<script>` 인라인 로직이 없으므로, 기존 JS 로직(`renderGrid()`, `initNav()` 등)은 유지해야 합니다.
- Stitch export 시 Tailwind CDN 방식을 선택하면 별도 설정 없이 호환됩니다.
- Google Fonts는 Stitch 내에서 Nanum Myeongjo / Nanum Gothic을 직접 지정할 수 없는 경우, export 후 `<link>` 태그를 수동으로 추가합니다.

---

## 9. 확장 가이드

### 9.1 작품 추가 (상세 페이지 추가)

`artwork.html`은 단일 공유 페이지입니다. `js/data.js`의 `artworks` 배열에 항목을 추가하면 자동으로 `artwork.html?id=N` 상세 페이지가 생성됩니다.

**Step 1.** `js/data.js`의 `artworks` 배열에 항목 추가:

```js
{
  id: 11,                          // 기존 최대 id + 1 (현재 최대값 10, 중복 불가)
  title: '새 작품명',
  subtitle: '부제목',
  category: '전통',                 // 반드시 기존 카테고리 중 하나: '전통' | '창작'
  year: 2026,
  size: '60×90cm',                 // 미정이면 빈 문자열 ''
  material: '한지에 분채',
  frame: true,                     // true | false
  meaning: '짧은 의미 설명 (1~2줄)',
  description: '단락1\n\n단락2\n\n단락3',  // \n\n으로 단락 구분
  spaces: ['갤러리', '로비'],       // 추천 공간 태그 (배열)
  image: 'artworks/파일명.jpg',    // artworks/ 폴더 기준 경로, 없으면 필드 생략
}
```

**Step 2.** 원하는 곳에서 링크 연결:

```html
<a href="artwork.html?id=11">작품 보기</a>
```

`portfolio.html`의 그리드 카드는 `artworks` 배열 전체를 자동 렌더링하므로 별도 수정이 필요 없습니다.  
`index.html`의 Featured Works는 연도 내림차순으로 정렬한 최신 3점을 표시합니다.

> **관련 작품 자동 구성**: 상세 페이지 하단의 "다른 작품 보기"는 동일 `category` 내 다른 작품 최대 4개를 자동 표시합니다. 같은 카테고리 작품이 없으면 해당 섹션은 자동으로 숨겨집니다.

> **새 카테고리를 추가하는 경우**: `portfolio.html`의 필터 버튼도 함께 추가해야 합니다 (→ [9.2 새 카테고리 추가](#92-새-카테고리-추가)).

### 9.2 새 카테고리 추가

현재 카테고리는 `'전통'`과 `'창작'` 두 가지입니다.

1. `data.js` — 해당 작품의 `category` 필드에 새 카테고리명 입력
2. `portfolio.html` — 필터 버튼 추가 (line 51–53 부근):
   ```html
   <button onclick="filter('새카테고리', this)" class="px-5 py-2 text-sm font-body border border-hw-border rounded-sm hover:bg-hw-red hover:text-white hover:border-hw-red transition-colors text-hw-text">새카테고리</button>
   ```

### 9.3 새 페이지 추가

1. 기존 페이지를 복사 후 콘텐츠 교체
2. `js/nav.js`의 `LINKS` 배열에 항목 추가:
   ```js
   { href: 'newpage.html', id: 'newpage', label: '새 메뉴' }
   ```
3. 새 페이지에서 `initNav('newpage')` 호출

### 9.4 이미지 파일 추가

이미지는 `artworks/` 폴더에 넣고 `data.js`의 해당 작품 객체에 `image` 필드를 지정합니다.  
`image` 필드가 있으면 실제 이미지를, 없으면 SVG 플레이스홀더를 자동으로 표시합니다.

```js
// data.js Artwork 객체
image: 'artworks/파일명.jpg',  // artworks 폴더 기준 상대 경로
```

이미지를 추가하면 `portfolio.html` 그리드, `index.html` Featured Works, `artwork.html` 상세 페이지 모두에 자동 반영됩니다.

### 9.5 Contact 폼 백엔드 연결

`contact.html`의 `submitForm()` 함수를 교체합니다:

```js
async function submitForm(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        document.getElementById('contact-form').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
    }
}
```

### 9.6 로컬 실행 및 배포

```bash
# 로컬 서버 실행 (마크다운 파일 fetch 포함)
python -m http.server 8000
# 또는
npx serve .

# GitHub Pages 배포
git init && git add . && git commit -m "init"
git remote add origin https://github.com/{user}/{repo}.git
git push -u origin main
# → Settings > Pages > Branch: main / root 선택
```

---

## 10. 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| 1.0.0 | 2026-05-08 | 최초 작성 |
| 1.1.0 | 2026-05-09 | 작품 5점 추가 (문자도 I·II, 연화도, 일월오봉도, 여왕의 꽃) · Artwork 모델 `image` 필드 추가 · 카테고리 값 `'전통'\|'창작'`으로 확정 · Featured Works 최신순 정렬 적용 · 연락처 실제 정보 반영 (이메일·전화·인스타그램) · 연락처 링크(`mailto:` / `tel:` / Instagram) 적용 · 히어로 이미지 일월오봉도 적용 · 프로필 사진 author.jpg 적용 · 맹호도 이미지 파일명 오타 수정 · 학력 정보 반영 (수원대학교 동양학과·교육대학원 졸업) · 수상 내역 실제 정보 반영 (제14~17회 대한민국민화 공모대전 특선) · Award 모델 `work` 필드 추가 · `SITE.stats.awards` 10+로 수정 · about.html 주요 이력 실제 수상 내역과 동기화 · 작품 상세 추천 공간 섹션 제거 · 가로 작품 자동 4:3 비율 적용 · contact.html Formspree 연동 (실메일 수신) · 기술 스택에서 미사용 marked.js 제거 |

---

*본 문서는 `minhwa_artist_portfolio_homepage_plan.md` 기획안을 바탕으로 실제 구현된 코드 구조를 기술합니다.*
