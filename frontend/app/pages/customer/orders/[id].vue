<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAlert } from '~/composables/useAlert'
import { orderService } from '~/services/order.service'
import type { OrderDetail, OrderStatus, Payment } from '~/types/order.types'

// ── Auth & Route ──
const token = useCookie<string | null>('token')
const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const { alert, confirm } = useAlert()

definePageMeta({
  layout: 'customer',
  middleware: ['auth', 'customer']
})

// ── State ──
const order = ref<OrderDetail | null>(null)
const loading = ref(true)
const error = ref('')

// ── Payment Form State ──
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadingSlip = ref(false)
const uploadError = ref('')
const uploadedSlipUrl = ref('')
const submittingPayment = ref(false)
const submitPaymentError = ref('')

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

// ── Fetch details ──
const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await orderService.getOrderById(orderId)
    order.value = res
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'ไม่สามารถดึงข้อมูลรายละเอียดออเดอร์ได้')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    router.push('/login')
    return
  }
  fetchOrderDetails()
})

// ── Order Steps (Total 8 steps timeline) ──
const stepsList: { status: OrderStatus, label: string, desc: string }[] = [
  { status: 'waiting_deposit', label: 'รอชำระมัดจำ', desc: 'ลูกค้าแนบสลิปชำระเงินมัดจำ 30%' },
  { status: 'waiting_assignment', label: 'รอจัดหาคนรับงาน', desc: 'ผู้ดูแลระบบกำลังมอบหมายงานให้ Editor' },
  { status: 'waiting_to_start', label: 'รอเริ่มงาน', desc: 'Editor ได้รับมอบหมายงานแล้ว เตรียมเริ่มดำเนินการ' },
  { status: 'in_progress', label: 'กำลังดำเนินการ', desc: 'Editor กำลังสร้างสรรค์ผลงานภาพตามความต้องการ' },
  { status: 'waiting_selection', label: 'รอคัดเลือกภาพ', desc: 'ลูกค้าพิจารณาภาพตัวอย่างเพื่อเลือกรูปไฟนอล' },
  { status: 'waiting_final_payment', label: 'รอชำระส่วนที่เหลือ', desc: 'ชำระเงินส่วนที่เหลือ 70% เพื่อรับรูปขนาดจริง' },
  { status: 'delivered', label: 'ส่งมอบงาน', desc: 'ระบบส่งภาพผลงานขนาดจริงเรียบร้อยแล้ว' },
  { status: 'completed', label: 'เสร็จสมบูรณ์', desc: 'คำสั่งงานสิ้นสุดอย่างเป็นทางการ ขอบคุณที่ใช้บริการ' }
]

// ค้นหาตำแหน่ง step ปัจจุบัน (ถ้าเป็น cancelled จะถือว่าสิ้นสุดแต่ไม่ผ่านขั้นตอนปกติ)
const currentStepIndex = computed(() => {
  if (!order.value) return -1
  if (order.value.orderStatus === 'cancelled') return -1
  return stepsList.findIndex(s => s.status === order.value?.orderStatus)
})

// ── Payment Calculations ──
const paymentInfo = computed(() => {
  if (!order.value) return { type: 'deposit' as const, amount: 0, percentage: 30 }
  const total = Number(order.value.orderTotalPrice)
  if (order.value.orderStatus === 'waiting_deposit') {
    return { type: 'deposit' as const, amount: total * 0.3, percentage: 30 }
  }
  return { type: 'final' as const, amount: total * 0.7, percentage: 70 }
})

// ── Image Categorization ──
const sourceImages = computed(() => {
  if (!order.value?.images) return []
  return order.value.images.filter(img => img.imageType === 'source')
})

const aiGeneratedImages = computed(() => {
  if (!order.value?.images) return []
  return order.value.images.filter(img => img.imageType === 'ai_generated')
})

const finalImages = computed(() => {
  if (!order.value?.images) return []
  // ดึงภาพที่เป็น selected_final (ดึงแค่ที่เลือกแล้ว)
  return order.value.images.filter(img => img.imageType === 'selected_final')
})

const hasRequirements = computed(() => {
  return Boolean(order.value?.orderStyle || order.value?.orderColorTone || order.value?.orderComposition || order.value?.orderNote)
})

