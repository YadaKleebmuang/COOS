<script setup lang="ts">
import { ref, reactive } from "vue";


const router = useRouter();
const route = useRoute();

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
})

const form = reactive({
  email: "",
  password: "",
});

const error = ref<string>("");
const loading = ref<boolean>(false);

const auth = useAuth();

const login = async () => {
  if (loading.value) return;
  error.value = "";

  if (!form.email || !form.password) {
    error.value = "กรุณากรอกอีเมลและรหัสผ่าน";
    return;
  }

  loading.value = true;
  try {
    const data = await auth.login(form.email, form.password);
    const userRole = data?.user?.userRole || "customer";
    const redirect = route.query.redirect as string;

    if (redirect) {
      await router.push(redirect);
    } else {
      if (userRole === "admin") {
        await router.push("/admin/dashboard");
      } else if (userRole === "editor") {
        await router.push("/editor/dashboard");
      } else {
        await router.push("/customer/dashboard");
      }
    }
  } catch (err: any) {
    error.value = err?.message || "เข้าสู่ระบบไม่สำเร็จ";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
        <p class="text-gray-400 text-sm mt-1">ยินดีต้อนรับกลับมาใช้งาน COOS</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <input
            id="login-password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        </div>

        <!-- Forgot Password -->
        <div class="text-right">
          <NuxtLink to="/forgot-password" class="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            ลืมรหัสผ่าน?
          </NuxtLink>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p class="text-red-600 text-sm text-center">{{ error }}</p>
        </div>

        <!-- Button -->
        <button
          id="login-submit"
          type="submit"
          :disabled="loading"
          class="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium py-3 rounded-lg transition-colors mt-2"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            กำลังเข้าสู่ระบบ...
          </span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6">
        ยังไม่มีบัญชี?
        <NuxtLink to="/register" class="text-gray-900 font-medium hover:underline">
          สมัครสมาชิก
        </NuxtLink>
      </p>
    </div>
</template>
