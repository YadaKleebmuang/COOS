<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { orderService } from '~/services/order.service'
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse
} from '~/types/order.types'
import StepWorkType from '~/components/order/StepWorkType.vue'
import StepPackage from '~/components/order/StepPackage.vue'
import StepDetails from '~/components/order/StepDetails.vue'
import StepConfirm from '~/components/order/StepConfirm.vue'
import StepSuccess from '~/components/order/StepSuccess.vue'

definePageMeta({
  layout: 'customer',
  middleware: ['auth', 'customer']
})

const token = useCookie<string | null>('token')
const router = useRouter()
const route = useRoute()

// ── Stepper ──
const currentStep = ref(1)
const totalSteps = 4
const stepLabels = ['ประเภทงาน', 'แพ็กเกจ', 'รายละเอียด', 'ยืนยัน']

// ── Data from API ──
const workTypes = ref<WorkType[]>([])
const packages = ref<Package[]>([])
const loadingData = ref(true)
const dataError = ref('')

// ── Selected state ──
const selectedWorkTypeId = ref<number | null>(null)
const selectedPackageId = ref<number | null>(null)
const sourceImageUrls = ref<string[]>([])
const acceptedDisclaimer = ref(false)

// ── Order form ──
const form = reactive({
  orderStyle: '',
  orderColorTone: '',
  orderComposition: '',
  orderNote: '',
  orderRequiredDate: '',
  orderIsUrgent: false,
  orderIsGalleryAllowed: false
})

// ── Submit state ──
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const createdOrder = ref<OrderCreateResponse | null>(null)

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

// ── Computed helpers ──
const selectedWorkType = computed(() =>
  workTypes.value.find(wt => wt.workTypeId === selectedWorkTypeId.value)
)

const selectedPackage = computed(() =>
  packages.value.find(p => p.packageId === selectedPackageId.value)
)

const pricePreview = computed(() => {
  const pkg = selectedPackage.value
  if (!pkg) return { base: 0, urgent: 0, discount: 0, total: 0 }

  const base = Number(pkg.packagePrice)
  const urgent = form.orderIsUrgent ? Number(pkg.packageUrgentPrice || 0) : 0
  const discount = form.orderIsGalleryAllowed
    ? (base * Number(pkg.packageGalleryDiscount || 20)) / 100
    : 0
  const total = base + urgent - discount

  return { base, urgent, discount, total }
})

// ── Validation ──
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedWorkTypeId.value !== null
    case 2:
      return selectedPackageId.value !== null
    case 3:
      return form.orderRequiredDate !== ''
    default:
      return true
  }
})

