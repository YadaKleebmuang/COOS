<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const route = useRoute()

interface SidebarGroup {
  label: string
  items: {
    name: string
    path: string
    icon: string
  }[]
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "ภาพรวม",
    items: [
      {
        name: "แดชบอร์ด",
        path: "/admin/dashboard",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      }
    ]
  },
  {
    label: "คำสั่งงาน",
    items: [
      {
        name: "คำสั่งงาน",
        path: "/admin/orders",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      },
      {
        name: "ตรวจสอบการชำระเงิน",
        path: "/admin/payments",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      },
      {
        name: "มอบหมายงาน",
        path: "/admin/assignments",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      }
    ]
  },
  {
    label: "ผู้ใช้งาน",
    items: [
      {
        name: "บัญชีผู้ใช้",
        path: "/admin/users",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      }
    ]
  },
  {
    label: "เนื้อหา",
    items: [
      {
        name: "ประเภทงาน",
        path: "/admin/work-types",
        icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      },
      {
        name: "แพ็กเกจ",
        path: "/admin/packages",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      },
      {
        name: "คลังรูปภาพ",
        path: "/admin/gallery",
        icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      },
      {
        name: "หมวดหมู่และแฮชแท็ก",
        path: "/admin/categories-tags",
        icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      },
      // {
      //   name: "ไฟล์ในระบบ",
      //   path: "/admin/files",
      //   icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      // }
    ]
  },
  {
    label: "ระบบ",
    items: [
      {
        name: "นโยบายและเงื่อนไข",
        path: "/admin/policies",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      },
      {
        name: "รายงาน",
        path: "/admin/reports",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      },
      {
        name: "ตั้งค่า",
        path: "/admin/settings",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      }
    ]
  }
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <!-- Mobile Overlay -->
  <div
    v-if="collapsed"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    @click="emit('close')"
  />

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-full w-60 bg-white/80 backdrop-blur-[15px] border-r border-[#EFEFEA]/60 flex flex-col z-40 transition-transform duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.015)]"
    :class="collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-5 border-b border-[#EFEFEA]/60 gap-2.5 flex-shrink-0">
      <div class="w-7 h-7 rounded-lg bg-[#171717] flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-bold text-[#171717] leading-none">COOS Studio</p>
        <p class="text-[10px] text-[#9A9A95] mt-0.5 uppercase tracking-wider">Admin Panel</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-4">
      <div v-for="group in sidebarGroups" :key="group.label">
        <!-- Group Label -->
        <p class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9A9A95] select-none">
          {{ group.label }}
        </p>
        <!-- Group Items -->
        <div class="space-y-0.5">
          <NuxtLink
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            @click="emit('close')"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 border border-transparent"
            :class="isActive(item.path)
              ? 'bg-[#EFEFEA] text-[#171717] font-bold border-[#EFEFEA] shadow-[0_2px_8px_rgba(0,0,0,0.01)]'
              : 'text-[#666660] hover:bg-[#EFEFEA]/40 hover:text-[#171717]'"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              :class="isActive(item.path) ? 'text-[#171717]' : 'text-[#9A9A95]'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
            </svg>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-[#EFEFEA]/60 flex-shrink-0">
      <p class="text-[10px] text-[#9A9A95] text-center">COOS © 2025</p>
    </div>
  </aside>
</template>
