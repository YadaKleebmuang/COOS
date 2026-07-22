<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "default"
})

const { apiFetch } = useApi()
const policies = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const data = await apiFetch<any[]>("/policies")
    policies.value = data || []
  } catch (error) {
    console.error("Failed to fetch policies:", error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white min-h-screen py-16 md:py-24">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title Section -->
      <div class="text-left mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">นโยบายการใช้งาน</h1>
        <p class="text-sm text-gray-500">เงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว</p>
      </div>

      <!-- Divider -->
      <hr class="border-gray-150 mb-10" />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Policy Cards List -->
      <div v-else class="space-y-6">
        <div v-for="policy in policies" :key="policy.policyId" class="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow duration-300">
          <h3 class="text-base font-bold text-gray-900 mb-2">{{ policy.policyTitle }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed font-normal whitespace-pre-wrap">{{ policy.policyContent }}</p>
        </div>

        <div v-if="policies.length === 0" class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p class="text-gray-500 text-sm">ไม่มีข้อมูลนโยบายในขณะนี้</p>
        </div>
      </div>
    </div>
  </div>
</template>
