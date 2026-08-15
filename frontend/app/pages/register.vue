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
  <div class="coos-panel p-7 sm:p-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <p class="coos-kicker mb-3">
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
    <form
      class="space-y-4"
      @submit.prevent="register"
    >
      <!-- Name -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-bold text-neutral-800">ชื่อ</label>
          <input
            id="register-firstname"
            v-model="form.firstName"
            type="text"
            placeholder="ชื่อ"
            class="coos-input"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-bold text-neutral-800">นามสกุล</label>
          <input
            id="register-lastname"
            v-model="form.lastName"
            type="text"
            placeholder="นามสกุล"
            class="coos-input"
          >
        </div>
      </div>

      <!-- Email -->
      <div>
        <label class="mb-1.5 block text-sm font-bold text-neutral-800">อีเมล</label>
        <input
          id="register-email"
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          autocomplete="email"
          class="coos-input"
        >
      </div>

      <!-- Password -->
      <div>
        <label class="mb-1.5 block text-sm font-bold text-neutral-800">รหัสผ่าน</label>
        <input
          id="register-password"
          v-model="form.password"
          type="password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          autocomplete="new-password"
          class="coos-input"
        >
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="mb-1.5 block text-sm font-bold text-neutral-800">ยืนยันรหัสผ่าน</label>
        <input
          id="register-confirm-password"
          v-model="form.confirmPassword"
          type="password"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          autocomplete="new-password"
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
        id="register-submit"
        type="submit"
        :disabled="loading"
        class="coos-button-dark w-full"
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
</template>
