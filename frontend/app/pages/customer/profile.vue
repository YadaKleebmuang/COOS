<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'customer',
  middleware: ['auth', 'customer']
})

const token = useCookie<string | null>('token')
const { apiFetch } = useApi()

interface ContactChannels {
  facebook?: string
  line?: string
  tel?: string
}

interface ProfileResponse {
  userId?: number
  userFirstName?: string
  userLastName?: string
  userEmail?: string
  userPhone?: string
  userAddress?: string
  userProfileImage?: string
  userContactChannels?: ContactChannels
}

interface ProfileSaveResponse {
  user?: {
    userProfileImage?: string
  }
}

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const profileForm = reactive({
  userFirstName: '',
  userLastName: '',
  userEmail: '', // Display only
  userPhone: '',
  userAddress: '',
  userProfileImage: '',
  facebook: '',
  line: '',
  tel: ''
})

const profileImageFile = ref<File | null>(null)
const previewImageUrl = ref('')
const profileUserId = ref<number | null>(null)
const { protectedAssetUrl, refreshProtectedAsset, syncProtectedAssets } = useProtectedAsset()
const profileEndpoint = (userId: number) => `/media/users/${userId}/profile`

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

// Fetch user profile
const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await apiFetch<ProfileResponse>('/users/me')
    profileUserId.value = data.userId ?? null
    profileForm.userFirstName = data.userFirstName || ''
    profileForm.userLastName = data.userLastName || ''
    profileForm.userEmail = data.userEmail || ''
    profileForm.userPhone = data.userPhone || ''
    profileForm.userAddress = data.userAddress || ''
    profileForm.userProfileImage = data.userProfileImage || ''
    await syncProtectedAssets(data.userProfileImage && data.userId != null ? [profileEndpoint(data.userId)] : [])

    // Parse contact channels
    const channels = data.userContactChannels || {}
    profileForm.facebook = channels.facebook || ''
    profileForm.line = channels.line || ''
    profileForm.tel = channels.tel || ''
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น'
      return
    }
    profileImageFile.value = file
    if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = URL.createObjectURL(file)
  }
}

const saveProfile = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('userFirstName', profileForm.userFirstName)
    formData.append('userLastName', profileForm.userLastName)
    formData.append('userPhone', profileForm.userPhone)
    formData.append('userAddress', profileForm.userAddress)

    // Append contact channels as JSON string (backend controller parses it)
    const channels = {
      facebook: profileForm.facebook,
      line: profileForm.line,
      tel: profileForm.tel
    }
    formData.append('userContactChannels', JSON.stringify(channels))

    if (profileImageFile.value) {
      formData.append('profileImage', profileImageFile.value)
    }

    const config = useRuntimeConfig()
    // Manual Fetch with FormData due to upload boundary handling
    const headers = new Headers()
    if (token.value) {
      headers.set('Authorization', 'Bearer ' + token.value)
    }

    const response = await fetch(`${config.public.apiBase}/users/me`, {
      method: 'PATCH',
      headers,
      body: formData
    })

    if (!response.ok) {
      const errRes = await response.json().catch((): { message?: string } => ({}))
      throw new Error(errRes.message || 'บันทึกโปรไฟล์ไม่สำเร็จ')
    }

    const resData = await response.json() as ProfileSaveResponse
    successMessage.value = 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!'

    // Refresh states and navbar values
    if (resData.user) {
      profileForm.userProfileImage = resData.user.userProfileImage || ''
    }
    if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value)
    profileImageFile.value = null
    previewImageUrl.value = ''
    if (profileForm.userProfileImage && profileUserId.value != null) {
      await refreshProtectedAsset(profileEndpoint(profileUserId.value))
    }

    // Reload window helper to refresh layout navbar states
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (previewImageUrl.value) URL.revokeObjectURL(previewImageUrl.value)
})

