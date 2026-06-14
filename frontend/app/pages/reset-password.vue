<script setup lang="ts">
import { ref } from "vue";
import { authService } from "~/services/auth.service";

const router = useRouter();
const route = useRoute();

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
})

const token = ref((route.query.token as string) || "");
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);
const success = ref(false);

const submit = async () => {
  if (loading.value) return;
  error.value = "";

  if (!token.value) {
    error.value = "กรุณากรอก Reset Token";
    return;
  }
  if (!newPassword.value) {
    error.value = "กรุณากรอกรหัสผ่านใหม่";
    return;
  }
  if (newPassword.value.length < 6) {
    error.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  loading.value = true;
  try {
    await authService.resetPassword(token.value, newPassword.value);
    success.value = true;
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">รีเซ็ตรหัสผ่าน</h1>
        <p class="text-gray-400 text-sm mt-1">กรอกข้อมูลเพื่อตั้งรหัสผ่านใหม่</p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="space-y-4">
        <div class="border border-gray-200 rounded-xl p-5 bg-gray-50 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gray-900 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p class="text-gray-900 font-medium mb-1">เปลี่ยนรหัสผ่านสำเร็จ</p>
          <p class="text-gray-400 text-sm">คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว</p>
        </div>

        <NuxtLink
          to="/login"
          class="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-3 rounded-lg transition-colors"
        >
          ไปหน้าเข้าสู่ระบบ →
        </NuxtLink>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="submit" class="space-y-4">
        <!-- Token -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
          <textarea
            id="reset-token"
            v-model="token"
            rows="3"
            placeholder="วาง token ที่ได้จากหน้าลืมรหัสผ่าน"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition font-mono text-xs resize-none"
          />
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
          <input
            id="reset-password"
            v-model="newPassword"
            type="password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            autocomplete="new-password"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
          <input
            id="reset-confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            autocomplete="new-password"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p class="text-red-600 text-sm text-center">{{ error }}</p>
        </div>

        <!-- Button -->
        <button
          id="reset-submit"
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium py-3 rounded-lg transition-colors mt-2"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            กำลังรีเซ็ต...
          </span>
          <span v-else>รีเซ็ตรหัสผ่าน</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6">
        ยังไม่มี Token?
        <NuxtLink to="/forgot-password" class="text-gray-900 font-medium hover:underline">
          ขอ Token ใหม่
        </NuxtLink>
      </p>
    </div>
</template>
