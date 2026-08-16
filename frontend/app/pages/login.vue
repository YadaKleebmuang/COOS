<script setup lang="ts">
import { ref, reactive } from 'vue'

const router = useRouter()
const route = useRoute()

definePageMeta({
  layout: 'auth',
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
  <div class="coos-panel p-7 sm:p-8">
    <!-- Header -->
    <div class="text-center mb-8">
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
    <form
      class="space-y-4"
      @submit.prevent="login"
    >
      <div>
        <label class="mb-1.5 block text-sm font-bold text-neutral-800">อีเมล</label>
        <input
          id="login-email"
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          autocomplete="email"
          class="coos-input"
        >
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-bold text-neutral-800">รหัสผ่าน</label>
        <input
          id="login-password"
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          class="coos-input"
        >
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
      >
        <p class="text-red-600 text-sm text-center">
          {{ error }}
        </p>
      </div>

      <!-- Button -->
      <button
        id="login-submit"
        type="submit"
        :disabled="loading"
        class="coos-button-dark mt-2 w-full"
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
    <p class="mt-6 text-center text-sm text-neutral-500">
      ยังไม่มีบัญชี?
      <NuxtLink
        to="/register"
        class="font-bold text-black hover:underline"
      >
        สมัครสมาชิก
      </NuxtLink>
    </p>
  </div>
</template>
