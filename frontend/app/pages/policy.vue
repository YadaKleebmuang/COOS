<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default'
})

const { apiFetch } = useApi()
type Policy = {
  policyId: number | string
  policyTitle: string
  policyContent: string
}

const policies = ref<Policy[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const data = await apiFetch<Policy[]>('/policies')
    policies.value = data || []
  } catch (error: unknown) {
    console.error('Failed to fetch policies:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="coos-page min-h-screen py-12 md:py-16">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <!-- Title Section -->
      <div class="mb-8 text-left">
        <p class="coos-kicker mb-3">
          COOS STUDIO
        </p>
        <h1 class="text-4xl font-black tracking-tight text-black md:text-5xl">
          นโยบายการใช้งาน
        </h1>
        <p class="mt-3 text-sm text-neutral-500">
          เงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
        </p>
      </div>

      <!-- Divider -->
      <hr class="mb-10 border-black/5">

      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-12"
      >
        <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4" />
        <p class="text-gray-400 text-sm">
          กำลังโหลดข้อมูล...
        </p>
      </div>

      <!-- Policy Cards List -->
      <div
        v-else
        class="space-y-6"
      >
        <div
          v-for="policy in policies"
          :key="policy.policyId"
          class="coos-card coos-card-hover p-6 sm:p-8"
        >
          <h3 class="mb-3 text-lg font-black text-black">
            {{ policy.policyTitle }}
          </h3>
          <p class="whitespace-pre-wrap text-sm font-normal leading-8 text-neutral-500">
            {{ policy.policyContent }}
          </p>
        </div>

        <div
          v-if="policies.length === 0"
          class="coos-panel py-12 text-center"
        >
          <p class="text-gray-500 text-sm">
            ไม่มีข้อมูลนโยบายในขณะนี้
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
