<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  role: "customer" | "editor" | "admin"
}>()

interface SidebarItem {
  name: string
  path: string
  icon: string
}

const menuItems = computed<SidebarItem[]>(() => {
  if (props.role === "admin") {
    return [
      {
        name: "แดชบอร์ดภาพรวม",
        path: "/admin/dashboard",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      },
      {
        name: "จัดการผู้ใช้",
        path: "/admin/users",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      },
      {
        name: "จัดการออเดอร์",
        path: "/admin/orders",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      },
      {
        name: "จัดการแพ็กเกจ",
        path: "/admin/packages",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      },
      {
        name: "จัดการประเภทงาน",
        path: "/admin/work-types",
        icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      },
      {
        name: "จัดการแกลเลอรี",
        path: "/admin/gallery",
        icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      },
      {
        name: "จัดการนโยบายร้าน",
        path: "/admin/policies",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      }
    ]
  }

  if (props.role === "editor") {
    return [
      {
        name: "แดชบอร์ด",
        path: "/editor/dashboard",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      },
      {
        name: "ประวัติการทำงาน",
        path: "/editor/jobs",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      },
      {
        name: "แก้ไขโปรไฟล์",
        path: "/editor/profile",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      }
    ]
  }

  // Default to Customer
  return [
    {
      name: "แดชบอร์ดของฉัน",
      path: "/customer/dashboard",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      name: "สั่งแต่งภาพใหม่",
      path: "/customer/orders/create",
      icon: "M12 4v16m8-8H4"
    },
    {
      name: "ประวัติออเดอร์",
      path: "/customer/orders",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    },
    {
      name: "แก้ไขโปรไฟล์",
      path: "/customer/profile",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    }
  ]
})
</script>

<template>
  <aside class="w-60 bg-white text-gray-600 min-h-screen flex flex-col border-r border-gray-200 flex-shrink-0">

    <!-- Brand Logo -->
    <div class="h-14 flex items-center px-5 border-b border-gray-100 gap-2.5 flex-shrink-0">
      <div class="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-bold text-gray-900 leading-none">COOS Studio</p>
        <p class="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{{ role === 'editor' ? 'Editor Workspace' : 'Dashboard' }}</p>
      </div>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-4">
      <div>
        <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
          เมนูหลัก
        </p>
        <div class="space-y-0.5">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            active-class="bg-gray-900 text-white shadow-sm hover:bg-gray-900 hover:text-white"
          >
            <!-- Icon -->
            <svg class="w-4 h-4 flex-shrink-0" :class="$route.path.startsWith(item.path) && item.path !== '/' ? 'text-white' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
            </svg>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-gray-100 flex-shrink-0">
      <p class="text-[10px] text-gray-400 text-center">COOS © 2025</p>
    </div>
  </aside>
</template>
