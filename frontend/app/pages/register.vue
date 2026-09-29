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
    <!-- Progressive Top Blur Layer -->
    <Teleport to="body">
      <div class="fixed top-0 left-0 right-0 h-[100px] sm:h-[120px] lg:h-[140px] z-[150] pointer-events-none progressive-blur-layer" />
    </Teleport>

    <!-- Subtle Grid background -->
    <div class="register-grid pointer-events-none fixed inset-0 z-0" />

    <!-- Main Auth Shell (Glass) -->
    <div class="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
      
      <!-- Center: Register Form Panel -->
      <div class="flex flex-col p-8 sm:px-11 sm:py-9 bg-transparent relative z-10">
        
        <div class="w-full">
          <!-- Logo -->
          <div class="flex justify-center mb-10">
            <NuxtLink to="/" class="flex flex-col items-center leading-none text-black">
              <span class="text-3xl font-black tracking-[0.28em]">COOS</span>
              <span class="mt-1 text-[9px] font-bold tracking-[0.48em]">STUDIO</span>
            </NuxtLink>
          </div>

          <!-- Header -->
          <div class="text-center mb-8">
            <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono">
              JOIN COOS
            </p>
            <h1 class="text-[28px] font-semibold tracking-tight text-[#171717]">
              สร้างบัญชีใหม่
            </h1>
            <p class="mt-3 text-[14px] text-neutral-500">
              กรอกข้อมูลเพื่อสมัครสมาชิก COOS
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-3" @submit.prevent="register">
            <!-- Name -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-neutral-700 uppercase tracking-wider">ชื่อ</label>
                <input
                  id="register-firstname"
                  v-model="form.firstName"
                  type="text"
                  placeholder="ชื่อ"
                  class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
                >
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-neutral-700 uppercase tracking-wider">นามสกุล</label>
                <input
                  id="register-lastname"
                  v-model="form.lastName"
                  type="text"
                  placeholder="นามสกุล"
                  class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
                >
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="mb-1 block text-xs font-bold text-neutral-700 uppercase tracking-wider">อีเมล</label>
              <input
                id="register-email"
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                autocomplete="email"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <!-- Password -->
            <div>
              <label class="mb-1 block text-xs font-bold text-neutral-700 uppercase tracking-wider">รหัสผ่าน</label>
              <input
                id="register-password"
                v-model="form.password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autocomplete="new-password"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="mb-1 block text-xs font-bold text-neutral-700 uppercase tracking-wider">ยืนยันรหัสผ่าน</label>
              <input
                id="register-confirm-password"
                v-model="form.confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autocomplete="new-password"
                class="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-black placeholder-neutral-400 shadow-sm transition-all focus:border-black/30 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/5"
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
              class="w-full flex h-[48px] items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 mt-5 cursor-pointer"
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
          <p class="mt-6 text-center text-sm text-neutral-500">
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

.register-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-color: #fafafa;
}
</style>
