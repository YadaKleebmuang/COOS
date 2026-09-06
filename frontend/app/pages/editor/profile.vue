<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})

const token = useCookie<string | null>('token')
const { apiFetch } = useApi()

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const profileImageFile = ref<File | null>(null)
const previewImageUrl = ref('')

const profileForm = reactive({
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userRole: '',
  userPhone: '',
  userAddress: '',
  userProfileImage: '',
  facebook: '',
  line: '',
  tel: ''
})

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await apiFetch('/users/me')
    const channels = data.userContactChannels || {}

    profileForm.userFirstName = data.userFirstName || ''
    profileForm.userLastName = data.userLastName || ''
    profileForm.userEmail = data.userEmail || ''
    profileForm.userRole = data.userRole || ''
    profileForm.userPhone = data.userPhone || ''
    profileForm.userAddress = data.userAddress || ''
    profileForm.userProfileImage = data.userProfileImage || ''
    profileForm.facebook = channels.facebook || ''
    profileForm.line = channels.line || ''
    profileForm.tel = channels.tel || ''
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error, 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้')
  } finally {
    loading.value = false
  }
}

const clearPreviewUrl = () => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น'
    target.value = ''
    return
  }

  errorMessage.value = ''
  clearPreviewUrl()
  profileImageFile.value = file
  previewImageUrl.value = URL.createObjectURL(file)
}

const saveProfile = async () => {
  if (saving.value) return

  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('userFirstName', profileForm.userFirstName)
    formData.append('userLastName', profileForm.userLastName)
    formData.append('userPhone', profileForm.userPhone)
    formData.append('userAddress', profileForm.userAddress)
    formData.append('userContactChannels', JSON.stringify({
      facebook: profileForm.facebook,
      line: profileForm.line,
      tel: profileForm.tel
    }))

    if (profileImageFile.value) {
      formData.append('profileImage', profileImageFile.value)
    }

    const config = useRuntimeConfig()
    const headers = new Headers()
    if (token.value) headers.set('Authorization', `Bearer ${token.value}`)

    const response = await fetch(`${config.public.apiBase}/users/me`, {
      method: 'PATCH',
      headers,
      body: formData
    })

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({}))
      throw new Error(errorResponse.message || 'บันทึกโปรไฟล์ไม่สำเร็จ')
    }

    const responseData = await response.json()
    if (responseData.user) {
      profileForm.userProfileImage = responseData.user.userProfileImage || ''
    }

    profileImageFile.value = null
    clearPreviewUrl()
    successMessage.value = 'บันทึกข้อมูลเรียบร้อยแล้ว'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

onMounted(fetchProfile)
onBeforeUnmount(clearPreviewUrl)

const breadcrumb = [
  { label: 'หน้าแรก', to: '/editor/dashboard' },
  { label: 'โปรไฟล์' }
]
</script>

