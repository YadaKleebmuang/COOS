<script setup lang="ts">
import { ref, reactive } from "vue";
import { authService } from "~/app/services/auth.service";

const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const error = ref<string>("");
const loading = ref<boolean>(false);

// UI state
const login = async () => {
  if (loading.value) return;

  error.value = "";

  // ✅ validation เบื้องต้น
  if (!form.email || !form.password) {
    error.value = "Please enter email and password";
    return;
  }

  loading.value = true;

  try {
    await authService.login(form.email, form.password);
    await router.push("/");
  } catch (err: any) {
    error.value = err?.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-800 text-center mb-2">
        Welcome Back
      </h1>
      <p class="text-center text-gray-500 mb-6">Login to your account</p>

      <!-- Email -->
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        class="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
      />

      <!-- Password  -->
      <input
        v-model="form.password"
        @keyup.enter="login"
        type="password"
        placeholder="Password"
        class="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
      />

      <!-- Button -->
      <button
        @click="login"
        :disabled="loading"
        class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
      >
        {{ loading ? "Logging in..." : "Login" }}
      </button>

      <!-- Error -->
      <p v-if="error" class="text-red-500 text-sm text-center mt-4">
        {{ error }}
      </p>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Don’t have an account?
        <NuxtLink
          to="/register"
          class="text-indigo-600 font-medium hover:underline"
        >
          Register
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
