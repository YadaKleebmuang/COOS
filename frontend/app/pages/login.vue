<script setup lang="ts">
import { ref, reactive } from 'vue'

const router = useRouter()
const route = useRoute()

definePageMeta({
  layout: false, // Currently does not use the default public layout/navbar
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
    let msg = getErrorMessage(err, 'เข้าสู่ระบบไม่สำเร็จ')
    if (msg === 'Invalid email or password') {
      msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    }
    error.value = msg
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
    <div class="login-grid pointer-events-none fixed inset-0 z-0" />

    <!-- Main Auth Shell (Glass) -->
    <div class="relative z-10 mx-auto w-full max-w-[440px] rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] p-8 sm:p-10 lg:p-12">
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
          WELCOME BACK
        </p>
        <h1 class="text-[28px] font-semibold tracking-tight text-[#171717]">
          เข้าสู่ระบบ
        </h1>
        <p class="mt-3 text-[14px] text-neutral-500">
          ยินดีต้อนรับกลับมาใช้งาน COOS
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="login">
        <div>
          <label class="mb-2 block text-[13px] font-semibold text-neutral-800">อีเมล</label>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="w-full rounded-[14px] border border-black/5 bg-white/60 px-4 py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-200 focus:border-black/20 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5"
          >
        </div>

        <div>
          <label class="mb-2 block text-[13px] font-semibold text-neutral-800">รหัสผ่าน</label>
          <input
            id="login-password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full rounded-[14px] border border-black/5 bg-white/60 px-4 py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-200 focus:border-black/20 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5"
          >
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="rounded-[12px] border border-red-100 bg-red-50/50 px-4 py-2.5 backdrop-blur-sm"
        >
          <p class="text-red-500 text-[13px] text-center font-medium">
            {{ error }}
          </p>
        </div>

        <!-- Button -->
        <button
          id="login-submit"
          type="submit"
          :disabled="loading"
          class="w-full flex h-[52px] items-center justify-center rounded-[14px] bg-[#111] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-black/10 active:scale-[0.98] disabled:opacity-50 mt-6 cursor-pointer"
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
      <p class="mt-8 text-center text-[13px] text-neutral-500">
        ยังไม่มีบัญชี?
        <NuxtLink
          to="/register"
          class="font-semibold text-neutral-900 transition-colors hover:text-black focus:outline-none focus:underline"
        >
          สมัครสมาชิก
        </NuxtLink>
      </p>
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

.login-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-color: #fafafa;
}
</style>