<template>
  <div class="max-w-4xl mx-auto pb-12 space-y-6">
    <AdminBreadcrumb :items="breadcrumb" />

    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="px-6 py-5 border-b border-black/[0.06]">
        <h1 class="text-lg font-semibold text-[#171717] tracking-tight">
          โปรไฟล์
        </h1>
        <p class="mt-0.5 text-[13px] font-medium text-[#666666]">
          จัดการข้อมูลส่วนตัวของบัญชีนักออกแบบ
        </p>
      </div>

      <div
        v-if="loading"
        class="p-6 space-y-8 animate-pulse"
        aria-label="กำลังโหลดข้อมูลโปรไฟล์"
      >
        <div class="flex items-center gap-5">
          <div class="w-24 h-24 rounded-full bg-black/[0.06]" />
          <div class="flex-1 space-y-3">
            <div class="h-5 w-40 rounded bg-black/[0.06]" />
            <div class="h-4 w-56 max-w-full rounded bg-black/[0.06]" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="index in 4"
            :key="index"
            class="h-10 rounded-lg bg-black/[0.06]"
          />
        </div>
      </div>

      <div
        v-else-if="errorMessage"
        class="p-6"
      >
        <div class="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl flex items-start gap-3">
          <svg
            class="w-5 h-5 mt-0.5 text-[#C53030] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          /></svg>
          <div>
            <p class="text-[13px] font-medium text-[#C53030]">
              {{ errorMessage }}
            </p>
            <button
              type="button"
              class="mt-2 text-[12px] font-semibold text-[#171717] underline underline-offset-2"
              @click="fetchProfile"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>

      <form
        v-else
        @submit.prevent="saveProfile"
      >
        <div class="p-6 border-b border-black/[0.06]">
          <div class="flex flex-col sm:flex-row sm:items-center gap-5">
            <div class="relative flex-shrink-0 self-start">
              <div class="w-24 h-24 rounded-full overflow-hidden border border-black/[0.08] bg-[#F7F7F5] flex items-center justify-center">
                <img
                  v-if="previewImageUrl || profileForm.userProfileImage"
                  :src="previewImageUrl || profileForm.userProfileImage"
                  alt="รูปโปรไฟล์"
                  class="w-full h-full object-cover"
                >
                <span
                  v-else
                  class="text-2xl font-semibold text-[#666666]"
                >{{ profileForm.userFirstName.charAt(0).toUpperCase() || "E" }}</span>
              </div>
              <label
                class="absolute right-0 bottom-0 w-9 h-9 rounded-full bg-[#171717] text-white border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:bg-black transition-colors"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                /><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                /></svg>
                <input
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="handleImageChange"
                >
              </label>
            </div>

            <div class="min-w-0 w-full sm:w-[28rem] sm:max-w-[calc(100%-7.25rem)]">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-xl font-semibold text-[#171717] tracking-tight break-words">
                  {{ profileForm.userFirstName }} {{ profileForm.userLastName }}
                </h2>
                <span class="px-2.5 py-1 rounded-full bg-[#171717] text-white text-[11px] font-semibold">{{ profileForm.userRole === 'editor' ? 'นักออกแบบ' : profileForm.userRole }}</span>
              </div>
              <div class="mt-3 max-w-sm rounded-xl border border-black/[0.06] bg-[#F7F7F5] px-4 py-3">
                <p class="text-[11px] font-semibold text-[#888888]">
                  อีเมลบัญชี
                </p>
                <p class="mt-0.5 text-[13px] font-medium text-[#333333] break-all">
                  {{ profileForm.userEmail || "—" }}
                </p>
                <p class="mt-1 text-[11px] text-[#888888]">
                  ข้อมูลนี้ไม่สามารถแก้ไขได้
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-8">
          <section>
            <div class="mb-5">
              <h2 class="text-sm font-semibold text-[#171717]">
                ข้อมูลส่วนตัว
              </h2>
              <p class="mt-0.5 text-[12px] text-[#777777]">
                ข้อมูลที่ใช้สำหรับบัญชีและการติดต่อเกี่ยวกับงาน
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  for="userFirstName"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >ชื่อ</label>
                <input
                  id="userFirstName"
                  v-model="profileForm.userFirstName"
                  required
                  type="text"
                  autocomplete="given-name"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
              <div>
                <label
                  for="userLastName"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >นามสกุล</label>
                <input
                  id="userLastName"
                  v-model="profileForm.userLastName"
                  required
                  type="text"
                  autocomplete="family-name"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
              <div>
                <label
                  for="userPhone"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >เบอร์โทรศัพท์</label>
                <input
                  id="userPhone"
                  v-model="profileForm.userPhone"
                  type="tel"
                  autocomplete="tel"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
              <div class="sm:col-span-2">
                <label
                  for="userAddress"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >ที่อยู่ติดต่อ</label>
                <textarea
                  id="userAddress"
                  v-model="profileForm.userAddress"
                  rows="3"
                  class="w-full px-3 py-2.5 text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow resize-y"
                />
              </div>
            </div>
          </section>

          <section class="pt-6 border-t border-black/[0.06]">
            <div class="mb-5">
              <h2 class="text-sm font-semibold text-[#171717]">
                ช่องทางการติดต่อ
              </h2>
              <p class="mt-0.5 text-[12px] text-[#777777]">
                ช่องทางที่บันทึกไว้สำหรับประสานงานและส่งมอบผลงาน
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  for="facebook"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >Facebook</label>
                <input
                  id="facebook"
                  v-model="profileForm.facebook"
                  type="text"
                  placeholder="ชื่อ Facebook"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] placeholder:text-[#AAAAAA] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
              <div>
                <label
                  for="line"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >LINE ID</label>
                <input
                  id="line"
                  v-model="profileForm.line"
                  type="text"
                  placeholder="ไลน์ไอดี"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] placeholder:text-[#AAAAAA] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
              <div>
                <label
                  for="tel"
                  class="block text-[13px] font-semibold text-[#171717] mb-1.5"
                >เบอร์ติดต่อด่วน</label>
                <input
                  id="tel"
                  v-model="profileForm.tel"
                  type="tel"
                  class="w-full h-10 px-3 text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-lg focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-shadow"
                >
              </div>
            </div>
          </section>

          <div
            v-if="errorMessage"
            class="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl flex items-center gap-3"
            role="alert"
          >
            <svg
              class="w-5 h-5 text-[#C53030] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            /></svg>
            <p class="text-[13px] font-medium text-[#C53030]">
              {{ errorMessage }}
            </p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-5 border-t border-black/[0.06]">
            <p
              v-if="successMessage"
              class="text-[12px] font-semibold text-green-700 sm:mr-auto"
              role="status"
            >
              ✓ {{ successMessage }}
            </p>
            <button
              type="submit"
              :disabled="saving"
              class="self-start sm:self-auto px-5 py-2 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="saving"
                class="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              /><path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              /></svg>
              {{ saving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
