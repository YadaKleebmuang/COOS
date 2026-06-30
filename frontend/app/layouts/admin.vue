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
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="sidebarOpen"
      @close="sidebarOpen = false"
    />

    <!-- Main area: offset by sidebar width on desktop -->
    <div class="lg:pl-60 flex flex-col min-h-screen">
      <!-- Topbar -->
      <AdminTopbar
        :page-title="currentPageTitle"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <!-- Page content -->
      <main class="flex-1 p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
