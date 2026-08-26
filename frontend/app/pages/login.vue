<script setup lang="ts">
import { ref, reactive } from 'vue'

const router = useRouter()
const route = useRoute()

definePageMeta({
  layout: false,
  middleware: ['guest']
})

const form = reactive({
  email: '',
  password: ''
})

const error = ref<string>('')
const loading = ref<boolean>(false)

const auth = useAuth()

const getSafeCustomerRedirect = (redirect: unknown) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return ''
  if (!redirect.startsWith('/customer')) return ''
  return redirect
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

const login = async () => {
  if (loading.value) return
  error.value = ''

  if (!form.email || !form.password) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }

  loading.value = true
  try {
    const data = await auth.login(form.email, form.password)
    const userRole = data?.user?.userRole || 'customer'
    const redirect = getSafeCustomerRedirect(route.query.redirect)

    if (redirect && userRole === 'customer') {
      await router.push(redirect)
    } else {
      if (userRole === 'admin') {
        await router.push('/admin/dashboard')
      } else if (userRole === 'editor') {
        await router.push('/editor/dashboard')
      } else {
        await router.push('/customer/dashboard')
      }
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'เข้าสู่ระบบไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="coos-page min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
    <!-- Ambient Canvas background image -->
    <div class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat login-bg" />

    <!-- Main Auth Shell (Glass) -->
    <div class="relative z-10 mx-auto w-full max-w-[1024px] overflow-hidden rounded-[24px] border border-white/40 bg-white/50 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] lg:min-h-[580px]">
      <!-- Left: Visual Storytelling Panel (hidden on mobile, collapsed/simplified on tablet) -->
      <div class="hidden md:flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-cover bg-no-repeat left-bg border-r border-white/20">
        <!-- Localized overlay: readable white gradient on the left, clear on the right for character visual -->
        <div class="absolute inset-0 z-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />

        <!-- Branding / Logo -->
        <div class="relative z-10">
          <NuxtLink to="/" class="inline-flex flex-col leading-none text-black">
            <span class="text-2xl font-black tracking-[0.24em]">COOS</span>
            <span class="mt-1 text-[8px] font-bold tracking-[0.48em] text-black">STUDIO</span>
          </NuxtLink>
        </div>

        <!-- Headline & Benefits composition -->
        <div class="relative z-10 my-auto py-12 max-w-sm">
          <h2 class="text-3xl font-black leading-tight text-black md:text-4xl">
            งานศิลปะที่ใช่<br>
            สไตล์ที่เป็นคุณ
          </h2>
          <p class="mt-4 text-sm leading-7 text-neutral-600 font-medium">
            สร้างสรรค์ภาพพอร์เทรตและผลงานศิลปะในสไตล์ที่สะท้อนตัวตนของคุณ ด้วยทีมงานมืออาชีพและขั้นตอนการสั่งงานที่ง่ายดาย
          </p>

          <!-- Small Informational Trust Strip -->
          <div class="mt-10 space-y-4 border-t border-black/5 pt-6">
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">เลือกสไตล์และตรวจสอบราคาก่อนเริ่มงาน</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">ติดตามสถานะงานสั่งทำผ่านระบบแดชบอร์ด</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">ดาวน์โหลดผลงานดิจิทัลคุณภาพสูงเมื่อพร้อม</span>
            </div>
          </div>
        </div>

        <!-- Copyright Info -->
        <div class="relative z-10 text-[10px] font-semibold tracking-wider text-neutral-400">
          © 2026 COOS STUDIO. ALL RIGHTS RESERVED.
        </div>
      </div>

      <!-- Right: Login Form Panel (scrollable / auto-height) -->
      <div class="flex flex-col justify-center p-7 sm:p-10 lg:p-12 bg-white/40 backdrop-blur-sm relative z-10">
        <!-- Mobile Logo (shown only on mobile) -->
        <div class="flex justify-center mb-8 md:hidden">
          <NuxtLink to="/" class="flex flex-col items-center leading-none text-black">
            <span class="text-3xl font-black tracking-[0.28em]">COOS</span>
            <span class="mt-1 text-[9px] font-bold tracking-[0.48em]">STUDIO</span>
          </NuxtLink>
        </div>

        <div class="w-full max-w-sm mx-auto">
          <!-- Header -->
          <div class="text-left mb-8">
            <p class="coos-kicker mb-3">
              WELCOME BACK
            </p>
            <h1 class="text-3xl font-black tracking-tight text-black">
              เข้าสู่ระบบ
            </h1>
            <p class="mt-2 text-sm text-neutral-500">
              ยินดีต้อนรับกลับมาใช้งาน COOS
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="login">
            <div>
              <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">อีเมล</label>
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                autocomplete="email"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">รหัสผ่าน</label>
              <input
                id="login-password"
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <!-- Error -->
            <div
              v-if="error"
              class="rounded-xl border border-red-200/50 bg-red-50/70 px-4 py-3 backdrop-blur-sm"
            >
              <p class="text-red-600 text-sm text-center font-semibold">
                {{ error }}
              </p>
            </div>

            <!-- Button -->
            <button
              id="login-submit"
              type="submit"
              :disabled="loading"
              class="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 mt-6 cursor-pointer"
            >
              <span
                v-if="loading"
                class="flex items-center justify-center gap-2"
              >
                <svg
                  class="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                ><circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                /><path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                /></svg>
                กำลังเข้าสู่ระบบ...
              </span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>
          </form>

          <!-- Footer -->
          <p class="mt-8 text-center text-sm text-neutral-500">
            ยังไม่มีบัญชี?
            <NuxtLink
              to="/register"
              class="font-bold text-black hover:underline"
            >
              สมัครสมาชิก
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  background-image: url('~/assets/images/public/coos-public.png');
}

.left-bg {
  background-image: url('~/assets/images/public/coos-home-hero.png');
  background-position: 70% center;
}
</style>
