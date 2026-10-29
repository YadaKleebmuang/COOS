<script setup lang="ts">
import { ref } from "vue"

const route = useRoute()

const sidebarOpen = ref(false)

// Derive page title from current route
const pageTitles: Record<string, string> = {
  "/admin/dashboard": "แดชบอร์ด",
  "/admin/orders": "คำสั่งงาน",
  "/admin/payments": "ตรวจสอบการชำระเงิน",
  "/admin/assignments": "มอบหมายงาน",
  "/admin/users": "บัญชีผู้ใช้",
  "/admin/work-types": "ประเภทงาน",
  "/admin/packages": "แพ็กเกจ",
  "/admin/gallery": "คลังรูปภาพ",
  "/admin/categories-tags": "หมวดหมู่และแฮชแท็ก",
  "/admin/files": "ไฟล์ในระบบ",
  "/admin/policies": "นโยบายและเงื่อนไข",
  "/admin/reports": "รายงาน",
  "/admin/settings": "ตั้งค่า"
}

const currentPageTitle = computed(() => pageTitles[route.path] ?? "Admin Panel")
</script>

<template>
  <div class="admin-workspace admin-theme">
    <AdminSidebar :collapsed="sidebarOpen" @close="sidebarOpen = false" />
    <div class="admin-content lg:pl-60 flex min-h-screen flex-col">
      <AdminTopbar :page-title="currentPageTitle" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="admin-main flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
        <slot />
      </main>
      <footer class="admin-footer reports-no-print">
        <p>COOS <span>STUDIO MANAGEMENT</span></p>
        <NuxtLink to="/">ดูหน้าเว็บไซต์ →</NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style>
