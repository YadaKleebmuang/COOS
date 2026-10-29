<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { orderService } from '~/services/order.service'
import type { OrderDetail, OrderImage, OrderStatus } from '~/types/order.types'
import EditGeneratedImageModal from '~/components/editor/job/EditGeneratedImageModal.vue'
import GalleryMetadataModal from '~/components/editor/job/GalleryMetadataModal.vue'

definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})

const route = useRoute()
const jobId = route.params.id as string
const { alert, confirm } = useAlert()
const { fetchProtectedBlob, openProtectedAsset, protectedAssetUrl, syncProtectedAssets, refreshProtectedAsset } = useProtectedAsset()
const orderImageEndpoint = (imageId: number) => `/media/order-images/${imageId}`

const order = ref<OrderDetail | null>(null)
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const uploadModalOpen = ref(false)
const historyDrawerOpen = ref(false)
const detailImage = ref<OrderImage | null>(null)
const metadataImage = ref<OrderImage | null>(null)
const isEditModalOpen = ref(false)
const editingImage = ref<OrderImage | null>(null)

const openEditModal = (img: OrderImage) => {
  editingImage.value = img
  isEditModalOpen.value = true
}

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const dragOver = ref(false)
const uploadError = ref('')
const previewUrl = ref('')
const uploadedFileUrl = ref('')
const copiedKey = ref<string | null>(null)
const downloadingReferenceIds = ref<Set<number>>(new Set())

const paramsForm = reactive({
  aiEngine: 'Stable Diffusion XL',
  positivePrompt: '',
  negativePrompt: 'nsfw, low quality, bad anatomy, blurry',
  cfgScale: 7.5,
  steps: 30,
  seed: -1
})

const resetParamsForm = () => Object.assign(paramsForm, {
  aiEngine: 'Stable Diffusion XL',
  positivePrompt: '',
  negativePrompt: 'nsfw, low quality, bad anatomy, blurry',
  cfgScale: 7.5,
  steps: 30,
  seed: -1
})

const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ''
  try {
    order.value = await orderService.getOrderById(jobId)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลรายละเอียดออเดอร์นี้ได้'
  } finally {
    loading.value = false
  }
}

const handleImageUpdated = async (event?: { orderImageId: number, imageChanged: boolean }) => {
  await fetchOrderDetails()
  if (event?.imageChanged && event?.orderImageId) {
    await refreshProtectedAsset(orderImageEndpoint(event.orderImageId))
  }
}

const sourceImages = computed(() => order.value?.images?.filter(image => image.imageType === 'source') ?? [])
const generatedImages = computed(() => order.value?.images?.filter(image => image.imageType === 'ai_generated') ?? [])
const selectedImages = computed(() => order.value?.images?.filter(image => image.imageType === 'selected_final') ?? [])

watch(
  () => (order.value?.images || []).map(image => orderImageEndpoint(image.orderImageId)),
  endpoints => syncProtectedAssets(endpoints),
  { immediate: true }
)

const statusLabels: Record<string, string> = {
  waiting_deposit: 'รอชำระมัดจำ',
  waiting_assignment: 'รอมอบหมายงาน',
  waiting_to_start: 'รอเริ่มงาน',
  in_progress: 'กำลังดำเนินการ',
  waiting_selection: 'รอเลือกผลงาน',
  waiting_final_payment: 'รอชำระส่วนที่เหลือ',
  delivered: 'ส่งมอบแล้ว',
  completed: 'เสร็จสมบูรณ์',
  cancelled: 'ยกเลิก'
}

const getStatusLabel = (status: string) => statusLabels[status] || 'อัปเดตสถานะงาน'

const workflowSteps = [
  { status: 'waiting_to_start', label: 'รอเริ่มงาน' },
  { status: 'in_progress', label: 'กำลังดำเนินการ' },
  { status: 'waiting_selection', label: 'รอเลือกผลงาน' },
  { status: 'waiting_final_payment', label: 'รอชำระส่วนที่เหลือ' },
  { status: 'delivered', label: 'ส่งมอบแล้ว' },
  { status: 'completed', label: 'เสร็จสมบูรณ์' }
]

const currentStepIndex = computed(() => workflowSteps.findIndex(step => step.status === order.value?.orderStatus))

