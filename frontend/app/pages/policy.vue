<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "default"
})

type PolicyType = "privacy" | "terms" | "refund"
interface Policy {
  policyId: number
  policyTitle: string
  policyContent: string
  policyType: PolicyType
  policyIsActive: 0 | 1
}

const { apiFetch } = useApi()
const policies = ref<Policy[]>([])
const loading = ref(true)
const activeTab = ref<PolicyType>("privacy")

const tabs: { key: PolicyType; label: string }[] = [
  { key: "privacy", label: "นโยบายความเป็นส่วนตัว" },
  { key: "terms", label: "เงื่อนไขการใช้งาน" },
  { key: "refund", label: "นโยบายการคืนเงิน" }
]

const loadData = async () => {
  try {
    const data = await apiFetch<Policy[]>("/policies")
    policies.value = data.filter(p => p.policyIsActive === 1)
  } catch (err) {
    console.error("Failed to load policies", err)
  } finally {
    loading.value = false
  }
}

const activePolicy = computed(() => {
  return policies.value.find(p => p.policyType === activeTab.value)
})

onMounted(() => loadData())
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-24">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">นโยบายของเรา</h1>
        <p class="text-lg text-gray-500">กรุณาอ่านและทำความเข้าใจนโยบายและเงื่อนไขการใช้บริการของ COOS Studio</p>
      </div>

      <div class="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        <!-- Sidebar Navigation -->
        <div class="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 shrink-0">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">หัวข้อนโยบาย</h3>
          <nav class="flex flex-col gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="text-left px-4 py-3 rounded-xl font-bold transition-all duration-200"
              :class="[
                activeTab === tab.key 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-8 md:p-12">
          <div v-if="loading" class="flex justify-center items-center h-full">
            <div class="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
          </div>
          <div v-else-if="activePolicy" class="prose prose-slate max-w-none">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
              {{ activePolicy.policyTitle || tabs.find(t => t.key === activeTab)?.label }}
            </h2>
            <div class="text-gray-600 leading-relaxed whitespace-pre-wrap">{{ activePolicy.policyContent }}</div>
          </div>
          <div v-else class="flex flex-col items-center justify-center h-full text-center">
            <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-gray-400 font-medium">ยังไม่มีข้อมูลนโยบายในส่วนนี้</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
