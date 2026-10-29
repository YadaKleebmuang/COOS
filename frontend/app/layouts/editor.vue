<script setup lang="ts">
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="editor-workspace editor-theme">
    <LayoutSidebarDashboard
      role="editor"
      :collapsed="sidebarOpen"
      @close="sidebarOpen = false"
    />
    <div class="editor-content lg:pl-60 flex min-h-screen flex-col">
      <LayoutNavbarStaff
        class="editor-navbar"
        role="editor"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
      <main class="editor-main flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
        <slot />
      </main>
      <footer class="editor-footer">
        <p>COOS <span>CREATIVE WORKSPACE</span></p>
        <NuxtLink to="/gallery">สำรวจผลงานใน Gallery →</NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style>
/* The editor theme also travels with its teleported dialogs. */
.editor-workspace { min-height: 100vh; background: #f5f0e7; color: #172c3b; }
.editor-content, .editor-main, .editor-page { min-width: 0; }
.editor-page { width: 100%; }
.editor-theme :is(section, article, aside, form, label) { min-width: 0; }
.editor-theme :is(h1, h2, h3, p, dd) { overflow-wrap: anywhere; }
.editor-theme .editor-page-heading {
  padding: 30px;
  background: #172c3b;
  color: #f5f0e7;
  border: 1px solid #172c3b;
  border-radius: 14px;
  box-shadow: none;
}
.editor-theme .editor-page-heading :is(h1, h2) { color: #f5f0e7; }
.editor-theme .editor-page-heading h1 { font-size: clamp(25px, 2.5vw, 34px); font-weight: 600; line-height: 1.5; }
.editor-theme .editor-page-heading p { color: #c7d2d7; line-height: 1.85; }
.editor-theme .editor-page-heading p.font-medium { color: #f5f0e7; }
.editor-theme .editor-page-heading .editor-eyebrow { margin-top: 14px; color: #ffad80; font-size: 10px; letter-spacing: .17em; font-weight: 600; }
.editor-theme .editor-page-heading nav { flex-wrap: wrap; }
.editor-theme .editor-page-heading nav :is(a, span, svg) { color: #c7d2d7; }
.editor-theme .editor-heading-integrated { border-radius: 0; }
.editor-theme .editor-primary { min-height: 44px; border-radius: 8px; box-shadow: none; }
.editor-theme .editor-primary:not(:disabled) { background: #ff955e; color: #172c3b; border-color: #ff955e; }
.editor-theme .editor-primary:not(:disabled):hover { background: #ffad80; border-color: #ffad80; }
.editor-theme .editor-primary:disabled { background: #d9d1c5; color: #52616a; opacity: 1; cursor: not-allowed; }
.editor-theme .editor-callout { background: #e5e9e1; }
.editor-theme .editor-metric { background: #e5e9e1; border-color: #172c3b1a; border-radius: 14px; box-shadow: none; }
.editor-theme .editor-filters button { min-height: 40px; border-radius: 8px; }
.editor-theme .editor-filters button.bg-gray-900 { background: #172c3b; border-color: #172c3b; }
.editor-theme .editor-filters button.bg-white { background: #fcf9f3; border-color: #172c3b26; color: #52616a; }
.editor-theme .editor-jobs-table-scope tbody { background: #fcf9f3; }
.editor-theme :is(input:not([type="file"]):not([type="checkbox"]):not([type="radio"]), select, textarea) { min-width: 0; max-width: 100%; accent-color: #172c3b; }
.editor-theme :is(a, button, input, textarea, select, [tabindex]):focus-visible { outline: 3px solid #c56a35; outline-offset: 3px; }
.editor-theme .editor-overlay :is(header, footer) { background: #e5e9e1; }
.editor-theme.editor-overlay :is(header, footer) { background: #e5e9e1; }
.editor-theme.editor-overlay { color: #172c3b; }
.editor-theme.editor-overlay input:not([type="file"]), .editor-theme.editor-overlay textarea { min-height: 44px; }
/* Shared staff navigation retains its original appearance outside editor. */
.editor-workspace .editor-sidebar { background: #172c3b; color: #f5f0e7; border-color: #ffffff1a; backdrop-filter: none; }
.editor-workspace .editor-sidebar > div { border-color: #ffffff1a; }
.editor-workspace .editor-sidebar > div:first-child a { color: #f5f0e7; }
.editor-workspace .editor-sidebar p, .editor-workspace .editor-sidebar span span { color: #aebfc8; }
.editor-workspace .editor-sidebar nav a { min-height: 44px; border-radius: 8px; color: #c7d2d7; }
.editor-workspace .editor-sidebar nav a svg { color: currentColor; }
.editor-workspace .editor-sidebar nav a:hover { background: #244050; color: #f5f0e7; }
.editor-workspace .editor-sidebar nav a[aria-current="page"] { background: #ff955e; color: #172c3b; }
.editor-workspace .editor-navbar { height: 88px; padding-top: 16px; }
.editor-workspace .editor-navbar header { height: 58px; border-radius: 14px; border-color: #172c3b1f; background: #faf6eef7; box-shadow: 0 8px 28px #172c3b0a; }
.editor-workspace .editor-navbar h1 { color: #172c3b; }
.editor-workspace .editor-navbar button[aria-label="เปิดเมนูบัญชี"] { background: #172c3b; width: 40px; height: 40px; }
.editor-workspace .editor-navbar button[aria-label="เปิดเมนู"] { min-width: 40px; min-height: 40px; }
.editor-workspace .editor-navbar [class~="bg-white/95"] { background: #fcf9f3; border-color: #172c3b26; }
.editor-workspace .editor-navbar p { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.editor-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 24px 32px; background: #e5e9e1; border-top: 1px solid #172c3b1a; color: #52616a; font-size: 11px; }
.editor-footer p { color: #172c3b; font-weight: 700; letter-spacing: .15em; }
.editor-footer p span { display: block; font-size: 8px; font-weight: 400; margin-top: 6px; }
.editor-footer a:hover { color: #8a492d; }
@media (max-width: 767px) {
  .editor-theme .editor-page-heading { padding: 24px 20px; }
  .editor-main { padding-top: 16px; }
  .editor-theme input:not([type="file"]):not([type="checkbox"]):not([type="radio"]), .editor-theme textarea, .editor-theme select { font-size: 16px; }
  .editor-footer { padding: 24px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .editor-theme *, .editor-theme *::before, .editor-theme *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; scroll-behavior: auto !important; }
}
</style>