const nextAction = computed(() => {
  switch (order.value?.orderStatus) {
    case 'waiting_to_start':
      return { title: 'พร้อมเริ่มดำเนินงาน', description: 'ตรวจสอบรายละเอียดและรูปอ้างอิงให้เรียบร้อย แล้วเริ่มทำงานนี้', action: 'start' as const, label: 'เริ่มงาน' }
    case 'in_progress':
      return { title: 'กำลังดำเนินการ', description: 'อัปโหลดผลงานพร้อมข้อมูลที่ใช้สร้างภาพ จากนั้นส่งให้ลูกค้าเลือก', action: 'submit' as const, label: 'ส่งผลงานให้ลูกค้าเลือก' }
    case 'waiting_selection':
      return { title: 'รอลูกค้าเลือกผลงาน', description: 'ส่งผลงานแล้ว ขณะนี้ยังไม่มีขั้นตอนที่ Editor ต้องดำเนินการ', action: null, label: '' }
    case 'waiting_final_payment':
      return { title: 'รอชำระส่วนที่เหลือ', description: 'ลูกค้าเลือกผลงานแล้ว ระบบกำลังรอการชำระเงินก่อนส่งมอบ', action: null, label: '' }
    case 'delivered':
      return { title: 'ส่งมอบผลงานแล้ว', description: 'ผลงานถูกส่งมอบแล้ว ขณะนี้ยังไม่มีขั้นตอนที่ Editor ต้องดำเนินการ', action: null, label: '' }
    case 'completed':
      return { title: 'งานเสร็จสมบูรณ์แล้ว', description: 'ลูกค้ายืนยันการรับผลงานเรียบร้อยแล้ว', action: null, label: '' }
    case 'cancelled':
      return { title: 'คำสั่งงานถูกยกเลิก', description: 'ไม่สามารถดำเนินการกับคำสั่งงานนี้ต่อได้', action: null, label: '' }
    default:
      return { title: 'ยังไม่ถึงขั้นตอนการผลิต', description: 'คำสั่งงานกำลังรอการดำเนินการจากส่วนอื่นของระบบ', action: null, label: '' }
  }
})

const updateStatus = async (nextStatus: OrderStatus, note: string) => {
  if (!order.value || updating.value) return
  updating.value = true
  try {
    await orderService.updateOrderStatus(order.value.orderId, nextStatus, note)
    await fetchOrderDetails()
  } catch (err: unknown) {
    alert('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เปลี่ยนสถานะไม่สำเร็จ', 'error')
  } finally {
    updating.value = false
  }
}

const handlePrimaryAction = async () => {
  if (nextAction.value.action === 'start') {
    await updateStatus('in_progress', 'ช่างแต่งภาพกดรับงานและเริ่มดำเนินการ')
    return
  }

  if (nextAction.value.action === 'submit') {
    const confirmed = await confirm('ยืนยันการส่งมอบงาน', 'ต้องการส่งมอบภาพเพื่อให้ลูกค้าเลือกรูปภาพสุดท้ายหรือไม่? (ภาพ AI Generated ทั้งหมดจะปรากฏในหน้าของลูกค้า)')
    if (confirmed) {
      await updateStatus('waiting_selection', 'ช่างแต่งภาพจัดส่งผลงาน AI Generated เพื่อให้ลูกค้าเลือกภาพไฟนอล')
    }
  }
}

const triggerFileInput = () => fileInput.value?.click()

const uploadImage = async (file: File) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = 'รองรับไฟล์ JPG, PNG และ WebP เท่านั้น'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.onerror = () => {
    previewUrl.value = ''
  }
  reader.readAsDataURL(file)

  uploadError.value = ''
  uploadedFileUrl.value = ''
  uploading.value = true
  try {
    const url = await orderService.uploadGeneratedImageFile(file)
    uploadedFileUrl.value = url
  } catch (err: unknown) {
    uploadError.value = err instanceof Error ? err.message : 'อัปโหลดภาพไม่สำเร็จ'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) uploadImage(target.files[0])
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files?.[0]) uploadImage(event.dataTransfer.files[0])
}

const handleCancelUpload = () => {
  uploadedFileUrl.value = ''
  previewUrl.value = ''
  uploadError.value = ''
}

const closeUploadModal = () => {
  if (uploading.value || submitting.value) return
  handleCancelUpload()
  uploadModalOpen.value = false
}

const handleSubmitImage = async () => {
  if (!order.value || !uploadedFileUrl.value || submitting.value) return

  submitting.value = true
  try {
    await orderService.addOrderImage(order.value.orderId, {
      imageType: 'ai_generated',
      imageUrl: uploadedFileUrl.value,
      imageThumbnailUrl: uploadedFileUrl.value,
      aiEngine: paramsForm.aiEngine,
      positivePrompt: paramsForm.positivePrompt,
      negativePrompt: paramsForm.negativePrompt,
      cfgScale: Number(paramsForm.cfgScale),
      steps: Number(paramsForm.steps),
      seed: Number(paramsForm.seed)
    })
    handleCancelUpload()
    resetParamsForm()
    uploadModalOpen.value = false
    await fetchOrderDetails()
  } catch (err: unknown) {
    uploadError.value = err instanceof Error ? err.message : 'บันทึกข้อมูลรูปภาพไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}

const copyPrompt = async (text: string, key: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => (copiedKey.value = null), 2000)
  } catch {
    // Clipboard access can be unavailable in restricted browser contexts.
  }
}