/* Keep report print styles independent of the on-screen admin theme. */
@media screen {
  .admin-workspace { min-height: 100vh; background: #f5f0e7; color: #172c3b; }
  .admin-content, .admin-main, .admin-page { min-width: 0; }
  .admin-page { width: 100%; }
  .admin-theme :is(section, article, aside, form, label) { min-width: 0; }
  .admin-theme :is(h1, h2, h3, p, dd) { overflow-wrap: anywhere; }
  .admin-theme .admin-page-heading { padding: 30px; background: #172c3b; color: #f5f0e7; border: 1px solid #172c3b; border-radius: 14px; box-shadow: none; }
  .admin-theme .admin-page-heading h1 { color: #f5f0e7; font-size: clamp(25px, 2.5vw, 34px); line-height: 1.5; font-weight: 600; }
  .admin-theme .admin-page-heading p { color: #c7d2d7; font-size: 14px; line-height: 1.85; }
  .admin-theme .admin-page-heading .admin-eyebrow { color: #ffad80; font-size: 10px; letter-spacing: .17em; font-weight: 600; margin: 14px 0 10px; }
  .admin-theme .admin-page-heading nav { flex-wrap: wrap; }
  .admin-theme .admin-page-heading nav :is(a, span, svg), .admin-theme .admin-breadcrumb :is(a, span, svg) { color: #c7d2d7; }
  .admin-theme .admin-page-heading > button { align-self: flex-start; flex-shrink: 0; border-radius: 8px; min-height: 44px; }
  .admin-theme .admin-primary { min-height: 44px; border-radius: 8px; box-shadow: none; }
  .admin-theme .admin-primary:not(:disabled) { background: #ff955e; color: #172c3b; border-color: #ff955e; }
  .admin-theme .admin-primary:not(:disabled):hover { background: #ffad80; border-color: #ffad80; }
  .admin-theme .admin-primary:disabled { background: #d9d1c5; color: #52616a; cursor: not-allowed; opacity: 1; }
  .admin-theme .admin-metric { background: #e5e9e1; border-color: #172c3b1a; border-radius: 14px; box-shadow: none; height: auto; min-height: 120px; }
  .admin-theme .admin-filters button { min-height: 40px; border-radius: 8px; }
  .admin-theme .admin-filters .bg-gray-900 { background: #172c3b; border-color: #172c3b; }
  .admin-theme .admin-filters .bg-white { background: #fcf9f3; color: #52616a; border-color: #172c3b26; }
  .admin-theme .admin-table tbody { background: #fcf9f3; }
  .admin-theme .admin-table thead { background: #e5e9e1; }
  .admin-theme .admin-table tr:hover { background: #eee7db; }
  .admin-theme .admin-table { border-color: #172c3b1a; }
  .admin-theme :is(input, select, textarea) { min-width: 0; max-width: 100%; accent-color: #172c3b; }
  .admin-theme input:not([type="file"]):not([type="checkbox"]):not([type="radio"]), .admin-theme select { min-height: 40px; }
  .admin-theme :is(a, button, input, textarea, select, [tabindex]):focus-visible { outline: 3px solid #c56a35; outline-offset: 3px; }
  .admin-theme.admin-overlay { color: #172c3b; }
  .admin-theme.admin-overlay > .relative { max-height: 90dvh; overflow-y: auto; }
  .admin-theme.admin-overlay [class~="bg-[#e5e9e1]"] { background: #e5e9e1; }
  .admin-theme [class~="bg-white"]:not(button), .admin-theme [class~="bg-white/80"] { background-color: #fcf9f3; }
  .admin-theme [class~="text-gray-900"] { color: #172c3b; }
  .admin-theme [class~="text-gray-500"], .admin-theme [class~="text-gray-600"] { color: #52616a; }
  .admin-theme [class~="text-gray-400"] { color: #69777f; }
  .admin-theme [class~="bg-gray-900"] { background-color: #172c3b; }
  .admin-theme [class~="bg-gray-50"] { background-color: #e5e9e1; }
  .admin-theme [class~="bg-[#171717]"] { background-color: #172c3b; }
  .admin-theme [class~="bg-[#F7F7F5]/50"] { background-color: #eee7db; }
  /* Navigation belongs exclusively to the admin layout. */
  .admin-workspace .admin-sidebar { background: #172c3b; color: #f5f0e7; border-color: #ffffff1a; backdrop-filter: none; }
  .admin-workspace .admin-sidebar > div { border-color: #ffffff1a; }
  .admin-workspace .admin-sidebar > div:first-child a { color: #f5f0e7; }
  .admin-workspace .admin-sidebar p, .admin-workspace .admin-sidebar span span { color: #aebfc8; }
  .admin-workspace .admin-sidebar nav a { min-height: 44px; border-radius: 8px; color: #c7d2d7; }
  .admin-workspace .admin-sidebar nav a svg { color: currentColor; }
  .admin-workspace .admin-sidebar nav a:hover { background: #244050; color: #f5f0e7; }
  .admin-workspace .admin-sidebar nav a[aria-current="page"] { background: #ff955e; color: #172c3b; }
  .admin-workspace .admin-topbar { height: 88px; padding-top: 16px; }
  .admin-workspace .admin-topbar header { height: 58px; border-radius: 14px; border-color: #172c3b1f; background: #faf6eef7; box-shadow: 0 8px 28px #172c3b0a; }
  .admin-workspace .admin-topbar button[aria-label="เปิดเมนูแอดมิน"] { min-width: 40px; min-height: 40px; }
  .admin-workspace .admin-topbar button[aria-label="เปิดเมนูบัญชีแอดมิน"] { background: #172c3b; width: 40px; height: 40px; }
  .admin-workspace .admin-topbar p { max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .admin-workspace .admin-topbar [class~="bg-white/95"], .admin-workspace .admin-topbar [class~="bg-white"] { background: #fcf9f3; }
  .admin-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 24px 32px; background: #e5e9e1; border-top: 1px solid #172c3b1a; color: #52616a; font-size: 11px; }
  .admin-footer p { color: #172c3b; font-weight: 700; letter-spacing: .15em; }
  .admin-footer p span { display: block; font-size: 8px; font-weight: 400; margin-top: 6px; }
  .admin-footer a:hover { color: #8a492d; }
  /* Shared confirmation popups keep their original theme in other roles. */
  body:has(.admin-workspace) .admin-confirm-dialog > .relative { background: #fcf9f3; border-color: #172c3b26; border-radius: 14px; color: #172c3b; }
  body:has(.admin-workspace) .admin-confirm-dialog button { min-height: 44px; }
  body:has(.admin-workspace) .admin-confirm-dialog button.bg-gray-900 { background: #ff955e; color: #172c3b; }
  body:has(.admin-workspace) .swal2-popup { background: #fcf9f3; color: #172c3b; border-radius: 14px; }
}
@media screen and (max-width: 767px) {
  .admin-theme .admin-page-heading { padding: 24px 20px; }
  .admin-main { padding-top: 16px; }
  .admin-theme input:not([type="file"]):not([type="checkbox"]):not([type="radio"]), .admin-theme textarea, .admin-theme select { font-size: 16px; }
  .admin-theme.admin-overlay > .relative { width: 100%; }
  .admin-footer { padding: 24px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .admin-theme *, .admin-theme *::before, .admin-theme *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; scroll-behavior: auto !important; }
}
</style>