const requirementItems = computed(() => {
  if (!order.value) return []

  return [
    { label: 'สไตล์ภาพ', value: order.value.orderStyle },
    { label: 'โทนสี', value: order.value.orderColorTone },
    { label: 'องค์ประกอบฉาก', value: order.value.orderComposition, wide: true },
    { label: 'หมายเหตุเพิ่มเติม', value: order.value.orderNote, wide: true }
  ].filter(item => item.value)
})

const canCancelOrder = computed(() => order.value?.orderStatus === 'waiting_deposit')

// ── Photo Selection State ──
const selectedFinalImageIds = ref<number[]>([])
const submittingSelection = ref(false)
const submitSelectionError = ref('')

const toggleImageSelection = (imageId: number) => {
  if (!order.value) return
  const limit = order.value.packageImageCount

  const index = selectedFinalImageIds.value.indexOf(imageId)
  if (index > -1) {
    selectedFinalImageIds.value.splice(index, 1)
  } else {
    if (selectedFinalImageIds.value.length < limit) {
      selectedFinalImageIds.value.push(imageId)
    } else {
      alert('ข้อจำกัดจำนวนภาพ', `คุณสามารถเลือกรูปภาพได้สูงสุด ${limit} ภาพตามแพ็กเกจ`, 'warning')
    }
  }
}

const submitPhotoSelection = async () => {
  if (!order.value || submittingSelection.value) return

  if (selectedFinalImageIds.value.length === 0) {
    submitSelectionError.value = 'กรุณาเลือกรูปภาพอย่างน้อย 1 ภาพ'
    return
  }

  const confirmed = await confirm('ยืนยันการเลือกรูปภาพ', `ยืนยันการเลือกรูปภาพจำนวน ${selectedFinalImageIds.value.length} ภาพ ใช่หรือไม่? (เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้)`)
  if (!confirmed) {
    return
  }

  submittingSelection.value = true
  submitSelectionError.value = ''

  try {
    await orderService.selectFinalImages(order.value.orderId, selectedFinalImageIds.value)
    selectedFinalImageIds.value = []
    await fetchOrderDetails()
  } catch (err: unknown) {
    submitSelectionError.value = getErrorMessage(err, 'บันทึกการเลือกรูปภาพไม่สำเร็จ')
  } finally {
    submittingSelection.value = false
  }
}

// ── Status Badges Color Map ──
const getStatusBadgeClass = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    waiting_deposit: 'bg-[#FFF7E6] text-[#9A6812] border-[#FFF7E6]',
    waiting_assignment: 'bg-[#EDF3FF] text-[#3566B8] border-[#EDF3FF]',
    waiting_to_start: 'bg-[#EDF3FF] text-[#3566B8] border-[#EDF3FF]',
    in_progress: 'bg-[#F0EEFF] text-[#675DDC] border-[#F0EEFF]',
    waiting_selection: 'bg-[#FFF1E9] text-[#A34F22] border-[#FFF1E9]',
    waiting_final_payment: 'bg-[#FFF7E6] text-[#9A6812] border-[#FFF7E6]',
    delivered: 'bg-[#EDF8F1] text-[#267A48] border-[#EDF8F1]',
    completed: 'bg-[#EDF8F1] text-[#267A48] border-[#EDF8F1]',
    cancelled: 'bg-[#FDEEEE] text-[#B93B3B] border-[#FDEEEE]'
  }
  return map[status] || 'bg-[#F3F3F1] text-[#666666] border-[#F3F3F1]'
}

const getStatusLabel = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    waiting_deposit: 'รอชำระมัดจำ',
    waiting_assignment: 'รอจัดหาคนรับงาน',
    waiting_to_start: 'รอเริ่มงาน',
    in_progress: 'กำลังดำเนินการ',
    waiting_selection: 'รอคัดเลือกภาพ',
    waiting_final_payment: 'รอชำระส่วนที่เหลือ',
    delivered: 'ส่งมอบงานแล้ว',
    completed: 'เสร็จสมบูรณ์',
    cancelled: 'ยกเลิกออเดอร์'
  }
  return map[status] || status
}

