<script setup lang="ts">
import { ref } from "vue";


definePageMeta({
  layout: "auth",
  middleware: ["guest"],
})

const email = ref("");
const error = ref("");
const loading = ref(false);
const success = ref(false);
const resetToken = ref("");

const submit = async () => {
  if (loading.value) return;
  error.value = "";

  if (!email.value) {
    error.value = "กรุณากรอกอีเมล";
    return;
  }

  loading.value = true;
  try {
    const data = await useAuth().forgotPassword(email.value);
    resetToken.value = data.resetToken;
    success.value = true;
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดำเนินการได้";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">ลืมรหัสผ่าน</h1>
        <p class="text-gray-400 text-sm mt-1">ขอ Reset Token สำหรับการกู้คืนบัญชี</p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="space-y-4">
        <div class="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <div class="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <p class="text-sm font-medium text-gray-900">สร้าง Reset Token สำเร็จ</p>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg p-3">
            <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Reset Token</p>
            <p class="text-xs text-gray-600 break-all font-mono leading-relaxed">{{ resetToken }}</p>
          </div>
        </div>

        <NuxtLink
          to="/reset-password"
          class="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-3 rounded-lg transition-colors"
        >
          ไปหน้ารีเซ็ตรหัสผ่าน →
        </NuxtLink>

        <button
          @click="success = false; email = ''; resetToken = '';"
          class="w-full text-gray-400 hover:text-gray-900 text-sm py-2 transition-colors"
        >
          ขอ Token ใหม่
        </button>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="submit" class="space-y-4">
        <p class="text-sm text-gray-500 leading-relaxed mb-4 text-center">
          กรอกอีเมลของคุณเพื่อขอรับรหัส Reset Token สำหรับการรีเซ็ตรหัสผ่าน
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p class="text-red-600 text-sm text-center">{{ error }}</p>
        </div>

        <!-- Button -->
        <button
          id="forgot-submit"
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium py-3 rounded-lg transition-colors mt-2"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            กำลังดำเนินการ...
          </span>
          <span v-else>ขอ Reset Token</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6">
        จำรหัสผ่านได้แล้ว?
        <NuxtLink to="/login" class="text-gray-900 font-medium hover:underline">
          เข้าสู่ระบบ
        </NuxtLink>
      </p>
    </div>
</template>
