<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"]
})

const token = useCookie<string | null>("token")
const { apiFetch } = useApi()

const loading = ref(true)
const saving = ref(false)
const successMessage = ref("")
const errorMessage = ref("")

const profileForm = reactive({
  userFirstName: "",
  userLastName: "",
  userEmail: "", // Display only
  userPhone: "",
  userAddress: "",
  userProfileImage: "",
  facebook: "",
  line: "",
  tel: ""
})

const profileImageFile = ref<File | null>(null)
const previewImageUrl = ref("")

// Fetch user profile
const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const data = await apiFetch("/users/me")
    profileForm.userFirstName = data.userFirstName || ""
    profileForm.userLastName = data.userLastName || ""
    profileForm.userEmail = data.userEmail || ""
    profileForm.userPhone = data.userPhone || ""
    profileForm.userAddress = data.userAddress || ""
    profileForm.userProfileImage = data.userProfileImage || ""
    
    // Parse contact channels
    const channels = data.userContactChannels || {}
    profileForm.facebook = channels.facebook || ""
    profileForm.line = channels.line || ""
    profileForm.tel = channels.tel || ""
  } catch (err: any) {
    errorMessage.value = err?.message || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"
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
    if (!file.type.startsWith("image/")) {
      errorMessage.value = "กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น"
      return
    }
    profileImageFile.value = file
    previewImageUrl.value = URL.createObjectURL(file)
  }
}

const saveProfile = async () => {
  saving.value = true
  successMessage.value = ""
  errorMessage.value = ""
  
  try {
    const formData = new FormData()
    formData.append("userFirstName", profileForm.userFirstName)
    formData.append("userLastName", profileForm.userLastName)
    formData.append("userPhone", profileForm.userPhone)
    formData.append("userAddress", profileForm.userAddress)
    
    // Append contact channels as JSON string (backend controller parses it)
    const channels = {
      facebook: profileForm.facebook,
      line: profileForm.line,
      tel: profileForm.tel
    }
    formData.append("userContactChannels", JSON.stringify(channels))
    
    if (profileImageFile.value) {
      formData.append("profileImage", profileImageFile.value)
    }

    const config = useRuntimeConfig()
    // Manual Fetch with FormData due to upload boundary handling
    const headers = new Headers()
    if (token.value) {
      headers.set("Authorization", "Bearer " + token.value)
    }
    
    const response = await fetch(`${config.public.apiBase}/users/me`, {
      method: "PATCH",
      headers,
      body: formData
    })
    
    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}))
      throw new Error(errRes.message || "บันทึกโปรไฟล์ไม่สำเร็จ")
    }

    const resData = await response.json()
    successMessage.value = "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!"
    
    // Refresh states and navbar values
    if (resData.user) {
      profileForm.userProfileImage = resData.user.userProfileImage || ""
    }
    profileImageFile.value = null
    previewImageUrl.value = ""
    
    // Reload window helper to refresh layout navbar states
    setTimeout(() => {
      window.location.reload()
    }, 1200)
    
  } catch (err: any) {
    errorMessage.value = err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">แก้ไขข้อมูลโปรไฟล์</h1>
      <p class="text-gray-500 text-sm mt-1">อัปเดตข้อมูลส่วนตัว ช่องทางการติดต่อ และรูปโปรไฟล์ของคุณ</p>
    </div>

    <div v-if="loading" class="bg-white rounded-2xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-400 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
    </div>

    <form v-else @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left Column: Avatar & Quick Info -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">รูปโปรไฟล์</h3>
        
        <div class="relative group">
          <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 shadow bg-gray-50 flex items-center justify-center">
            <img v-if="previewImageUrl" :src="previewImageUrl" class="w-full h-full object-cover" />
            <img v-else-if="profileForm.userProfileImage" :src="profileForm.userProfileImage.startsWith('/') ? profileForm.userProfileImage : profileForm.userProfileImage" class="w-full h-full object-cover" />
            <div v-else class="text-4xl text-gray-400 font-black">
              {{ profileForm.userFirstName[0]?.toUpperCase() }}
            </div>
          </div>
          <label class="absolute bottom-0 right-0 w-9 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition group-hover:scale-105">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <input type="file" accept="image/*" class="hidden" @change="handleImageChange" />
          </label>
        </div>
        
        <div>
          <p class="font-bold text-gray-900 text-lg">{{ profileForm.userFirstName }} {{ profileForm.userLastName }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ profileForm.userEmail }}</p>
        </div>
      </div>

      <!-- Right Column: Profile Fields Form (Col Span 2) -->
      <div class="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 class="text-base font-bold text-gray-900 border-b border-gray-50 pb-3">ข้อมูลส่วนตัวทั่วไป</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="userFirstName" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">ชื่อจริง</label>
            <input id="userFirstName" v-model="profileForm.userFirstName" required type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
          <div>
            <label for="userLastName" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">นามสกุล</label>
            <input id="userLastName" v-model="profileForm.userLastName" required type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
        </div>

        <div>
          <label for="userEmail" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
          <input id="userEmail" :value="profileForm.userEmail" disabled type="email" class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="userPhone" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">เบอร์โทรศัพท์</label>
            <input id="userPhone" v-model="profileForm.userPhone" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
          <div>
            <label for="tel" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">เบอร์ติดต่อช่องทางด่วน (Tel)</label>
            <input id="tel" v-model="profileForm.tel" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
        </div>

        <div>
          <label for="userAddress" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">ที่อยู่จัดส่ง / ที่อยู่ติดต่อ</label>
          <textarea id="userAddress" v-model="profileForm.userAddress" rows="2" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition resize-none" />
        </div>

        <h3 class="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 pt-4">ช่องทางโซเชียลสำหรับการส่งงาน</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="facebook" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Facebook Profile</label>
            <input id="facebook" v-model="profileForm.facebook" type="text" placeholder="ชื่อ Facebook" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
          <div>
            <label for="line" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Line ID</label>
            <input id="line" v-model="profileForm.line" type="text" placeholder="ไลน์ไอดี" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 transition" />
          </div>
        </div>

        <!-- Success/Error alert box -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p class="text-green-600 text-xs font-bold text-center">✓ {{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p class="text-red-600 text-xs font-bold text-center">⚠️ {{ errorMessage }}</p>
        </div>

        <div class="flex justify-end pt-4">
          <button :disabled="saving" type="submit" class="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition duration-200 shadow flex items-center gap-2">
            <span v-if="saving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