const downloadReferenceImage = async (image: OrderImage) => {
  if (downloadingReferenceIds.value.has(image.orderImageId)) return

  downloadingReferenceIds.value = new Set(downloadingReferenceIds.value).add(image.orderImageId)
  let objectUrl = ''
  let link: HTMLAnchorElement | null = null

  try {
    const blob = await fetchProtectedBlob(orderImageEndpoint(image.orderImageId))
    objectUrl = URL.createObjectURL(blob)

    let filename = ''
    const urlParts = image.imageUrl.split('/')
    const lastPart = urlParts.pop()?.split('?')[0]

    if (lastPart && lastPart.includes('.')) {
      filename = decodeURIComponent(lastPart)
    } else {
      let extension = ''
      if (blob.type === 'image/png') extension = '.png'
      else if (blob.type === 'image/jpeg') extension = '.jpg'
      else if (blob.type === 'image/webp') extension = '.webp'

      filename = `COOS-Order-${order.value?.orderId ?? jobId}-Reference-${image.orderImageId}${extension}`
    }

    link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } catch (err: unknown) {
    alert('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดาวน์โหลดรูปภาพ', 'error')
  } finally {
    link?.remove()
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    const activeIds = new Set(downloadingReferenceIds.value)
    activeIds.delete(image.orderImageId)
    downloadingReferenceIds.value = activeIds
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (detailImage.value) detailImage.value = null
  else if (uploadModalOpen.value) closeUploadModal()
  else historyDrawerOpen.value = false
}

watch(historyDrawerOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  fetchOrderDetails()
  window.addEventListener('keydown', handleEscape)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

const formatDate = (date: string) => date
  ? new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'

const formatDateTime = (date?: string) => date
  ? `${new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} · ${new Date(date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  : '—'

const getActorRoleLabel = (role?: string | null) => role === 'admin'
  ? 'ผู้ดูแลระบบ'
  : role === 'editor'
    ? 'ช่างแต่งภาพ'
    : 'ลูกค้า'

const breadcrumb = computed(() => [
  { label: 'หน้าแรก', to: '/editor/dashboard' },
  { label: 'งานที่ได้รับมอบหมาย', to: '/editor/jobs' },
  { label: `#${order.value?.orderId ?? jobId}` }
])
</script>