// ── Navigation ──
const nextStep = () => {
  if (canGoNext.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

// ── Submit ──
const submitOrder = async () => {
  if (submitting.value) return
  if (!selectedPackageId.value || !selectedWorkTypeId.value) return

  if (!acceptedDisclaimer.value) {
    submitError.value = 'กรุณายอมรับนโยบายความเป็นส่วนตัวและข้อตกลงก่อนกดยืนยัน'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const payload: OrderFormPayload = {
      packageId: selectedPackageId.value,
      workTypeId: selectedWorkTypeId.value,
      orderRequiredDate: form.orderRequiredDate,
      orderIsUrgent: form.orderIsUrgent,
      orderIsGalleryAllowed: form.orderIsGalleryAllowed
    }

    if (form.orderStyle.trim()) payload.orderStyle = form.orderStyle.trim()
    if (form.orderColorTone.trim()) payload.orderColorTone = form.orderColorTone.trim()
    if (form.orderComposition.trim()) payload.orderComposition = form.orderComposition.trim()
    if (form.orderNote.trim()) payload.orderNote = form.orderNote.trim()
    if (sourceImageUrls.value.length > 0) payload.sourceImageUrls = sourceImageUrls.value

    const result = await orderService.createOrder(payload)
    createdOrder.value = result
    submitSuccess.value = true
  } catch (err: unknown) {
    submitError.value = getErrorMessage(err, 'เกิดข้อผิดพลาดในการสร้างคำสั่งงาน')
  } finally {
    submitting.value = false
  }
}

// ── Fetch data on mount ──
onMounted(async () => {
  if (!token.value) {
    router.push('/login')
    return
  }

  loadingData.value = true
  dataError.value = ''

  try {
    const [wt, pkg] = await Promise.all([
      orderService.getWorkTypes(),
      orderService.getPackages()
    ])
    workTypes.value = wt
    packages.value = pkg

    // Prefill from query params
    if (route.query.workTypeId) selectedWorkTypeId.value = Number(route.query.workTypeId)
    if (route.query.packageId) selectedPackageId.value = Number(route.query.packageId)
    if (route.query.style) form.orderStyle = String(route.query.style)
    if (route.query.colorTone) form.orderColorTone = String(route.query.colorTone)
    if (route.query.composition) form.orderComposition = String(route.query.composition)

    if (selectedWorkTypeId.value && selectedPackageId.value) {
      currentStep.value = 3
    } else if (selectedWorkTypeId.value) {
      currentStep.value = 2
    }
  } catch (err: unknown) {
    dataError.value = getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลได้')
  } finally {
    loadingData.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-[800px] py-6 sm:py-8 lg:py-10">
    <div class="dashboard-grid pointer-events-none fixed inset-0 z-0" />
    
    <div class="relative z-10">
      <!-- Header -->
      <div class="mb-6 text-center">
        <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
          CREATE ORDER
        </p>
        <h1 class="text-3xl font-semibold leading-tight text-[#171717]">
          สั่งทำภาพ
        </h1>
        <p class="mt-1.5 text-[14px] font-medium text-[#666666]">
          กรอกข้อมูลเพื่อสร้างคำสั่งงานภาพดิจิทัล
        </p>
      </div>

      <!-- Success State -->
      <StepSuccess
        v-if="submitSuccess && createdOrder"
        :created-order="createdOrder"
      />

      <!-- Loading State -->
      <div
        v-else-if="loadingData"
        class="rounded-[24px] border border-black/5 bg-white/40 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl"
      >
        <div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#171717]" />
        <p class="text-[14px] font-medium text-[#666666]">
          กำลังโหลดข้อมูล...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="dataError"
        class="rounded-[24px] border border-black/5 bg-[#FDEEEE]/80 p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <svg class="h-6 w-6 text-[#B93B3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p class="mb-1 text-[15px] font-bold text-[#B93B3B]">
          เกิดข้อผิดพลาด
        </p>
        <p class="text-[13px] font-medium text-[#B93B3B]/80">
          {{ dataError }}
        </p>
      </div>

      <!-- Form Wizard -->
      <div v-else>
        <!-- Stepper Navbar -->
        <div class="mb-6 flex justify-center">
          <div class="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-white/40 p-2 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl hide-scrollbar sm:gap-4 sm:px-6 sm:p-3">
            <template v-for="(label, idx) in stepLabels" :key="idx">
              <button
                class="flex items-center gap-2.5 rounded-full px-2 py-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20"
                :class="idx + 1 <= currentStep ? 'cursor-pointer' : 'cursor-default opacity-50'"
                :aria-current="idx + 1 === currentStep ? 'step' : undefined"
                @click="goToStep(idx + 1)"
              >
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors duration-300"
                  :class="
                    idx + 1 < currentStep
                      ? 'bg-[#171717] text-white'
                      : idx + 1 === currentStep
                        ? 'border-2 border-[#171717] bg-white text-[#171717]'
                        : 'border-2 border-black/10 bg-[#f8f8f8] text-[#929292]'
                  "
                >
                  <svg v-if="idx + 1 < currentStep" class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <span class="hidden text-[13px] font-bold transition-colors duration-300 sm:block" :class="idx + 1 <= currentStep ? 'text-[#171717]' : 'text-[#929292]'">{{ label }}</span>
              </button>
              <!-- Connector -->
              <div v-if="idx < stepLabels.length - 1" class="h-px w-6 transition-colors duration-300 sm:w-10" :class="idx + 1 < currentStep ? 'bg-[#171717]' : 'bg-black/10'" />
            </template>
          </div>
        </div>

        <!-- Card container -->
        <div class="overflow-hidden rounded-[24px] border border-black/5 bg-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl">
          <StepWorkType
            v-show="currentStep === 1"
            v-model="selectedWorkTypeId"
            :work-types="workTypes"
          />

          <StepPackage
            v-show="currentStep === 2"
            v-model="selectedPackageId"
            :packages="packages"
          />

          <StepDetails
            v-show="currentStep === 3"
            v-model:images="sourceImageUrls"
            :model-value="form"
            :selected-package="selectedPackage || null"
            :price-preview="pricePreview"
            @update:model-value="Object.assign(form, $event)"
          />

          <StepConfirm
            v-show="currentStep === 4"
            v-model="acceptedDisclaimer"
            :form="form"
            :selected-work-type="selectedWorkType"
            :selected-package="selectedPackage"
            :source-images="sourceImageUrls"
            :price-preview="pricePreview"
            :submit-error="submitError"
          />

          <!-- Navigation Buttons -->
          <div class="flex flex-col-reverse gap-3 border-t border-black/5 bg-white/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              v-if="currentStep > 1"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-[18px] text-[14px] font-semibold text-[#171717] transition hover:border-black/20 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
              @click="prevStep"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              ย้อนกลับ
            </button>
            <div v-else class="w-10" />

            <button
              v-if="currentStep < totalSteps"
              :disabled="!canGoNext"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-[18px] text-[14px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#171717]/20 disabled:cursor-not-allowed"
              :class="canGoNext ? 'bg-[#171717] text-white shadow-md hover:bg-black' : 'bg-black/5 text-[#929292]'"
              @click="nextStep"
            >
              ถัดไป
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              v-else
              :disabled="submitting || !acceptedDisclaimer"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-[18px] text-[14px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#171717]/20 disabled:cursor-not-allowed"
              :class="submitting || !acceptedDisclaimer ? 'bg-black/5 text-[#929292]' : 'bg-[#171717] text-white shadow-md hover:bg-black'"
              @click="submitOrder"
            >
              <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span v-else>ยืนยันการสั่งทำภาพ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(20, 20, 20, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(20, 20, 20, 0.05) 1px, transparent 1px);
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
