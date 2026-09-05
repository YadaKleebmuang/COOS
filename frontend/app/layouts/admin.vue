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
  <div class="min-h-screen bg-[#F7F7F5] font-sans relative overflow-x-hidden text-[#171717]">
    <!-- Progressive Top Blur Layer -->
    <Teleport to="body">
      <div class="fixed left-0 right-0 top-0 z-[35] h-[80px] pointer-events-none progressive-blur-layer lg:h-[100px]" />
    </Teleport>

    <!-- Background Elements -->
    <div class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(255,255,255,0.98),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(255,255,255,0.85),transparent_28%)]" />
      <div class="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-[#EDF3FF]/70 blur-[72px]" />
      <div class="absolute right-[-8%] top-16 h-[28rem] w-[28rem] rounded-full bg-[#F0EEFF]/65 blur-[78px]" />
      <div class="absolute bottom-[-16%] left-[30%] h-[26rem] w-[32rem] rounded-full bg-white/80 blur-[82px]" />
    </div>

    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="sidebarOpen"
      @close="sidebarOpen = false"
    />

    <!-- Main area: offset by sidebar width on desktop -->
    <div class="lg:pl-60 flex flex-col min-h-screen relative z-10">
      <!-- Topbar -->
      <AdminTopbar
        :page-title="currentPageTitle"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <!-- Page content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ========================================================
   PROGRESSIVE TOP BLUR
   ======================================================== */
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
}

.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}
</style>
