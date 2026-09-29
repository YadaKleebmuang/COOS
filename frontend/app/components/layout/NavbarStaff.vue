<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ role: 'admin' | 'editor' }>()
const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>()

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()
const token = useCookie<string | null>('token')

interface CurrentUser {
  userFirstName?: string
  userLastName?: string
  userEmail?: string
}

const currentUser = ref<CurrentUser | null>(null)
const dropdownOpen = ref(false)

const editorPageTitles: Record<string, string> = {
  '/editor/dashboard': 'แดชบอร์ด',
  '/editor/jobs': 'งานที่ได้รับมอบหมาย',
  '/editor/prompt-notes': 'บันทึก Prompt',
  '/editor/profile': 'แก้ไขโปรไฟล์'
}

const currentPageTitle = computed(() => {
  if (props.role !== 'editor') return 'Admin Panel'
  if (route.path.startsWith('/editor/jobs/')) return 'ห้องทำงาน (Workspace)'
  return editorPageTitles[route.path] ?? 'Editor Workspace'
})

const initials = computed(() => {
  if (!currentUser.value) return 'ED'
  const first = currentUser.value.userFirstName?.[0] ?? ''
  const last = currentUser.value.userLastName?.[0] ?? ''
  return (first + last).toUpperCase() || 'ED'
})

const fetchUser = async () => {
  if (!token.value) return
  try {
    currentUser.value = await apiFetch<CurrentUser>('/users/me')
  } catch {
    token.value = null
    currentUser.value = null
  }
}

const toggleDropdown = (event: Event) => {
  event.stopPropagation()
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const logout = async () => {
  await useAuth().logout()
  currentUser.value = null
  dropdownOpen.value = false
  router.push('/')
}

onMounted(() => {
  fetchUser()
  window.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="h-[68px] sm:h-[72px] shrink-0 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 w-full max-w-[1440px] mx-auto">
    <header class="liquid-glass-nav h-16 flex items-center justify-between px-4 sm:px-5 lg:px-6 w-full">
      <div class="flex items-center gap-3 min-w-0">
        <button
          aria-label="เปิดเมนู"
          class="lg:hidden p-1.5 rounded-lg text-[#666666] hover:bg-[#F3F3F1] transition-colors focus:outline-none"
          @click="emit('toggle-sidebar')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          /></svg>
        </button>
        <h1 class="text-[13px] font-semibold text-[#171717] tracking-wide truncate">
          {{ currentPageTitle }}
        </h1>
      </div>

      <div
        v-if="currentUser"
        class="flex items-center gap-2.5"
      >
        <div class="hidden md:block text-right">
          <p class="text-[12px] font-semibold text-[#171717] leading-tight">
            {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
          </p>
          <p class="text-[10px] text-[#929292] mt-0.5">
            ช่างแต่งภาพ (Editor)
          </p>
        </div>

        <div class="relative">
          <button
            aria-label="เปิดเมนูบัญชี"
            class="w-9 h-9 rounded-full bg-[#171717] text-white text-[11px] font-semibold flex items-center justify-center border border-black/[0.06] shadow-sm hover:bg-black transition-colors"
            @click="toggleDropdown"
          >
            {{ initials }}
          </button>
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] py-1.5 z-50"
              @click.stop
            >
              <div class="px-4 py-3 border-b border-black/[0.06]">
                <p class="text-sm font-semibold text-[#171717] truncate">
                  {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                </p>
                <p class="text-[11px] text-[#929292] truncate mt-0.5">
                  {{ currentUser.userEmail }}
                </p>
              </div>
              <div class="py-1 px-1.5">
                <NuxtLink
                  to="/editor/profile"
                  class="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#666666] hover:bg-[#171717]/[0.03] hover:text-[#171717] rounded-lg transition-colors"
                  @click="closeDropdown"
                >
                  <svg
                    class="w-4 h-4 text-[#929292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  /></svg>
                  แก้ไขโปรไฟล์
                </NuxtLink>
              </div>
              <div class="border-t border-black/[0.06] pt-1.5 px-1.5">
                <button
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50/60 rounded-lg transition-colors"
                  @click="logout"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  /></svg>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <div
        v-else
        class="w-9 h-9 rounded-full bg-[#EFEFEA] animate-pulse"
      />
    </header>
  </div>
</template>

<style scoped>
.liquid-glass-nav {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 9999px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(20px) saturate(1.15);
  -webkit-backdrop-filter: blur(20px) saturate(1.15);
}
</style>
