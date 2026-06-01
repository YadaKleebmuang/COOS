<script setup lang="ts">
import { ref, reactive } from "vue";
import { authService } from "~/app/services/auth.service";

const router = useRouter();

const form = reactive({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
});

// UI state
const error = ref<string>("");
const success = ref<string>("");
const loading = ref<boolean>(false);

const register = async () => {
  // กันกดซ้ำ
  if (loading.value) return;

  error.value = "";
  success.value = "";

  // validation เบื้องต้น
  if (!form.email || !form.password || !form.firstName || !form.lastName) {
    error.value = "Please fill all fields";
    return;
  }

  loading.value = true;

  try {
    await authService.register(form);
    await router.push("/login");
  } catch (err: any) {
    // fetch / useApi error handling
    error.value = err?.message || "Register failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-800 text-center mb-2">
        Create Account
      </h1>
      <p class="text-center text-gray-500 mb-6">Sign up to get started</p>

      <!-- First / Last name -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <input
          v-model="form.firstName"
          type="text"
          placeholder="First name"
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
        />
        <input
          v-model="form.lastName"
          type="text"
          placeholder="Last name"
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
        />
      </div>

      <!-- Email -->
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        class="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
      />

      <!-- Password -->
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        class="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
      />

      <!-- Button -->
      <button
        @click="register"
        :disabled="loading"
        class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
      >
        {{ loading ? "Registering..." : "Register" }}
      </button>

      <!-- Error / Success -->
      <p v-if="error" class="text-red-500 text-sm text-center mt-4">
        {{ error }}
      </p>
      <p v-if="success" class="text-green-600 text-sm text-center mt-4">
        {{ success }}
      </p>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <NuxtLink
          to="/login"
          class="text-indigo-600 font-medium hover:underline"
        >
          Login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
