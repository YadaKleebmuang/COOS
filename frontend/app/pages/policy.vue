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
  <div class="coos-page min-h-screen relative overflow-hidden">
    <!-- Ambient Canvas background image -->
    <div class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat policy-bg" />

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col space-y-8">
      <!-- Title Section -->
      <section class="px-4 sm:px-5 lg:px-8 pt-10 md:pt-14">
        <div class="mx-auto w-full max-w-[1280px]">
          <div class="text-left">
            <p class="coos-kicker mb-3">
              COOS POLICY
            </p>
            <h1 class="text-4xl font-black tracking-tight text-black md:text-5xl">
              นโยบายการใช้งาน
            </h1>
            <p class="mt-3 text-sm text-neutral-500">
              เงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
            </p>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <section class="px-4 sm:px-5 lg:px-8">
        <div class="mx-auto w-full max-w-[1280px]">
          <hr class="border-white/20">
        </div>
      </section>

      <!-- Loading State -->
      <section
        v-if="loading"
        class="px-4 py-12 sm:px-5 lg:px-8"
      >
        <div class="mx-auto w-full max-w-[960px] text-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-white/30 border-t-neutral-900 rounded-full mx-auto mb-4" />
          <p class="text-neutral-400 text-sm">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </section>

      <!-- Policy Cards List -->
      <section
        v-else
        class="px-4 pb-16 sm:px-5 lg:px-8"
      >
        <div class="mx-auto w-full max-w-[960px] space-y-6">
          <div
            v-for="policy in policies"
            :key="policy.policyId"
            class="coos-card p-6 sm:p-8"
          >
            <h3 class="mb-3 text-lg font-black text-black">
              {{ policy.policyTitle }}
            </h3>
            <p class="whitespace-pre-wrap text-sm font-normal leading-8 text-neutral-700">
              {{ policy.policyContent }}
            </p>
          </div>

          <div
            v-if="policies.length === 0"
            class="coos-panel py-12 text-center"
          >
            <p class="text-neutral-500 text-sm">
              ไม่มีข้อมูลนโยบายในขณะนี้
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.policy-bg {
  background-image: url('~/assets/images/public/coos-public.png');
}

/* Policy Content Panel (Readable Glass - stronger opacity for high text contrast) */
.coos-card {
  background-color: rgba(255, 255, 255, 0.82) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.65) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.03) !important;
  border-radius: 24px !important;
}

/* Empty State Panel (Medium Glass) */
.coos-panel {
  background-color: rgba(255, 255, 255, 0.68) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.03) !important;
  border-radius: 24px !important;
}
</style>
