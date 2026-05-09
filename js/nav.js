'use strict';
(function () {
    const LINKS = [
        { href: 'index.html',       id: 'home',        label: 'Home' },
        { href: 'about.html',       id: 'about',       label: '작가 소개' },
        { href: 'portfolio.html',   id: 'portfolio',   label: 'Portfolio' },
        { href: 'awards.html',      id: 'awards',      label: '수상 경력' },
        { href: 'exhibitions.html', id: 'exhibitions', label: '전시 이력' },
        { href: 'contact.html',     id: 'contact',     label: 'Contact' },
    ];

    window.initNav = function (active) {
        const desktop = LINKS.map(l =>
            `<a href="${l.href}" class="nav-link text-sm font-body ${active === l.id ? 'text-hw-red' : 'text-hw-text'}">${l.label}</a>`
        ).join('');
        const mobile = LINKS.map(l =>
            `<a href="${l.href}" onclick="closeMenu()" class="py-1 text-sm font-body ${active === l.id ? 'text-hw-red font-bold' : 'text-hw-text'}">${l.label}</a>`
        ).join('');

        document.getElementById('nav-container').innerHTML = `
<nav class="fixed top-0 inset-x-0 z-50 bg-hw-bg/95 backdrop-blur-sm border-b border-hw-border">
  <div class="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
    <a href="index.html" class="font-heading text-xl font-bold text-hw-text">
      민화 작가 <span class="text-hw-red">유미정</span>
    </a>
    <div class="hidden md:flex items-center gap-7">${desktop}</div>
    <button onclick="toggleMenu()" class="md:hidden p-2" aria-label="메뉴">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>
  <div id="mobile-menu" class="hidden md:hidden border-t border-hw-border bg-hw-bg px-5 py-4 flex flex-col gap-3">
    ${mobile}
  </div>
</nav>`;
    };

    window.renderFooter = function () {
        const el = document.getElementById('footer-container');
        if (!el) return;
        el.innerHTML = `
<footer class="bg-hw-bg2 border-t border-hw-border py-12">
  <div class="max-w-7xl mx-auto px-5">
    <div class="grid lg:grid-cols-3 gap-8 mb-8">
      <div>
        <div class="font-heading text-xl font-bold text-hw-text mb-3">민화 작가 유미정</div>
        <p class="font-body text-xs text-hw-muted leading-relaxed">한국 전통 민화의 색채와 상징을 현대 공간에 담아내는 민화 작가입니다.</p>
      </div>
      <div>
        <div class="font-body text-xs font-bold text-hw-muted mb-3 tracking-widest uppercase">Quick Links</div>
        <div class="grid grid-cols-2 gap-y-2 gap-x-4">
          ${LINKS.map(l => `<a href="${l.href}" class="font-body text-xs text-hw-muted hover:text-hw-red transition-colors">${l.label}</a>`).join('')}
        </div>
      </div>
      <div>
        <div class="font-body text-xs font-bold text-hw-muted mb-3 tracking-widest uppercase">Contact</div>
        <div class="space-y-1.5">
          <a href="mailto:${SITE.email}" class="font-body text-xs text-hw-muted hover:text-hw-red transition-colors">${SITE.email}</a>
          <a href="tel:${SITE.phone}" class="font-body text-xs text-hw-muted hover:text-hw-red transition-colors">${SITE.phone}</a>
          <a href="https://instagram.com/${SITE.instagram.replace('@','')}" target="_blank" rel="noopener" class="font-body text-xs text-hw-muted hover:text-hw-red transition-colors">${SITE.instagram}</a>
        </div>
      </div>
    </div>
    <div class="border-t border-hw-border pt-6 text-center">
      <p class="font-body text-xs text-hw-muted">© 2025 민화 작가 유미정. All rights reserved.</p>
    </div>
  </div>
</footer>`;
    };

    window.toggleMenu = function () { document.getElementById('mobile-menu').classList.toggle('hidden'); };
    window.closeMenu  = function () { document.getElementById('mobile-menu').classList.add('hidden'); };
})();
