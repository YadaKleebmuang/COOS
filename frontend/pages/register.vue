<script setup lang="ts">
import { ref, reactive } from "vue";
import { authService } from "~/app/services/auth.service";

const router = useRouter();

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const error = ref<string>("");
const loading = ref<boolean>(false);

const register = async () => {
  if (loading.value) return;
  error.value = "";

  if (!form.firstName || !form.lastName || !form.email || !form.password) {
    error.value = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
    return;
  }
  if (form.password.length < 6) {
    error.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    return;
  }
  if (form.password !== form.confirmPassword) {
    error.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  loading.value = true;
  try {
    await authService.register(form);
    await router.push("/login");
  } catch (err: any) {
    error.value = err?.message || "สมัครสมาชิกไม่สำเร็จ";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">สร้างบัญชีใหม่</h1>
        <p class="text-gray-400 text-sm mt-1">กรอกข้อมูลเพื่อสมัครสมาชิก COOS</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="register" class="space-y-4">
        <!-- Name -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <input
              id="register-firstname"
              v-model="form.firstName"
              type="text"
              placeholder="ชื่อ"
              class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
            <input
              id="register-lastname"
              v-model="form.lastName"
              type="text"
              placeholder="นามสกุล"
              class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input
            id="register-email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร <span class="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
          <input
            id="register-phone"
            v-model="form.phone"
            type="tel"
            placeholder="08x-xxx-xxxx"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <input
            id="register-password"
            v-model="form.password"
            type="password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            autocomplete="new-password"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
          <input
            id="register-confirm-password"
            v-model="form.confirmPassword"
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
          id="register-submit"
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium py-3 rounded-lg transition-colors"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            กำลังสมัครสมาชิก...
          </span>
          <span v-else>สมัครสมาชิก</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6">
        มีบัญชีอยู่แล้ว?
        <NuxtLink to="/login" class="text-gray-900 font-medium hover:underline">
          เข้าสู่ระบบ
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
