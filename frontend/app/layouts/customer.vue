<template>
  <div class="customer-workspace">
    <div class="coos-shell">
      <LayoutNavbarCustomer />
      <main class="customer-main">
        <slot />
      </main>
    </div>
    <footer class="customer-footer">
      <div class="coos-shell">
        <NuxtLink to="/" class="customer-footer-brand">COOS <span>YOUR CREATIVE STUDIO</span></NuxtLink>
        <nav aria-label="ลิงก์ช่วยเหลือลูกค้า">
          <NuxtLink to="/gallery">สำรวจผลงาน</NuxtLink>
          <NuxtLink to="/policy?tab=terms">เงื่อนไขบริการ</NuxtLink>
          <NuxtLink to="/policy?tab=privacy">ความเป็นส่วนตัว</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style>
/* Customer-only theme: public, editor and admin layouts keep their own styles. */
.customer-workspace {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f0e7;
  color: #172c3b;
}
.customer-workspace > .coos-shell { flex: 1; }
.customer-main { padding: 32px 0 20px; }
.customer-workspace .customer-page { width: 100%; margin: 0 auto; padding-bottom: 40px; }
.customer-workspace .customer-page-heading {
  padding: 32px;
  border: 1px solid #172c3b;
  border-radius: 14px;
  background: #172c3b;
  color: #f5f0e7;
  box-shadow: none;
}
.customer-workspace .customer-page-heading h1 {
  color: #f5f0e7;
  line-height: 1.45;
  letter-spacing: -.025em;
  font-size: clamp(25px, 2.5vw, 36px);
  overflow-wrap: anywhere;
}
.customer-workspace .customer-eyebrow { color: #ffad80; font-size: 10px; letter-spacing: .17em; margin-bottom: 12px; }
.customer-workspace .customer-intro { color: #c7d2d7; line-height: 1.85; font-size: 14px; max-width: 680px; }
.customer-workspace .customer-primary { border-radius: 8px; min-height: 44px; box-shadow: none; }
.customer-workspace .customer-primary:not(:disabled) { background: #ff955e; border-color: #ff955e; color: #172c3b; }
.customer-workspace .customer-primary:not(:disabled):hover { background: #ffae84; border-color: #ffae84; }
.customer-workspace .customer-primary:disabled { background: #d9d1c5; color: #5d6870; cursor: not-allowed; box-shadow: none; }
.customer-workspace .customer-secondary { border-radius: 8px; background: #fcf9f3; color: #172c3b; border-color: #172c3b30; box-shadow: none; }
.customer-workspace .customer-secondary:hover { background: #eee7db; }
.customer-workspace .customer-metric { background: #244050; border-color: #ffffff20; box-shadow: none; border-radius: 10px; }
.customer-workspace .customer-metric p { color: #f5f0e7; }
.customer-workspace .customer-metric > p:first-child,
.customer-workspace .customer-metric > div:first-child > p { color: #c7d2d7; }
.customer-workspace .customer-callout { background: #e5e9e1; box-shadow: none; }
.customer-workspace .customer-toolbar { background: #e5e9e1; box-shadow: none; }
.customer-workspace .customer-option { background: #fcf9f3; }
.customer-workspace .customer-option[aria-pressed="true"] { background: #f4e2d1; border-color: #b96a3c; box-shadow: 0 0 0 1px #b96a3c; }
.customer-workspace .customer-option[aria-pressed="true"] h3 { color: #733b20; }
.customer-workspace .customer-stepper { background: #e5e9e1; border-radius: 12px; box-shadow: none; }
.customer-workspace .customer-stepper [aria-current="step"] { background: #f4e2d1; border-radius: 8px; }
.customer-workspace .customer-price-summary { background: #e5e9e1; box-shadow: none; }
.customer-workspace :is(a, button, input, textarea, select, [tabindex]):focus-visible { outline: 3px solid #c56a35; outline-offset: 3px; }
.customer-workspace :is(input, textarea, select) { accent-color: #172c3b; }
.customer-workspace :is(main, section, aside, form) { min-width: 0; }
.customer-workspace :is(h2, h3, label) { overflow-wrap: anywhere; }
.customer-workspace [id$="-section"] { scroll-margin-top: 110px; }
.customer-footer { border-top: 1px solid #172c3b18; background: #e5e9e1; padding: 26px 0; }
.customer-footer > div { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.customer-footer-brand { font-size: 18px; font-weight: 800; letter-spacing: .18em; }
.customer-footer-brand span { display: block; margin-top: 6px; font-size: 8px; letter-spacing: .15em; font-weight: 500; color: #52616a; }
.customer-footer nav { display: flex; flex-wrap: wrap; gap: 14px 24px; font-size: 11px; color: #52616a; }
.customer-footer a:hover { color: #8a492d; }
/* Shared calendar and pagination inherit this theme only inside the customer area. */
.customer-workspace .customer-calendar [class~="bg-white"],
.customer-workspace .customer-calendar [class~="bg-white/80"] { background: #fcf9f3; }
.customer-workspace .customer-calendar [class~="bg-[#171717]"] { background: #172c3b; }
.customer-workspace .customer-calendar [class~="absolute"][class~="top-full"] { width: min(280px, calc(100vw - 100px)); }
.customer-workspace .customer-pagination > div { background: #eee7db; border-color: #172c3b20; box-shadow: none; }
.customer-workspace .customer-pagination [class~="bg-gray-900"] { background: #172c3b; }
@media (max-width: 767px) {
  .customer-main { padding-top: 24px; }
  .customer-workspace .customer-page-heading { padding: 24px 20px; }
  .customer-workspace .customer-intro { font-size: 13px; }
  .customer-workspace .customer-page { padding-bottom: 24px; }
  .customer-footer > div { align-items: start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .customer-workspace *, .customer-workspace *::before, .customer-workspace *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
</style>
