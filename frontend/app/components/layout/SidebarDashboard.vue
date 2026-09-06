<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  role: 'customer' | 'editor' | 'admin'
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()

const editorMenuItems = [
  { name: 'แดชบอร์ด', path: '/editor/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'งานที่ได้รับมอบหมาย', path: '/editor/jobs', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { name: 'บันทึก Prompt', path: '/editor/prompt-notes', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { name: 'โปรไฟล์', path: '/editor/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const menuItems = computed(() => props.role === 'editor' ? editorMenuItems : [])
const isActive = (path: string) => route.path === path || (path !== '/editor/dashboard' && route.path.startsWith(`${path}/`))
</script>

<template>
  <div
    v-if="collapsed"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    @click="emit('close')"
  />

  <aside
    class="fixed top-0 left-0 h-full w-60 bg-white/70 backdrop-blur-xl border-r border-black/[0.06] flex flex-col z-40 transition-transform duration-300"
    :class="collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div class="h-[68px] sm:h-[72px] flex items-center px-6 border-b border-black/[0.06] flex-shrink-0 bg-transparent">
      <NuxtLink
        to="/editor/dashboard"
        class="flex flex-col leading-none text-black"
        @click="emit('close')"
      >
        <span class="text-2xl font-semibold tracking-[0.24em]">COOS</span>
        <span class="mt-1 text-[7px] font-medium tracking-[0.48em]">STUDIO <span class="text-[#929292]">EDITOR</span></span>
      </NuxtLink>
    </div>

    <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-5">
      <div>
        <p class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#929292] select-none">
          พื้นที่ทำงาน
        </p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 border border-transparent"
            :class="isActive(item.path) ? 'bg-[#171717]/5 text-[#171717] font-semibold' : 'text-[#666666] font-medium hover:bg-[#171717]/[0.03] hover:text-[#171717]'"
            @click="emit('close')"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              :class="isActive(item.path) ? 'text-[#171717]' : 'text-[#929292]'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                :d="item.icon"
              />
            </svg>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="px-4 py-3 border-t border-[#EFEFEA]/60 flex-shrink-0">
      <p class="text-[10px] text-[#9A9A95] text-center">
        COOS © 2025
      </p>
    </div>
  </aside>
</template>
