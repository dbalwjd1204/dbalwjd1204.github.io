# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Fully static Korean folk painting (민화) artist portfolio site. No build tools, no package manager, no tests — open HTML files directly in a browser. All dependencies load from CDN (Tailwind CSS v3, Google Fonts).

## Architecture

### Data flow
`js/data.js` → `js/nav.js` → each HTML page

`data.js` must be loaded before `nav.js` in every HTML `<head>`, because `nav.js`'s `renderFooter()` reads `SITE.email / .phone / .instagram` from the global `SITE` object.

### Shared globals (exposed by `data.js`)
| Variable | Shape |
|---|---|
| `SITE` | `{ name, subtitle, tagline, email, phone, instagram, stats }` |
| `artworks` | Array of 9 artwork objects `{ id, title, subtitle, category, year, size, material, frame, meaning, description, spaces }` |
| `awards` | Array of objects `{ year, title, prize, org }` |
| `exhibitions` | `{ solo, group, invited, artfair }` — each an array of `{ year, title, venue, period }` |

### Navigation & footer injection (`js/nav.js`)
IIFE. Exposes `window.initNav(pageId)` and `window.renderFooter()`. Both nav links and footer Quick Links are generated from the single `LINKS` array — adding or removing a page requires editing only that array.

Every HTML page calls both in `DOMContentLoaded`:
```js
document.addEventListener('DOMContentLoaded', () => {
    initNav('pageId');   // matches the id field in LINKS
    renderFooter();
});
```

### Dynamic routing
`artwork.html` reads `?id=N` from `location.search`, looks up the artwork in `artworks`, and renders the detail view. If the artwork is not found, it shows an error state. The related-works `<section id="related-section">` is hidden via `getElementById` when there are no related works.

## Adding a new artwork (상세 페이지 추가)

`artwork.html` is a single shared detail page — one entry in `artworks` = one detail page. To add a new work:

**1. Add an object to `artworks` in `js/data.js`:**
```js
{
    id: 10,                          // unique integer, increment from last
    title: '제목',
    subtitle: '부제목',
    category: '전통',                // must match a filter value: '전통' | '창작'
    year: 2025,
    size: '60×90cm',
    material: '한지에 분채',
    frame: true,                     // boolean
    meaning: '한 줄 상징 설명',
    description: '단락1\n\n단락2\n\n단락3',  // \n\n으로 단락 구분
    spaces: ['갤러리', '카페'],      // 추천 공간 태그 배열
}
```

**2. Link to it from `portfolio.html` or anywhere else:**
```html
<a href="artwork.html?id=10">...</a>
```

That's all. `artwork.html` dynamically builds the full detail page from the `artworks` data. The related-works section auto-populates with up to 4 works in the same `category`.

> **새 카테고리를 추가하는 경우** `portfolio.html`의 필터 버튼에도 추가해야 합니다 (line 51–53).

### Styling
- Tailwind CSS v3 via CDN with custom config block in every HTML `<head>`
- CSS custom properties in `:root {}` mirror the Tailwind color tokens (designed for Google Stitch compatibility)
- Color palette is 오방색-inspired: `#8B1A1A` (hw-red), `#F8F4ED` (hw-bg / hanji ivory), `#2C2826` (hw-text)
- Fonts: Nanum Myeongjo (headings, `font-heading`), Nanum Gothic (body, `font-body`) via Google Fonts

## Content editing

All content lives in `js/data.js`. Edit that file only — do not hardcode content in HTML pages (except `about.html` which has hardcoded bio text and career timeline).

The artist name `○○○` is a placeholder throughout the codebase; replace it globally when the real name is known.

## Page–pageId mapping

| File | `initNav` id |
|---|---|
| `index.html` | `home` |
| `about.html` | `about` |
| `portfolio.html` | `portfolio` |
| `artwork.html` | *(none — detail page, not in nav)* |
| `awards.html` | `awards` |
| `exhibitions.html` | `exhibitions` |
| `contact.html` | `contact` |
