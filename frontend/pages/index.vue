<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authService } from "~/app/services/auth.service";
import { useApi } from "~/composables/useApi";

const token = useCookie<string | null>("token");
const router = useRouter();

const { apiFetch } = useApi();

const users = ref<any[]>([]);
const loadingUsers = ref(false);
const usersError = ref("");

const logout = async () => {
  await authService.logout();
  router.push("/login");
};

const loadUsers = async () => {
  loadingUsers.value = true;
  usersError.value = "";

  try {
    const data = await apiFetch<any[]>("/users");
    users.value = data;
    console.log("users:", data);
  } catch (err: any) {
    usersError.value = err?.message || "Failed to load users";
  } finally {
    loadingUsers.value = false;
  }
};

onMounted(async () => {
  // ถ้าไม่มี token ให้ไปหน้า login
  if (!token.value) {
    router.push("/login");
    return;
  }

  await loadUsers();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Page container -->
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Home</h1>
          <p class="text-sm text-gray-500">User management dashboard</p>
        </div>

        <button
          @click="logout"
          class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Logout
        </button>
      </div>

      <!-- Users Card -->
      <div class="bg-white rounded-2xl shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-700">Users</h2>
          <span
            class="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
          >
            {{ users.length }} users
          </span>
        </div>

        <!-- Loading -->
        <p v-if="loadingUsers" class="text-gray-400 text-sm text-center py-6">
          Loading users...
        </p>

        <!-- Error -->
        <p v-if="usersError" class="text-red-500 text-sm text-center py-6">
          {{ usersError }}
        </p>

        <!-- Users grid -->
        <div
          v-if="!loadingUsers && !usersError"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="(user, index) in users"
            :key="user.userId ?? index"
            class="border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition bg-gray-50"
          >
            <!-- Info -->
            <div class="flex-1">
              <p class="font-medium text-gray-800">
                {{ user.userFirstName }} {{ user.userLastName }}
              </p>
              <p class="text-sm text-gray-500">
                {{ user.userEmail }}
              </p>
            </div>
          </div>

          <div
            v-if="users.length === 0"
            class="col-span-full text-gray-400 text-center py-6"
          >
            No users found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