const getWorkflowStatusLabel = (status?: OrderStatus | string | null) => {
  if (!status || status === 'none' || status === 'null') return 'สร้างคำสั่งงาน'

  const knownStatuses = new Set<string>([
    'waiting_deposit',
    'waiting_assignment',
    'waiting_to_start',
    'in_progress',
    'waiting_selection',
    'waiting_final_payment',
    'delivered',
    'completed',
    'cancelled'
  ])

  return knownStatuses.has(status)
    ? getStatusLabel(status as OrderStatus)
    : 'อัปเดตสถานะ'
}

// ── Payment Status Badge ──
const getPaymentStatusBadgeClass = (status: Payment['paymentStatus']) => {
  const map: Record<Payment['paymentStatus'], string> = {
    pending: 'bg-[#FFF7E6] text-[#9A6812] border-[#FFF7E6]',
    approved: 'bg-[#EDF8F1] text-[#267A48] border-[#EDF8F1]',
    rejected: 'bg-[#FDEEEE] text-[#B93B3B] border-[#FDEEEE]'
  }
  return map[status] || 'bg-[#F3F3F1] text-[#666666] border-[#F3F3F1]'
}

const getPaymentStatusLabel = (status: Payment['paymentStatus']) => {
  const map: Record<Payment['paymentStatus'], string> = {
    pending: 'รอตรวจสอบ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่ผ่านอนุมัติ/ปฏิเสธ'
  }
  return map[status] || status
}

// ── File Upload Handlers ──
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadSlipFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadSlipFile(event.dataTransfer.files[0])
  }
}

const uploadSlipFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'กรุณาอัปโหลดสลิปที่เป็นไฟล์รูปภาพเท่านั้น'
    return
  }

  uploadError.value = ''
  uploadedSlipUrl.value = ''
  uploadingSlip.value = true

  try {
    const url = await orderService.uploadSlip(file)
    uploadedSlipUrl.value = url
  } catch (err: unknown) {
    uploadError.value = getErrorMessage(err, 'ไม่สามารถอัปโหลดไฟล์สลิปได้')
  } finally {
    uploadingSlip.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ── Submit Slip ──
const submitSlip = async () => {
  if (!uploadedSlipUrl.value || submittingPayment.value || !order.value) return

  submittingPayment.value = true
  submitPaymentError.value = ''

  try {
    await orderService.submitPaymentSlip(
      order.value.orderId,
      paymentInfo.value.type,
      paymentInfo.value.amount,
      uploadedSlipUrl.value
    )
    // Clear and reload
    uploadedSlipUrl.value = ''
    await fetchOrderDetails()
  } catch (err: unknown) {
    submitPaymentError.value = getErrorMessage(err, 'ส่งหลักฐานชำระเงินไม่สำเร็จ')
  } finally {
    submittingPayment.value = false
  }
}

const getStepState = (idx: number) => {
  if (!order.value || order.value.orderStatus === 'cancelled') return 'pending'
  if (idx < currentStepIndex.value || (order.value.orderStatus === 'completed' && idx === currentStepIndex.value)) return 'done'
  if (idx === currentStepIndex.value) return 'current'
  return 'pending'
}

const nextAction = computed(() => {
  if (!order.value) return null

  const map: Partial<Record<OrderStatus, { label: string, description: string, href: string }>> = {
    waiting_deposit: {
      label: 'ชำระมัดจำ',
      description: 'แนบสลิปมัดจำ 30% เพื่อให้ทีมเริ่มจัดคิวงาน',
      href: '#payment-section'
    },
    waiting_selection: {
      label: 'เลือกผลงาน',
      description: 'เลือกรูปภาพที่ต้องการรับเป็นไฟล์จริงตามแพ็กเกจ',
      href: '#selection-section'
    },
    waiting_final_payment: {
      label: 'ชำระยอดคงเหลือ',
      description: 'แนบสลิปชำระเงินส่วนที่เหลือ 70% เพื่อรับไฟล์จริง',
      href: '#payment-section'
    },
    delivered: {
      label: 'ตรวจรับงาน',
      description: 'ตรวจสอบไฟล์ส่งมอบและดาวน์โหลดผลงานสุดท้าย',
      href: '#delivery-section'
    }
  }

  return map[order.value.orderStatus] || null
})

// ── Cancel Order (Customer can cancel when waiting_deposit) ──
const cancelOrder = async () => {
  if (!order.value) return
  const confirmed = await confirm('ยืนยันการยกเลิก', 'คุณแน่ใจหรือไม่ที่จะยกเลิกออเดอร์นี้?')
  if (!confirmed) return

  try {
    await orderService.updateOrderStatus(order.value.orderId, 'cancelled', 'ลูกค้ายกเลิกคำสั่งงานด้วยตนเอง')
    await fetchOrderDetails()
  } catch (err: unknown) {
    alert('เกิดข้อผิดพลาด', getErrorMessage(err, 'ยกเลิกคำสั่งงานไม่สำเร็จ'), 'error')
  }
}

// ── Format helpers ──
const formatPrice = (n: number) =>
  Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDeliveryDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  const hasMeaningfulLocalTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0

  return d.toLocaleDateString('th-TH', hasMeaningfulLocalTime
    ? { ...dateOptions, hour: '2-digit', minute: '2-digit' }
    : dateOptions)
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1280px] py-6 sm:py-8 lg:py-10">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <NuxtLink
        to="/customer/orders"
        class="inline-flex h-11 items-center justify-center self-start rounded-xl border border-black/[0.08] bg-white px-[18px] text-sm font-semibold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-[#F3F3F1] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
      >
        <svg
          class="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        กลับไปงานของฉัน
      </NuxtLink>

      <button
        v-if="order && canCancelOrder"
        class="inline-flex h-11 items-center justify-center rounded-xl border border-[#FDEEEE] bg-[#FDEEEE] px-[18px] text-sm font-semibold text-[#B93B3B] transition hover:border-[#B93B3B]/20 focus:outline-none focus:ring-2 focus:ring-[#B93B3B]/15"
        @click="cancelOrder"
      >
        ยกเลิกออเดอร์
      </button>
    </div>

    <section
      v-if="loading"
      class="rounded-[20px] border border-black/[0.06] bg-white p-12 text-center shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
    >
      <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#F3F3F1] border-t-[#171717]" />
      <p class="text-sm font-semibold text-[#666666]">
        กำลังดึงข้อมูลออเดอร์...
      </p>
    </section>

    <section
      v-else-if="error || !order"
      class="rounded-[20px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
    >
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEEEE] text-[#B93B3B]">
        <svg
          class="h-7 w-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-[#171717]">
        ไม่สามารถเปิดหน้านี้ได้
      </h3>
      <p class="mx-auto mt-2 max-w-md text-sm leading-[1.6] text-[#666666]">
        {{ error || 'ไม่พบข้อมูลออเดอร์นี้' }}
      </p>
      <NuxtLink
        to="/customer/orders"
        class="mt-5 inline-flex h-11 items-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
      >
        กลับไปงานของฉัน
      </NuxtLink>
    </section>

    <div
      v-else
      class="space-y-6"
    >
      <section class="relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8">
        <div class="pointer-events-none absolute -right-20 -top-24 h-64 w-80 rounded-full bg-[#EDF3FF]/70 blur-[56px]" />
        <div class="pointer-events-none absolute right-28 top-8 hidden h-44 w-44 rounded-full bg-[#F0EEFF]/70 blur-[54px] lg:block" />

        <div class="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <p class="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">
              ORDER / #COOS-{{ Math.abs(order.orderId) }}
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 class="text-[26px] font-semibold leading-[1.3] text-[#171717] sm:text-[30px]">
                #COOS-{{ Math.abs(order.orderId) }} · {{ order.workTypeName }}
              </h1>
              <span
                class="inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-medium"
                :class="getStatusBadgeClass(order.orderStatus)"
              >
                {{ getStatusLabel(order.orderStatus) }}
              </span>
            </div>
            <p class="mt-2 max-w-2xl text-sm font-normal leading-[1.6] text-[#666666]">
              {{ order.packageName }} · สร้างเมื่อ {{ formatDate(order.orderCreatedAt) }}
            </p>
          </div>
        </div>

        <div class="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <p class="text-[13px] font-medium text-[#666666]">
              แพ็กเกจ
            </p>
            <p class="mt-2 text-base font-semibold text-[#171717]">
              {{ order.packageName }}
            </p>
          </div>
          <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <p class="text-[13px] font-medium text-[#666666]">
              วันส่งมอบ
            </p>
            <p class="mt-2 text-base font-semibold text-[#171717]">
              {{ formatDeliveryDate(order.orderRequiredDate) }}
            </p>
          </div>
          <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <p class="text-[13px] font-medium text-[#666666]">
              ยอดรวม
            </p>
            <p class="mt-2 text-[24px] font-semibold leading-none text-[#171717]">
              ฿{{ formatPrice(order.orderTotalPrice) }}
            </p>
          </div>
          <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <p class="text-[13px] font-medium text-[#666666]">
              จำนวนภาพ / ความละเอียด
            </p>
            <p class="mt-2 text-base font-semibold text-[#171717]">
              {{ order.packageImageCount }} ภาพ · {{ order.packageResolution }}
            </p>
          </div>
        </div>
      </section>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <main class="space-y-6">
          <section
            v-if="hasRequirements"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-4">
              <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                รายละเอียดความต้องการ
              </h2>
              <p class="text-[13px] font-normal leading-[1.5] text-[#666666]">
                รายละเอียดจากแบบฟอร์มสั่งงานของคุณ
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="item in requirementItems"
                :key="item.label"
                class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4"
                :class="{ 'sm:col-span-2': item.wide }"
              >
                <p class="text-xs font-medium text-[#666666]">
                  {{ item.label }}
                </p>
                <p class="mt-1 whitespace-pre-line text-sm font-semibold leading-[1.6] text-[#171717]">
                  {{ item.value }}
                </p>
              </div>
            </div>
          </section>

          <section
            v-if="sourceImages.length > 0"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-4">
              <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                รูปต้นฉบับ / รูปอ้างอิงของคุณ
              </h2>
              <p class="text-[13px] text-[#666666]">
                {{ sourceImages.length }} รูปจากข้อมูลออเดอร์จริง
              </p>
            </div>
            <div
              class="grid gap-3"
              :class="sourceImages.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'"
            >
              <a
                v-for="(img, idx) in sourceImages"
                :key="img.orderImageId"
                :href="img.imageUrl"
                target="_blank"
                class="group overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#F3F3F1]"
              >
                <img
                  :src="img.imageUrl"
                  :alt="`รูปต้นฉบับหรือรูปอ้างอิง ${idx + 1} ของออเดอร์ #COOS-${Math.abs(order.orderId)}`"
                  class="aspect-[4/3] w-full bg-[#F3F3F1] object-contain p-1"
                >
              </a>
            </div>
          </section>

          <section
            v-if="order.orderStatus === 'waiting_selection' && aiGeneratedImages.length > 0"
            id="selection-section"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-5 flex flex-col gap-4 border-b border-black/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                  คัดเลือกรูปภาพที่ชื่นชอบ
                </h2>
                <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
                  เลือกรูปภาพที่ต้องการรับเป็นไฟล์จริง สูงสุด {{ order.packageImageCount }} ภาพ
                </p>
              </div>
              <div class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3 text-right">
                <p class="text-xs font-medium text-[#666666]">
                  เลือกแล้ว
                </p>
                <p class="text-2xl font-semibold text-[#171717]">
                  {{ selectedFinalImageIds.length }} / {{ order.packageImageCount }}
                </p>
              </div>
            </div>

            <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div
                v-for="img in aiGeneratedImages"
                :key="img.orderImageId"
                class="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[16px] border transition duration-200"
                :class="selectedFinalImageIds.includes(img.orderImageId) ? 'border-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)]' : 'border-black/[0.06] hover:border-black/[0.10]'"
                @click="toggleImageSelection(img.orderImageId)"
              >
                <img
                  :src="img.imageUrl"
                  :alt="`ภาพตัวอย่างสำหรับคัดเลือก ${img.orderImageId}`"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                >
                <div
                  v-if="selectedFinalImageIds.includes(img.orderImageId)"
                  class="absolute inset-0 flex items-center justify-center bg-black/20"
                >
                  <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    /></svg>
                  </span>
                </div>
                <div class="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <span class="truncate text-[11px] font-medium text-white">{{ img.aiEngine || 'AI Gen' }}</span>
                  <a
                    :href="img.imageUrl"
                    target="_blank"
                    class="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#171717]"
                    @click.stop
                  >เปิดดู</a>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4 border-t border-black/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                v-if="submitSelectionError"
                class="text-sm font-semibold text-[#B93B3B]"
              >
                {{ submitSelectionError }}
              </p>
              <p
                v-else
                class="text-xs leading-[1.6] text-[#666666]"
              >
                เมื่อยืนยันแล้วจะไม่สามารถเปลี่ยนรูปได้ และระบบจะพาคุณไปขั้นตอนชำระเงินส่วนที่เหลือ
              </p>
              <button
                :disabled="selectedFinalImageIds.length === 0 || submittingSelection"
                class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#B8B8B8] sm:w-auto"
                @click="submitPhotoSelection"
              >
                <span
                  v-if="submittingSelection"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                {{ submittingSelection ? 'กำลังบันทึก...' : 'ยืนยันการเลือกรูปภาพ' }}
              </button>
            </div>
          </section>

          <section
            v-if="order.orderStatus === 'waiting_deposit' || order.orderStatus === 'waiting_final_payment'"
            id="payment-section"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-5 flex flex-col gap-4 border-b border-black/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                  แนบหลักฐานการชำระเงิน
                </h2>
                <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
                  กรุณาโอนเงินเข้าบัญชีธนาคารของร้านเพื่อแจ้งชำระเงิน
                </p>
              </div>
              <div class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3 text-right">
                <p class="text-xs font-medium text-[#666666]">
                  ยอดที่ต้องชำระ ({{ paymentInfo.percentage }}%)
                </p>
                <p class="text-2xl font-semibold text-[#171717]">
                  ฿{{ formatPrice(paymentInfo.amount) }}
                </p>
              </div>
            </div>

            <div class="mb-5 flex flex-col justify-between gap-4 rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4 sm:flex-row sm:items-center">
              <div>
                <p class="text-sm font-semibold text-[#171717]">
                  ธนาคารไทยพาณิชย์ (SCB)
                </p>
                <p class="text-xs leading-[1.5] text-[#666666]">
                  บจก. คูส สตูดิโอ (COOS Studio Co., Ltd.)
                </p>
              </div>
              <span class="select-all rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-sm font-semibold tracking-wider text-[#171717]">123-4-56789-0</span>
            </div>

            <div class="space-y-4">
              <div
                class="cursor-pointer rounded-[16px] border-2 border-dashed p-6 text-center transition"
                :class="dragOver ? 'border-[#171717] bg-[#F3F3F1]' : 'border-black/[0.10] bg-white hover:border-black/[0.20]'"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                >
                <div
                  v-if="uploadedSlipUrl"
                  class="flex flex-col items-center justify-center gap-3"
                >
                  <img
                    :src="uploadedSlipUrl"
                    alt="ตัวอย่างสลิปที่อัปโหลด"
                    class="max-h-44 rounded-[16px] border border-black/[0.06] object-contain shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                  <p class="text-xs font-semibold text-[#267A48]">
                    อัปโหลดสลิปเรียบร้อย กดส่งหลักฐานชำระเงินด้านล่าง
                  </p>
                  <p class="text-[11px] text-[#929292]">
                    คลิกหรือลากสลิปใหม่มาวางที่นี่เพื่อเปลี่ยนไฟล์
                  </p>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center gap-2"
                >
                  <p class="text-sm font-semibold text-[#171717]">
                    ลากรูปภาพสลิปมาวาง หรือคลิกเพื่ออัปโหลด
                  </p>
                  <p class="text-xs text-[#666666]">
                    รองรับไฟล์สลิปรูปภาพ JPG, PNG (สูงสุด 10MB)
                  </p>
                </div>
              </div>

              <div
                v-if="uploadingSlip"
                class="flex items-center justify-center gap-2 text-sm font-medium text-[#171717]"
              >
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[#F3F3F1] border-t-[#171717]" />
                กำลังประมวลผลรูปภาพสลิป...
              </div>
              <p
                v-if="uploadError"
                class="text-center text-xs font-semibold text-[#B93B3B]"
              >
                {{ uploadError }}
              </p>

              <div class="flex flex-col gap-3 sm:items-end">
                <button
                  :disabled="!uploadedSlipUrl || submittingPayment"
                  class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#B8B8B8] sm:w-auto"
                  @click="submitSlip"
                >
                  <span
                    v-if="submittingPayment"
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  />
                  {{ submittingPayment ? 'กำลังส่ง...' : 'ส่งหลักฐานชำระเงิน' }}
                </button>
                <p
                  v-if="submitPaymentError"
                  class="text-xs font-semibold text-[#B93B3B]"
                >
                  {{ submitPaymentError }}
                </p>
              </div>
            </div>
          </section>

          <section
            v-if="order.payments && order.payments.length > 0"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <h2 class="mb-4 text-xl font-semibold leading-[1.4] text-[#171717]">
              ประวัติการแจ้งชำระเงิน
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-black/[0.06] text-xs font-medium text-[#929292]">
                    <th class="pb-3 pr-4">
                      ประเภท
                    </th><th class="pb-3 pr-4">
                      จำนวนเงิน
                    </th><th class="pb-3 pr-4">
                      รูปภาพสลิป
                    </th><th class="pb-3 pr-4">
                      วันที่แจ้งชำระ
                    </th><th class="pb-3 text-right">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/[0.06]">
                  <tr
                    v-for="pay in order.payments"
                    :key="pay.paymentId"
                    class="text-[#666666]"
                  >
                    <td class="py-4 pr-4 font-semibold text-[#171717]">
                      {{ pay.paymentType === 'deposit' ? 'เงินมัดจำ (30%)' : 'เงินส่วนที่เหลือ (70%)' }}
                    </td>
                    <td class="py-4 pr-4 font-semibold text-[#171717]">
                      ฿{{ formatPrice(pay.paymentAmount) }}
                    </td>
                    <td class="py-4 pr-4">
                      <a
                        :href="pay.paymentSlipUrl"
                        target="_blank"
                        class="text-xs font-semibold text-[#171717] hover:underline"
                      >เปิดดูสลิป</a>
                    </td>
                    <td class="py-4 pr-4">
                      {{ formatDate(pay.paymentCreatedAt) }}
                    </td>
                    <td class="py-4 text-right">
                      <span
                        class="rounded-full border px-2.5 py-1 text-xs font-medium"
                        :class="getPaymentStatusBadgeClass(pay.paymentStatus)"
                      >{{ getPaymentStatusLabel(pay.paymentStatus) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section
            v-if="order.orderStatus === 'completed' || order.orderStatus === 'delivered'"
            id="delivery-section"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-5 flex flex-col gap-3 border-b border-black/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                  ดาวน์โหลดผลงานสุดท้าย
                </h2><p class="mt-1 text-sm leading-[1.6] text-[#666666]">
                  คลิกที่รูปภาพเพื่อดาวน์โหลดผลงานไฟล์ขนาดใหญ่หรือภาพที่เสร็จสิ้นสมบูรณ์แล้ว
                </p>
              </div>
              <span class="w-fit rounded-full border border-[#EDF8F1] bg-[#EDF8F1] px-3 py-1.5 text-xs font-medium text-[#267A48]">เปิดให้ดาวน์โหลดแล้ว</span>
            </div>
            <div
              v-if="finalImages.length === 0"
              class="rounded-[20px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-8 text-center text-sm text-[#666666]"
            >
              กำลังจัดเตรียมภาพสำหรับส่งมอบ กรุณารอแอดมินหรือช่างแต่งภาพอัปโหลดรูปภาพ
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div
                v-for="img in finalImages"
                :key="img.orderImageId"
                class="group overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div class="relative aspect-[4/3] overflow-hidden bg-[#F3F3F1]">
                  <img
                    :src="img.imageUrl"
                    :alt="`ผลงานสุดท้าย ${img.orderImageId}`"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  ><span class="absolute left-2 top-2 rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-semibold text-white">FINAL IMAGE</span>
                </div>
                <div class="space-y-3 p-4">
                  <div
                    v-if="img.aiEngine || img.positivePrompt"
                    class="space-y-2 text-xs"
                  >
                    <p
                      v-if="img.aiEngine"
                      class="text-[#666666]"
                    >
                      Engine: <span class="font-semibold text-[#171717]">{{ img.aiEngine }}</span>
                    </p><p
                      v-if="img.positivePrompt"
                      class="line-clamp-2 rounded-xl border border-black/[0.06] bg-[#F3F3F1] p-3 text-[#666666]"
                    >
                      {{ img.positivePrompt }}
                    </p>
                  </div><a
                    :href="img.imageUrl"
                    target="_blank"
                    download
                    class="flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929]"
                  >ดาวน์โหลดรูปภาพ</a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside class="space-y-6">
          <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <div class="mb-4">
              <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
                ขั้นตอนการทำงาน
              </h2><p class="text-xs font-normal text-[#666666]">
                สถานะปัจจุบัน: {{ getStatusLabel(order.orderStatus) }}
              </p>
            </div>
            <div class="space-y-3">
              <div
                v-for="(step, idx) in stepsList"
                :key="step.status"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold"
                    :class="{ 'border-[#267A48] bg-[#EDF8F1] text-[#267A48]': getStepState(idx) === 'done', 'border-[#171717] bg-[#171717] text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)]': getStepState(idx) === 'current', 'border-black/[0.06] bg-[#F3F3F1] text-[#666666]': getStepState(idx) === 'pending' }"
                  ><svg
                    v-if="getStepState(idx) === 'done'"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  /></svg><span v-else>{{ idx + 1 }}</span></span><span
                    v-if="idx < stepsList.length - 1"
                    class="mt-2 h-4 w-px bg-black/[0.06]"
                  />
                </div>
                <div class="pb-2">
                  <p
                    class="text-sm font-semibold"
                    :class="getStepState(idx) === 'pending' ? 'text-[#666666]' : 'text-[#171717]'"
                  >
                    {{ step.label }}
                  </p><p class="text-xs font-normal leading-[1.5] text-[#929292]">
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="nextAction"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
              การดำเนินการของคุณ
            </h2>
            <div class="mt-4 rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4">
              <p class="text-xs font-medium text-[#666666]">
                ต้องดำเนินการต่อ
              </p><p class="mt-1 text-xl font-semibold leading-[1.4] text-[#171717]">
                {{ nextAction.label }}
              </p><p class="mt-1 text-xs font-normal leading-[1.5] text-[#666666]">
                {{ nextAction.description }}
              </p><a
                :href="nextAction.href"
                class="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
              >{{ nextAction.label }}</a>
            </div>
          </section>

          <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
            <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
              ข้อมูลการชำระเงิน
            </h2>
            <div class="mt-4 space-y-2.5">
              <div class="flex items-center justify-between rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3">
                <span class="text-sm font-semibold text-[#666666]">ยอดรวม</span><span class="text-base font-semibold text-[#171717]">฿{{ formatPrice(order.orderTotalPrice) }}</span>
              </div><div class="flex items-center justify-between rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3">
                <span class="text-sm font-semibold text-[#666666]">มัดจำ 30%</span><span class="text-base font-semibold text-[#171717]">฿{{ formatPrice(Number(order.orderTotalPrice) * 0.3) }}</span>
              </div><div class="flex items-center justify-between rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3">
                <span class="text-sm font-semibold text-[#666666]">ยอดคงเหลือ 70%</span><span class="text-base font-semibold text-[#171717]">฿{{ formatPrice(Number(order.orderTotalPrice) * 0.7) }}</span>
              </div>
            </div>
          </section>

          <section
            v-if="order.workflowLogs && order.workflowLogs.length > 0"
            class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
          >
            <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
              บันทึกกิจกรรม
            </h2>
            <div class="mt-4 space-y-3">
              <div
                v-for="log in order.workflowLogs"
                :key="log.logId"
                class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4"
              >
                <p class="text-sm font-semibold text-[#171717]">
                  {{ getWorkflowStatusLabel(log.fromStatus) }} → {{ getWorkflowStatusLabel(log.toStatus) }}
                </p><p
                  v-if="log.logNote"
                  class="mt-2 whitespace-pre-line text-xs leading-[1.6] text-[#666666]"
                >
                  {{ log.logNote }}
                </p><p class="mt-2 text-[11px] leading-[1.5] text-[#929292]">
                  โดย {{ log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : 'ระบบอัตโนมัติ' }} ({{ log.userRole === 'admin' ? 'แอดมิน' : log.userRole === 'editor' ? 'ช่างแต่งภาพ' : 'ลูกค้า' }}) · {{ formatDate(log.changedAt) }}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>
