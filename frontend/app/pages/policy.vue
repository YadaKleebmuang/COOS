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
    <!-- Progressive Top Blur Layer (Fixed to viewport) -->
    <Teleport to="body">
      <div class="fixed top-0 left-0 right-0 h-[100px] sm:h-[120px] lg:h-[140px] z-[150] pointer-events-none progressive-blur-layer" />
    </Teleport>

    <!-- Subtle Grid background -->
    <div class="policy-grid pointer-events-none fixed inset-0 z-0" />

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col space-y-8 py-10 md:py-14">
      <!-- Title Section -->
      <section class="px-4 sm:px-5 lg:px-8 pt-6 sm:pt-10">
        <div class="mx-auto w-full max-w-[1280px] text-center flex flex-col items-center">
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono">
            COOS POLICY
          </p>
          <h1 class="text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[#171717]">
            นโยบายการใช้งาน
          </h1>
          <p class="mt-4 sm:mt-5 max-w-[500px] mx-auto text-[13px] sm:text-[15px] leading-relaxed text-neutral-500">
            เงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
          </p>
        </div>
      </section>

      <!-- Divider -->
      <section class="px-4 sm:px-5 lg:px-8 hidden">
        <div class="mx-auto w-full max-w-[1280px]">
          <hr class="border-black/5">
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
        <div class="mx-auto w-full max-w-[840px] space-y-4">
          <div
            v-for="policy in policies"
            :key="policy.policyId"
            class="relative bg-white/60 backdrop-blur-md rounded-[20px] p-6 lg:p-7 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)]"
          >
            <h3 class="mb-2.5 text-[17px] font-semibold tracking-tight text-neutral-900">
              {{ policy.policyTitle }}
            </h3>
            <p class="whitespace-pre-wrap text-[14px] leading-[2.2] text-neutral-600">
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
/* ========================================================
   PROGRESSIVE TOP BLUR
   ======================================================== */
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
}
 
.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}

.policy-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-color: #fafafa;
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