// ── Change Password State ──
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordSaving = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    passwordError.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  if (passwordForm.newPassword.length < 8) {
    passwordError.value = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }

  passwordSaving.value = true
  try {
    await apiFetch('/users/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
    })
    passwordSuccess.value = 'เปลี่ยนรหัสผ่านสำเร็จ'
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err: unknown) {
    passwordError.value = getErrorMessage(err, 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
  } finally {
    passwordSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1280px] py-6 sm:py-8 lg:py-10">
    <div class="dashboard-grid pointer-events-none fixed inset-0 z-0" />
    <div class="relative z-10">
      <!-- Header -->
      <div class="mb-6 text-center">
        <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
          CUSTOMER PROFILE
        </p>
        <h1 class="text-3xl font-semibold leading-tight text-[#171717]">
          แก้ไขข้อมูลโปรไฟล์
        </h1>
        <p class="mt-1.5 text-[14px] font-medium text-[#666666]">
          อัปเดตข้อมูลส่วนตัว ช่องทางการติดต่อ และรูปโปรไฟล์ของคุณ
        </p>
      </div>

    <div
      v-if="loading"
      class="mt-6 rounded-[24px] border border-black/5 bg-white/60 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md"
    >
      <div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#F3F3F1] border-t-[#171717]" />
      <p class="text-sm font-medium text-[#666666]">
        กำลังโหลดข้อมูลโปรไฟล์...
      </p>
    </div>

    <div
      v-else
      class="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"
    >
      <aside class="self-start rounded-[24px] border border-black/5 bg-white/60 p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md">
        <p class="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-[#929292]">
          รูปโปรไฟล์
        </p>

        <div class="mx-auto w-fit">
          <div class="relative">
            <div class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white/60 shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-md">
              <img
                v-if="previewImageUrl"
                :src="previewImageUrl"
                alt="ตัวอย่างรูปโปรไฟล์ใหม่"
                class="h-full w-full object-cover"
              >
              <img
                v-else-if="profileForm.userProfileImage && profileUserId != null"
                :src="protectedAssetUrl(profileEndpoint(profileUserId))"
                alt="รูปโปรไฟล์"
                class="h-full w-full object-cover"
              >
              <div
                v-else
                class="text-[40px] font-semibold uppercase text-[#929292]"
              >
                {{ profileForm.userFirstName[0] || 'C' }}
              </div>
            </div>
            <label class="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#171717] text-white shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition hover:bg-[#292929] focus-within:ring-2 focus-within:ring-[#756CE8]/25">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M3 9a2 2 0 012-2h1.2l1.1-1.7A2 2 0 019 4.4h6a2 2 0 011.7.9L17.8 7H19a2 2 0 012 2v8.5a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              /><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M15.5 13a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
              /></svg>
              <input
                type="file"
                accept="image/*"
                class="sr-only"
                @change="handleImageChange"
              >
            </label>
          </div>
        </div>

        <div class="mt-5">
          <p class="break-words text-lg font-semibold leading-[1.45] text-[#171717]">
            {{ profileForm.userFirstName || 'Customer' }} {{ profileForm.userLastName }}
          </p>
          <p
            class="mt-1 truncate text-sm leading-[1.5] text-[#666666]"
            :title="profileForm.userEmail"
          >
            {{ profileForm.userEmail || '-' }}
          </p>
        </div>

        <label class="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-black/[0.12] hover:bg-[#F3F3F1] focus-within:ring-2 focus-within:ring-[#756CE8]/25">
          เปลี่ยนรูปโปรไฟล์
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handleImageChange"
          >
        </label>
      </aside>

      <div class="space-y-6">
        <form
          class="rounded-[24px] border border-black/5 bg-white/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md"
          @submit.prevent="saveProfile"
        >
          <div class="mb-5 border-b border-black/[0.06] pb-4">
            <h2 class="text-base font-semibold leading-[1.45] text-[#171717]">
              ข้อมูลส่วนตัวทั่วไป
            </h2>
            <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
              ข้อมูลนี้ใช้สำหรับการติดต่อและการประสานงานคำสั่งซื้อ
            </p>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                for="userFirstName"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >ชื่อจริง</label>
              <input
                id="userFirstName"
                v-model="profileForm.userFirstName"
                required
                type="text"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>
            <div>
              <label
                for="userLastName"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >นามสกุล</label>
              <input
                id="userLastName"
                v-model="profileForm.userLastName"
                required
                type="text"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>

            <div class="sm:col-span-2">
              <label
                for="userEmail"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >อีเมล</label>
              <input
                id="userEmail"
                :value="profileForm.userEmail"
                disabled
                type="email"
                class="h-11 w-full cursor-not-allowed rounded-xl border border-black/5 bg-black/[0.03] px-4 text-[14px] font-medium text-[#666666] outline-none disabled:opacity-100"
              >
              <p class="mt-2 text-xs leading-[1.5] text-[#929292]">
                อีเมลเป็นข้อมูลสำหรับเข้าสู่ระบบ จึงไม่สามารถแก้ไขได้จากหน้านี้
              </p>
            </div>

            <div>
              <label
                for="userPhone"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >เบอร์โทรศัพท์</label>
              <input
                id="userPhone"
                v-model="profileForm.userPhone"
                type="text"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>
            <div>
              <label
                for="tel"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >เบอร์ติดต่อช่องทางด่วน</label>
              <input
                id="tel"
                v-model="profileForm.tel"
                type="text"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>

            <div class="sm:col-span-2">
              <label
                for="userAddress"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >ที่อยู่จัดส่ง / ที่อยู่ติดต่อ</label>
              <textarea
                id="userAddress"
                v-model="profileForm.userAddress"
                rows="3"
                class="w-full resize-none rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-[14px] font-medium leading-[1.6] text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              />
            </div>
          </div>

          <div class="mt-6 border-t border-black/[0.06] pt-5">
            <h3 class="text-base font-semibold leading-[1.45] text-[#171717]">
              ช่องทางโซเชียลสำหรับการส่งงาน
            </h3>
            <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  for="facebook"
                  class="mb-2 block text-sm font-semibold text-[#171717]"
                >Facebook</label>
                <input
                  id="facebook"
                  v-model="profileForm.facebook"
                  type="text"
                  placeholder="ชื่อ Facebook"
                  class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
                >
              </div>
              <div>
                <label
                  for="line"
                  class="mb-2 block text-sm font-semibold text-[#171717]"
                >LINE ID</label>
                <input
                  id="line"
                  v-model="profileForm.line"
                  type="text"
                  placeholder="ไลน์ไอดี"
                  class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
                >
              </div>
            </div>
          </div>

          <div
            v-if="successMessage"
            class="mt-5 rounded-xl border border-[#EDF8F1] bg-[#EDF8F1] px-4 py-3"
          >
            <p class="text-sm font-medium text-[#267A48]">
              {{ successMessage }}
            </p>
          </div>
          <div
            v-if="errorMessage"
            class="mt-5 rounded-xl border border-[#FDEEEE] bg-[#FDEEEE] px-4 py-3"
          >
            <p class="text-sm font-medium text-[#B93B3B]">
              {{ errorMessage }}
            </p>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              :disabled="saving"
              type="submit"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-md transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="saving"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              {{ saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
            </button>
          </div>
        </form>

        <form
          class="rounded-[24px] border border-black/5 bg-white/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md"
          @submit.prevent="changePassword"
        >
          <div class="mb-5 border-b border-black/[0.06] pb-4">
            <h2 class="text-base font-semibold leading-[1.45] text-[#171717]">
              เปลี่ยนรหัสผ่าน
            </h2>
            <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
              ใช้รหัสผ่านเดิมเพื่อยืนยันตัวตนก่อนตั้งรหัสผ่านใหม่
            </p>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label
                for="oldPassword"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >รหัสผ่านเดิม</label>
              <input
                id="oldPassword"
                v-model="passwordForm.oldPassword"
                required
                type="password"
                placeholder="รหัสผ่านเดิม"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>
            <div>
              <label
                for="newPassword"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >รหัสผ่านใหม่</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                required
                type="password"
                placeholder="รหัสผ่านใหม่"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>
            <div>
              <label
                for="confirmPassword"
                class="mb-2 block text-sm font-semibold text-[#171717]"
              >ยืนยันรหัสผ่านใหม่</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                required
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                class="h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.15] focus:border-[#171717]/30 focus:bg-white focus:ring-2 focus:ring-[#171717]/10"
              >
            </div>
          </div>

          <div
            v-if="passwordSuccess"
            class="mt-5 rounded-xl border border-[#EDF8F1] bg-[#EDF8F1] px-4 py-3"
          >
            <p class="text-sm font-medium text-[#267A48]">
              {{ passwordSuccess }}
            </p>
          </div>
          <div
            v-if="passwordError"
            class="mt-5 rounded-xl border border-[#FDEEEE] bg-[#FDEEEE] px-4 py-3"
          >
            <p class="text-sm font-medium text-[#B93B3B]">
              {{ passwordError }}
            </p>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              :disabled="passwordSaving"
              type="submit"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-md transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="passwordSaving"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              {{ passwordSaving ? 'กำลังบันทึก...' : 'อัปเดตรหัสผ่าน' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(20, 20, 20, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(20, 20, 20, 0.05) 1px, transparent 1px);
}
</style>
