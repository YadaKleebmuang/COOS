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
  <section class="auth-form-panel" aria-labelledby="login-title">
    <div class="auth-form-header">
      <p class="auth-eyebrow">WELCOME BACK</p>
      <h1 id="login-title">เข้าสู่ระบบ</h1>
      <p class="auth-form-description">กลับมาสร้างสรรค์และติดตามผลงานของคุณ</p>
    </div>

    <form class="auth-form" :aria-busy="loading" @submit.prevent="login">
      <div class="auth-field">
        <label for="login-email">อีเมล</label>
        <input
          id="login-email"
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          autocomplete="email"
        >
      </div>
      <div class="auth-field">
        <label for="login-password">รหัสผ่าน</label>
        <input
          id="login-password"
          v-model="form.password"
          type="password"
          placeholder="กรอกรหัสผ่านของคุณ"
          autocomplete="current-password"
        >
      </div>

      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

      <button id="login-submit" type="submit" :disabled="loading" class="auth-submit">
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <svg aria-hidden="true" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังเข้าสู่ระบบ...
        </span>
        <span v-else>เข้าสู่ระบบ</span>
      </button>
    </form>

    <p class="auth-switch">
      ยังไม่มีบัญชี?
      <NuxtLink to="/register">สมัครสมาชิก</NuxtLink>
    </p>
  </section>
</template>