<template>
  <div class="editor-page space-y-6 max-w-7xl mx-auto">
    <AdminBreadcrumb :items="breadcrumb" />

    <div
      v-if="loading"
      class="space-y-6"
    >
      <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] h-44 animate-pulse" />
      <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] h-32 animate-pulse" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="index in 2"
          :key="index"
          class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] h-72 animate-pulse"
        />
      </div>
    </div>

    <div
      v-else-if="error || !order"
      class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.02)]"
    >
      <AdminEmptyState
        title="เกิดข้อผิดพลาด"
        :description="error || 'ไม่พบข้อมูลงานนี้'"
        icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      >
        <NuxtLink
          to="/editor/jobs"
          class="editor-primary inline-flex items-center px-4 py-2 rounded-lg bg-[#172c3b] text-white text-sm font-medium hover:bg-black transition-colors"
        >
          กลับไปยังรายการงาน
        </NuxtLink>
      </AdminEmptyState>
    </div>

    <template v-else>

      <section class="editor-page-heading bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <p class="editor-eyebrow text-[11px] font-semibold uppercase tracking-[0.16em] text-[#69777f]">
                ห้องทำงานช่างแต่งภาพ
              </p>
            </div>
            <h1 class="mt-2 text-2xl sm:text-3xl font-semibold text-[#172c3b] tracking-tight">
              งาน #{{ order.orderId }}
            </h1>
            <div class="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-[#69777f]">
                  ประเภทงาน
                </p><p class="mt-1 font-medium text-[#172c3b]">
                  {{ order.workTypeName }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-[#69777f]">
                  แพ็กเกจ
                </p><p class="mt-1 font-medium text-[#172c3b]">
                  {{ order.packageName }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-[#69777f]">
                  กำหนดส่ง
                </p><p class="mt-1 font-medium text-[#172c3b]">
                  {{ formatDate(order.orderRequiredDate) }}
                </p>
              </div>
            </div>
          </div>

          <div class="xl:max-w-md xl:text-right">
            <h2 class="text-base font-semibold text-[#172c3b]">
              {{ nextAction.title }}
            </h2>
            <p class="mt-1 text-[13px] leading-relaxed text-[#52616a]">
              {{ nextAction.description }}
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-2 xl:justify-end">
              <button
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-black/[0.08] bg-[#fcf9f3] text-[#52616a] text-sm font-medium hover:bg-[#eee7db] transition-colors"
                @click="historyDrawerOpen = true"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M12 8v4l3 2m6-2a9 9 0 11-3-6.7M21 3v6h-6"
                /></svg>
                ประวัติการทำงาน
              </button>
              <button
                v-if="nextAction.action"
                class="editor-primary inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#172c3b] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                :disabled="updating"
                @click="handlePrimaryAction"
              >
                <span
                  v-if="updating"
                  class="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                />
                {{ nextAction.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-6 lg:gap-[2%] items-start">
        <!-- Left Column 69% -->
        <div class="w-full lg:w-[69%] space-y-6">

          <section class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
            <div class="flex flex-col gap-8 lg:gap-10">
              <div>
                <div class="mb-5">
            <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">
              รายละเอียดคำสั่งงาน
            </h2>
            <p class="mt-0.5 text-[13px] font-medium text-[#52616a]">
              ข้อมูลแพ็กเกจและเงื่อนไขการส่งมอบ
            </p>
          </div>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-5 text-[13px]">
            <div>
              <dt class="text-[#69777f]">
                จำนวนภาพ
              </dt><dd class="mt-1 font-semibold text-[#172c3b]">
                {{ order.packageImageCount }} ภาพ
              </dd>
            </div>
            <div>
              <dt class="text-[#69777f]">
                ความละเอียด
              </dt><dd class="mt-1 font-semibold text-[#172c3b]">
                {{ order.packageResolution }}
              </dd>
            </div>
            <div>
              <dt class="text-[#69777f]">
                ประเภทงาน
              </dt><dd class="mt-1 font-semibold text-[#172c3b]">
                {{ order.workTypeName }}
              </dd>
            </div>
            <div>
              <dt class="text-[#69777f]">
                แพ็กเกจ
              </dt><dd class="mt-1 font-semibold text-[#172c3b]">
                {{ order.packageName }}
              </dd>
            </div>
          </dl>
          <div class="mt-6 pt-5 border-t border-[#172c3b]/10 space-y-4 text-[13px]">
            <div>
              <p class="text-[#69777f]">
                องค์ประกอบภาพ / รายละเอียดฉาก
              </p><p class="mt-1.5 leading-relaxed text-[#172c3b] whitespace-pre-wrap">
                {{ order.orderComposition || 'ไม่ได้ระบุองค์ประกอบเพิ่มเติม' }}
              </p>
            </div>
            <div>
              <p class="text-[#69777f]">
                หมายเหตุเพิ่มเติม
              </p><p class="mt-1.5 leading-relaxed text-[#172c3b] whitespace-pre-wrap">
                {{ order.orderNote || 'ไม่ได้ระบุหมายเหตุเพิ่มเติม' }}
              </p>
            </div>
          </div>
              </div>

              <div class="pt-8 border-t border-[#172c3b]/10">
                <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">
                ข้อมูลสำหรับการทำงาน
              </h2><p class="mt-0.5 text-[13px] font-medium text-[#52616a]">
                ความต้องการและรูปอ้างอิงจากลูกค้า
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-full border border-[#172c3b]/10 bg-[#eee7db] text-[11px] font-semibold text-[#52616a]">{{ sourceImages.length }} รูป</span>
          </div>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div class="rounded-xl border border-[#172c3b]/10 bg-[#eee7db] p-4">
              <dt class="text-[#69777f]">
                สไตล์ภาพ
              </dt><dd class="mt-1.5 font-medium text-[#172c3b]">
                {{ order.orderStyle || 'ไม่ได้ระบุ' }}
              </dd>
            </div>
            <div class="rounded-xl border border-[#172c3b]/10 bg-[#eee7db] p-4">
              <dt class="text-[#69777f]">
                โทนสี
              </dt><dd class="mt-1.5 font-medium text-[#172c3b]">
                {{ order.orderColorTone || 'ไม่ได้ระบุ' }}
              </dd>
            </div>
          </dl>
          <div
            v-if="sourceImages.length"
            class="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="image in sourceImages"
              :key="image.orderImageId"
              class="overflow-hidden rounded-xl border border-[#172c3b]/10 bg-[#fcf9f3]"
            >
              <div class="aspect-square overflow-hidden bg-[#eee7db]">
                <img
                  :src="protectedAssetUrl(orderImageEndpoint(image.orderImageId))"
                  alt="รูปอ้างอิงจากลูกค้า"
                  class="h-full w-full object-cover"
                >
              </div>
              <div class="border-t border-[#172c3b]/10 p-2">
                <button
                  type="button"
                  class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#172c3b]/10 bg-[#fcf9f3] px-2.5 py-2 text-[11px] font-semibold text-[#52616a] transition-colors hover:bg-[#eee7db] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="downloadingReferenceIds.has(image.orderImageId)"
                  @click="downloadReferenceImage(image)"
                >
                  <span
                    v-if="downloadingReferenceIds.has(image.orderImageId)"
                    class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#69777f]/30 border-t-[#52616a]"
                  />
                  {{ downloadingReferenceIds.has(image.orderImageId) ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดรูปภาพ' }}
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="mt-5 rounded-xl border border-dashed border-black/[0.08] px-4 py-8 text-center text-xs text-[#69777f]"
          >
            ลูกค้าไม่ได้อัปโหลดรูปอ้างอิงเพิ่มเติม
          </div>
              </div>
            </div>
          </section>

          <section class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div class="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#172c3b]/10">
          <div>
            <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">
              พื้นที่ผลงาน
            </h2><p class="mt-0.5 text-[13px] font-medium text-[#52616a]">
              อัปโหลดและจัดการผลงานสำหรับส่งให้ลูกค้าเลือก
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-xs font-medium text-[#52616a]">ผลงาน {{ generatedImages.length }} รูป</span>
            <button
              class="editor-primary inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#172c3b] transition-colors rounded-xl shadow-sm border border-[#172c3b]/10 whitespace-nowrap"
              @click="uploadModalOpen = true"
            >
              + อัปโหลดผลงานดราฟต์
            </button>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="!generatedImages.length"
            class="rounded-xl border border-dashed border-black/[0.08] py-10 text-center text-sm text-[#69777f]"
          >
            ยังไม่มีผลงานดราฟต์ในออเดอร์นี้
          </div>
          <div
            v-else
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3"
          >
            <article
              v-for="image in generatedImages"
              :key="image.orderImageId"
              class="group overflow-hidden rounded-2xl border border-[#ded7cb]/60 bg-[#fcf9f3] transition-all hover:border-[#172c3b]/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
            >
              <button
                class="relative block aspect-[4/3] w-full overflow-hidden border-b border-[#ded7cb]/40 bg-[#eee7db]"
                @click="detailImage = image"
              >
                <img
                  :src="protectedAssetUrl(orderImageEndpoint(image.orderImageId))"
                  alt="ผลงานดราฟต์"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                >
                <span class="absolute left-3 top-3 rounded-lg border border-[#172c3b] bg-[#172c3b] px-2 py-1 text-[9px] font-semibold text-white shadow-sm">ดราฟต์</span>
              </button>
              <div class="flex items-end justify-between gap-4 p-4">
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold text-[#69777f]">
                    เครื่องมือที่ใช้
                  </p>
                  <p class="mt-1 truncate text-[13px] font-semibold text-[#172c3b]">
                    {{ image.aiEngine || 'ไม่ได้ระบุ' }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    class="shrink-0 rounded-lg border border-[#d4a88e] bg-[#f4e2d1] px-3 py-1.5 text-[11px] font-semibold text-[#733b20] shadow-sm transition-colors hover:bg-[#edd1bb]"
                    @click="openEditModal(image)"
                  >
                    แก้ไข
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div
            v-if="selectedImages.length"
            class="mt-6 border-t border-[#172c3b]/10 pt-6"
          >
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-[#172c3b]">
                ผลงานที่ลูกค้าเลือก
              </h3>
              <span class="text-xs text-[#52616a]">{{ selectedImages.length }} รูป</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                v-for="image in selectedImages"
                :key="image.orderImageId"
                class="flex flex-col rounded-xl border border-[#172c3b]/10 bg-[#fcf9f3] overflow-hidden shadow-sm"
              >
                <a
                  href="#"
                  class="aspect-square w-full block bg-[#eee7db]"
                  @click.prevent="openProtectedAsset(orderImageEndpoint(image.orderImageId))"
                >
                  <img
                    :src="protectedAssetUrl(orderImageEndpoint(image.orderImageId))"
                    alt="ผลงานที่ลูกค้าเลือก"
                    class="h-full w-full object-cover"
                  >
                </a>
                <div class="p-3 border-t border-[#172c3b]/10 flex justify-center">
                  <button
                    class="rounded-lg border border-[#d4a88e] bg-[#f4e2d1] px-3 py-1.5 text-[11px] font-semibold text-[#733b20] shadow-sm transition-colors hover:bg-[#edd1bb] w-full"
                    @click="metadataImage = image"
                  >
                    ข้อมูล Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>

        <!-- Right Column 29% -->
        <div class="w-full lg:w-[29%] space-y-6">
          <section class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">
            ขั้นตอนการดำเนินงาน
          </h2>
          <p class="mt-0.5 text-[13px] font-medium text-[#52616a]">
            ลำดับงานตั้งแต่เริ่มผลิตจนเสร็จสมบูรณ์
          </p>
        </div>

        <div
          v-if="order.orderStatus === 'cancelled'"
          class="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-700"
        >
          คำสั่งงานนี้ถูกยกเลิก
        </div>
        <div v-else class="relative ml-4 mt-6">
          <div class="absolute left-[7px] top-2 bottom-4 w-px bg-black/[0.08]" />
          <div class="flex flex-col gap-6 relative">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.status"
              class="relative flex items-start gap-4"
            >
              <!-- Indicator Circle -->
              <div
                class="relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[#fcf9f3] mt-1"
                :class="
                  index === currentStepIndex
                    ? 'border-[#172c3b] ring-4 ring-[#172c3b]/10'
                    : index < currentStepIndex || order.orderStatus === 'completed'
                      ? 'border-[#172c3b] bg-[#172c3b]'
                      : 'border-black/[0.15]'
                "
              >
                <!-- Inner dot for active state -->
                <div v-if="index === currentStepIndex" class="h-1.5 w-1.5 rounded-full bg-[#172c3b]"></div>
              </div>

              <!-- Text Content -->
              <div class="-mt-0.5">
                <p
                  class="text-[10px] font-semibold tracking-wider uppercase"
                  :class="
                    index === currentStepIndex
                      ? 'text-[#172c3b]'
                      : index < currentStepIndex || order.orderStatus === 'completed'
                        ? 'text-[#172c3b]/60'
                        : 'text-[#69777f]'
                  "
                >
                  ขั้นตอน {{ index + 1 }}
                </p>
                <p
                  class="mt-0.5 text-[13px] font-semibold"
                  :class="
                    index === currentStepIndex
                      ? 'text-[#172c3b]'
                      : index < currentStepIndex || order.orderStatus === 'completed'
                        ? 'text-[#172c3b]'
                        : 'text-[#69777f]'
                  "
                >
                  {{ step.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>

    </template>

    <!-- Gallery Metadata Modal -->
    <GalleryMetadataModal
      v-if="metadataImage"
      :image="metadataImage"
      :order="order"
      :resolved-image-url="protectedAssetUrl(orderImageEndpoint(metadataImage.orderImageId))"
      @close="metadataImage = null"
      @saved="fetchOrderDetails"
    />

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="uploadModalOpen"
          class="editor-theme editor-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="ปิดหน้าต่าง"
            @click="closeUploadModal"
          />
          <section class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[14px] border border-[#172c3b]/10 bg-[#fcf9f3] shadow-2xl">
            <header class="flex items-start justify-between gap-4 border-b border-[#172c3b]/10 p-6 pb-4">
              <div>
                <h2 class="text-lg font-semibold text-[#172c3b]">
                  อัปโหลดผลงานดราฟต์
                </h2><p class="mt-1 text-[13px] text-[#52616a]">
                  เพิ่มผลงานพร้อมข้อมูลที่ใช้ในการสร้างภาพ
                </p>
              </div>
              <button
                class="rounded-lg p-2 text-[#52616a] hover:bg-[#eee7db]"
                aria-label="ปิด"
                @click="closeUploadModal"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-width="1.8"
                  d="M6 6l12 12M18 6L6 18"
                /></svg>
              </button>
            </header>
            <div class="overflow-y-auto bg-[#e5e9e1] p-6">
              <div
                v-if="!uploadedFileUrl"
                class="space-y-3"
              >
                <div
                  class="cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
                  :class="dragOver ? 'border-[#172c3b] bg-[#eee7db]' : 'border-black/[0.10] bg-[#fcf9f3] hover:border-black/30'"
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
                  <svg
                    class="mx-auto mb-3 h-8 w-8 text-[#69777f]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2 1.6-1.6a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  /></svg>
                  <p class="text-sm font-semibold text-[#172c3b]">
                    ลากไฟล์มาวาง หรือคลิกเพื่อเลือกภาพ
                  </p>
                  <p class="mt-1 text-xs text-[#69777f]">
                    รองรับไฟล์รูปภาพ
                  </p>
                </div>
                <p
                  v-if="uploading"
                  class="text-center text-xs font-medium text-[#52616a]"
                >
                  กำลังอัปโหลดรูปภาพ...
                </p>
              </div>
              <div
                v-else
                class="grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                <div>
                  <img
                    :src="previewUrl"
                    alt="ตัวอย่างผลงาน"
                    class="aspect-square w-full rounded-xl border border-[#172c3b]/10 bg-[#fcf9f3] object-contain"
                  ><button
                    class="mt-3 w-full text-xs font-semibold text-red-600 hover:underline"
                    @click="handleCancelUpload"
                  >
                    ยกเลิกรูปภาพนี้
                  </button>
                </div>
                <div class="space-y-4 text-xs md:col-span-2">
                  <div class="grid grid-cols-2 gap-3">
                    <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">AI Engine</span><input
                      v-model="paramsForm.aiEngine"
                      type="text"
                      class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                    ></label>
                    <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">Seed</span><input
                      v-model="paramsForm.seed"
                      type="number"
                      class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                    ></label>
                  </div>
                  <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">Positive Prompt</span><textarea
                    v-model="paramsForm.positivePrompt"
                    rows="3"
                    class="w-full resize-none rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                  /></label>
                  <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">Negative Prompt</span><textarea
                    v-model="paramsForm.negativePrompt"
                    rows="3"
                    class="w-full resize-none rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                  /></label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">CFG Scale</span><input
                      v-model="paramsForm.cfgScale"
                      type="number"
                      step="0.1"
                      class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                    ></label>
                    <label class="block"><span class="mb-1 block font-semibold text-[#52616a]">Inference Steps</span><input
                      v-model="paramsForm.steps"
                      type="number"
                      class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]"
                    ></label>
                  </div>
                </div>
              </div>
              <p
                v-if="uploadError"
                class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600"
              >
                {{ uploadError }}
              </p>
            </div>
            <footer class="flex justify-end gap-3 border-t border-[#172c3b]/10 bg-[#fcf9f3] p-6 pt-4">
              <button
                class="px-4 py-2 text-sm font-medium text-[#52616a]"
                @click="closeUploadModal"
              >
                ยกเลิก
              </button>
              <button
                class="editor-primary rounded-xl border border-transparent bg-[#172c3b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#294655] disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!uploadedFileUrl || uploading || submitting"
                @click="handleSubmitImage"
              >
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึกผลงาน' }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="detailImage"
          class="editor-theme editor-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="ปิดรายละเอียด"
            @click="detailImage = null"
          />
          <section class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[#172c3b]/10 bg-[#fcf9f3] shadow-2xl">
            <header class="sticky top-0 z-10 flex items-center justify-between border-b border-[#172c3b]/10 bg-[#fcf9f3] p-6">
              <div>
                <h2 class="text-lg font-semibold text-[#172c3b]">
                  รายละเอียดผลงาน
                </h2><p class="mt-0.5 text-xs text-[#52616a]">
                  ข้อมูลการสร้างภาพและพารามิเตอร์ของผลงานนี้
                </p>
              </div><button
                class="rounded-lg p-2 text-[#52616a] hover:bg-[#eee7db]"
                aria-label="ปิด"
                @click="detailImage = null"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-width="1.8"
                  d="M6 6l12 12M18 6L6 18"
                /></svg>
              </button>
            </header>
            <div class="space-y-5 p-6">
              <img
                :src="protectedAssetUrl(orderImageEndpoint(detailImage.orderImageId))"
                alt="ผลงานดราฟต์"
                class="max-h-72 w-full rounded-xl bg-[#eee7db] object-contain"
              >
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div
                  v-for="item in [{ label: 'Engine', value: detailImage.aiEngine }, { label: 'Seed', value: detailImage.seed }, { label: 'CFG', value: detailImage.cfgScale }, { label: 'Steps', value: detailImage.steps }]"
                  :key="item.label"
                  class="rounded-xl border border-[#172c3b]/10 bg-[#eee7db] p-3"
                >
                  <p class="text-[#69777f]">
                    {{ item.label }}
                  </p><p class="mt-1 break-words font-semibold text-[#172c3b]">
                    {{ item.value ?? '—' }}
                  </p>
                </div>
              </div>
              <div
                v-for="prompt in [{ label: 'Positive Prompt', value: detailImage.positivePrompt, key: `pos-${detailImage.orderImageId}` }, { label: 'Negative Prompt', value: detailImage.negativePrompt, key: `neg-${detailImage.orderImageId}` }]"
                :key="prompt.key"
              >
                <div class="mb-1.5 flex items-center justify-between">
                  <p class="text-xs font-semibold text-[#52616a]">
                    {{ prompt.label }}
                  </p><button
                    v-if="prompt.value"
                    class="rounded-lg border border-[#172c3b]/10 bg-[#fcf9f3] px-2.5 py-1 text-[11px] font-semibold text-[#52616a] shadow-sm transition-colors hover:bg-[#eee7db] hover:text-black"
                    @click="copyPrompt(prompt.value, prompt.key)"
                  >
                    {{ copiedKey === prompt.key ? 'คัดลอกแล้ว' : 'คัดลอก' }}
                  </button>
                </div>
                <p class="min-h-12 whitespace-pre-wrap break-words rounded-xl border border-[#172c3b]/10 bg-[#eee7db] p-3 text-xs leading-relaxed text-[#52616a]">
                  {{ prompt.value || '—' }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </Transition>

      <Transition name="history-drawer">
        <div
          v-if="historyDrawerOpen"
          class="editor-theme editor-overlay fixed inset-0 z-50 overflow-hidden"
        >
          <button
            class="history-drawer-backdrop absolute inset-0 bg-black/[0.12]"
            aria-label="ปิดประวัติการทำงาน"
            @click="historyDrawerOpen = false"
          />
          <aside class="history-drawer-panel absolute inset-y-0 right-0 flex h-dvh w-[90vw] flex-col border-l border-black/[0.07] bg-[#fcf9f3] shadow-[-10px_0_28px_rgba(0,0,0,0.07)] sm:w-[76vw] lg:w-[460px]">
            <header class="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-[#172c3b]/10 bg-[#fcf9f3] px-6 py-5">
              <div>
                <h2 class="text-lg font-semibold leading-6 text-[#172c3b]">
                  ประวัติการทำงาน
                </h2>
                <p class="mt-1 text-[13px] font-medium text-[#52616a]">
                  งาน #{{ order?.orderId ?? jobId }}
                </p>
                <p class="mt-0.5 text-xs text-[#69777f]">
                  {{ order?.workflowLogs?.length ?? 0 }} รายการกิจกรรม
                </p>
              </div><button
                class="-mr-2 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#52616a] transition-colors hover:border-[#172c3b]/10 hover:bg-[#eee7db] hover:text-[#172c3b]"
                aria-label="ปิด"
                @click="historyDrawerOpen = false"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-width="1.8"
                  d="M6 6l12 12M18 6L6 18"
                /></svg>
              </button>
            </header>
            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <p
                v-if="!order?.workflowLogs?.length"
                class="py-12 text-center text-sm text-[#69777f]"
              >
                ไม่มีข้อมูลบันทึกประวัติการเปลี่ยนสถานะ
              </p>
              <ol
                v-else
                class="space-y-0"
              >
                <li
                  v-for="(log, index) in order.workflowLogs"
                  :key="log.logId"
                  class="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3 pb-6 text-xs last:pb-0"
                >
                  <div class="relative flex justify-center">
                    <span class="relative z-[1] mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#294655]" />
                    <span
                      v-if="index < order.workflowLogs.length - 1"
                      class="absolute bottom-[-24px] top-3.5 left-1/2 w-px -translate-x-1/2 bg-black/[0.09]"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold leading-5 text-[#172c3b]">
                      {{ getStatusLabel(log.toStatus) }}
                    </p>
                    <p
                      v-if="log.logNote"
                      class="mt-1 text-[13px] leading-5 text-[#52616a]"
                    >
                      {{ log.logNote }}
                    </p>
                    <p class="mt-1.5 text-[11px] leading-4 text-[#69777f]">
                      {{ log.userFirstName ? `${log.userFirstName} ${log.userLastName || ''}`.trim() : 'ระบบอัตโนมัติ' }} ({{ getActorRoleLabel(log.userRole) }}) · {{ formatDateTime(log.changedAt) }}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </Transition>
      <EditGeneratedImageModal
        :isOpen="isEditModalOpen"
        :img="editingImage"
        :orderId="order?.orderId ?? Number(jobId)"
        @close="isEditModalOpen = false"
        @refresh="handleImageUpdated"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.history-drawer-enter-active,
.history-drawer-leave-active,
.history-drawer-enter-active .history-drawer-panel,
.history-drawer-leave-active .history-drawer-panel {
  transition-duration: 250ms;
  transition-timing-function: ease-out;
}

.history-drawer-enter-active .history-drawer-backdrop,
.history-drawer-leave-active .history-drawer-backdrop {
  transition-property: opacity;
}

.history-drawer-enter-active .history-drawer-panel,
.history-drawer-leave-active .history-drawer-panel {
  transition-property: transform;
}

.history-drawer-enter-from .history-drawer-backdrop,
.history-drawer-leave-to .history-drawer-backdrop {
  opacity: 0;
}

.history-drawer-enter-from .history-drawer-panel,
.history-drawer-leave-to .history-drawer-panel {
  transform: translateX(100%);
}
</style>
