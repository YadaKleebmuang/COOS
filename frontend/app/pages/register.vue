<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()

definePageMeta({
  layout: false,
  middleware: ['guest']
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const error = ref<string>('')
const loading = ref<boolean>(false)

const auth = useAuth()

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

const register = async () => {
  if (loading.value) return
  error.value = ''

  if (!form.firstName || !form.lastName || !form.email || !form.password) {
    error.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
    return
  }
  if (form.password.length < 8) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  loading.value = true
  try {
    await auth.register(form)
    await router.push('/login')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'สมัครสมาชิกไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="coos-page min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
    <!-- Ambient Canvas background image -->
    <div class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat register-bg" />

    <!-- Main Auth Shell (Glass) -->
    <div class="relative z-10 mx-auto w-full max-w-[1024px] overflow-hidden rounded-[24px] border border-white/40 bg-white/50 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.06)] grid grid-cols-1 md:grid-cols-[1fr_1.2fr] lg:min-h-[640px]">
      <!-- Left: Visual Storytelling Panel (hidden on mobile) -->
      <div class="hidden md:flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-cover bg-no-repeat left-bg border-r border-white/20">
        <!-- Localized overlay: readable gradient on the left, clear on the right -->
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
            สร้างสรรค์ผลงานพิเศษ<br>
            ในแบบที่เป็นคุณ
          </h2>
          <p class="mt-4 text-sm leading-7 text-neutral-600 font-medium">
            ร่วมสัมผัสประสบการณ์การสั่งทำรูปภาพพอร์เทรตและผลงานศิลปะสุดพิเศษ ด้วยการสมัครสมาชิกเพื่อติดตามผลงานและจัดการคำสั่งซื้อของคุณ
          </p>

          <!-- Small Informational Trust Strip -->
          <div class="mt-10 space-y-4 border-t border-black/5 pt-6">
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">สั่งงานและเลือกรับบริการได้หลากหลาย</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">ติดตามและยืนยันแบบผ่านระบบแดชบอร์ด</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">✦</span>
              <span class="text-xs font-bold text-neutral-800">ดาวน์โหลดผลงานดิจิทัลและแชร์ได้ทันที</span>
            </div>
          </div>
        </div>

        <!-- Copyright Info -->
        <div class="relative z-10 text-[10px] font-semibold tracking-wider text-neutral-400">
          © 2026 COOS STUDIO. ALL RIGHTS RESERVED.
        </div>
      </div>

      <!-- Right: Register Form Panel (scrollable / auto-height) -->
      <div class="flex flex-col justify-center p-7 sm:p-10 lg:p-12 bg-white/40 backdrop-blur-sm relative z-10">
        <!-- Mobile Logo (shown only on mobile) -->
        <div class="flex justify-center mb-8 md:hidden">
          <NuxtLink to="/" class="flex flex-col items-center leading-none text-black">
            <span class="text-3xl font-black tracking-[0.28em]">COOS</span>
            <span class="mt-1 text-[9px] font-bold tracking-[0.48em]">STUDIO</span>
          </NuxtLink>
        </div>

        <div class="w-full max-w-md mx-auto">
          <!-- Header -->
          <div class="text-left mb-6">
            <p class="coos-kicker mb-2">
              JOIN COOS
            </p>
            <h1 class="text-3xl font-black tracking-tight text-black">
              สร้างบัญชีใหม่
            </h1>
            <p class="mt-2 text-sm text-neutral-500">
              กรอกข้อมูลเพื่อสมัครสมาชิก COOS
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-4" @submit.prevent="register">
            <!-- Name -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">ชื่อ</label>
                <input
                  id="register-firstname"
                  v-model="form.firstName"
                  type="text"
                  placeholder="ชื่อ"
                  class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">นามสกุล</label>
                <input
                  id="register-lastname"
                  v-model="form.lastName"
                  type="text"
                  placeholder="นามสกุล"
                  class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
                >
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">อีเมล</label>
              <input
                id="register-email"
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                autocomplete="email"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <!-- Password -->
            <div>
              <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">รหัสผ่าน</label>
              <input
                id="register-password"
                v-model="form.password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autocomplete="new-password"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="mb-1.5 block text-xs font-bold text-neutral-700 uppercase tracking-wider">ยืนยันรหัสผ่าน</label>
              <input
                id="register-confirm-password"
                v-model="form.confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autocomplete="new-password"
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
              id="register-submit"
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
                กำลังสมัครสมาชิก...
              </span>
              <span v-else>สมัครสมาชิก</span>
            </button>
          </form>

          <!-- Footer -->
          <p class="mt-8 text-center text-sm text-neutral-500">
            มีบัญชีอยู่แล้ว?
            <NuxtLink
              to="/login"
              class="font-bold text-black hover:underline"
            >
              เข้าสู่ระบบ
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-bg {
  background-image: url('~/assets/images/public/coos-public.png');
}

.left-bg {
  background-image: url('~/assets/images/public/coos-public-1.png');
  background-position: 70% center;
}
</style>
