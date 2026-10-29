<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'

const router = useRouter()

definePageMeta({
  layout: 'auth',
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
  <section class="auth-form-panel" aria-labelledby="register-title">
    <div class="auth-form-header">
      <p class="auth-eyebrow">JOIN COOS</p>
      <h1 id="register-title">สร้างบัญชีใหม่</h1>
      <p class="auth-form-description">เริ่มต้นไอเดียใหม่ พร้อมจัดการงานของคุณในที่เดียว</p>
    </div>

    <form class="auth-form" :aria-busy="loading" @submit.prevent="register">
      <div class="auth-name-fields">
        <div class="auth-field">
          <label for="register-firstname">ชื่อ</label>
          <input
            id="register-firstname"
            v-model="form.firstName"
            type="text"
            placeholder="ชื่อของคุณ"
            autocomplete="given-name"
          >
        </div>
        <div class="auth-field">
          <label for="register-lastname">นามสกุล</label>
          <input
            id="register-lastname"
            v-model="form.lastName"
            type="text"
            placeholder="นามสกุลของคุณ"
            autocomplete="family-name"
          >
        </div>
      </div>
      <div class="auth-field">
        <label for="register-email">อีเมล</label>
        <input
          id="register-email"
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          autocomplete="email"
        >
      </div>
      <div class="auth-field">
        <label for="register-password">รหัสผ่าน</label>
        <input
          id="register-password"
          v-model="form.password"
          type="password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          autocomplete="new-password"
        >
      </div>
      <div class="auth-field">
        <label for="register-confirm-password">ยืนยันรหัสผ่าน</label>
        <input
          id="register-confirm-password"
          v-model="form.confirmPassword"
          type="password"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          autocomplete="new-password"
        >
      </div>

      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

      <button id="register-submit" type="submit" :disabled="loading" class="auth-submit">
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <svg aria-hidden="true" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังสมัครสมาชิก...
        </span>
        <span v-else>สมัครสมาชิก</span>
      </button>
    </form>

    <p class="auth-switch">
      มีบัญชีอยู่แล้ว?
      <NuxtLink to="/login">เข้าสู่ระบบ</NuxtLink>
    </p>
  </section>
</template>
