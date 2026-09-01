<script setup lang="ts">
import type { WorkType, Package } from '~/types/order.types'

defineProps<{
  form: {
    orderStyle: string
    orderColorTone: string
    orderComposition: string
    orderNote: string
    orderRequiredDate: string
    orderIsUrgent: boolean
    orderIsGalleryAllowed: boolean
  }
  selectedWorkType: WorkType | undefined
  selectedPackage: Package | undefined
  sourceImages: string[]
  pricePreview: { base: number, urgent: number, discount: number, total: number }
  modelValue: boolean // acceptedDisclaimer
  submitError: string
}>()

defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-[20px] font-semibold leading-tight text-[#171717]">
        ตรวจสอบ & ยืนยัน
      </h2>
      <p class="mt-1 text-[13px] font-medium text-[#666666]">
        กรุณาตรวจสอบข้อมูลก่อนกดยืนยัน
      </p>
    </div>

    <div class="space-y-4">
      <!-- Work Type & Package -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="rounded-[20px] border border-black/5 bg-white/60 p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
          <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
            ประเภทงาน
          </p>
          <p class="text-[16px] font-bold text-[#171717]">
            {{ selectedWorkType?.workTypeName }}
          </p>
        </div>

        <div class="rounded-[20px] border border-black/5 bg-white/60 p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
          <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
            แพ็กเกจ
          </p>
          <p class="text-[16px] font-bold text-[#171717]">
            {{ selectedPackage?.packageName }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2 text-[12px] font-bold text-[#666666]">
            <span class="rounded-full border border-black/5 bg-white/80 px-3 py-1">{{ selectedPackage?.packageImageCount }} ภาพ</span>
            <span class="rounded-full border border-black/5 bg-white/80 px-3 py-1">{{ selectedPackage?.packageResolution }}</span>
            <span class="rounded-full border border-black/5 bg-white/80 px-3 py-1">ส่งงานใน {{ selectedPackage?.packageDeliveryDays }} วัน</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="rounded-[20px] border border-black/5 bg-white/60 p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
          รายละเอียดงาน
        </p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-if="form.orderStyle"
            class="rounded-[14px] border border-black/5 bg-white/80 p-4"
          >
            <span class="block text-[12px] font-medium text-[#666666]">สไตล์</span>
            <span class="mt-0.5 block text-[14px] font-bold text-[#171717]">{{ form.orderStyle }}</span>
          </div>
          <div
            v-if="form.orderColorTone"
            class="rounded-[14px] border border-black/5 bg-white/80 p-4"
          >
            <span class="block text-[12px] font-medium text-[#666666]">โทนสี</span>
            <span class="mt-0.5 block text-[14px] font-bold text-[#171717]">{{ form.orderColorTone }}</span>
          </div>
          <div
            v-if="form.orderComposition"
            class="rounded-[14px] border border-black/5 bg-white/80 p-4 sm:col-span-2"
          >
            <span class="block text-[12px] font-medium text-[#666666]">องค์ประกอบฉาก</span>
            <span class="mt-0.5 block whitespace-pre-line text-[14px] font-bold leading-relaxed text-[#171717]">{{ form.orderComposition }}</span>
          </div>
          <div
            v-if="form.orderNote"
            class="rounded-[14px] border border-black/5 bg-white/80 p-4 sm:col-span-2"
          >
            <span class="block text-[12px] font-medium text-[#666666]">หมายเหตุ</span>
            <span class="mt-0.5 block whitespace-pre-line text-[14px] font-bold leading-relaxed text-[#171717]">{{ form.orderNote }}</span>
          </div>
          <div
            v-if="!form.orderStyle && !form.orderColorTone && !form.orderComposition && !form.orderNote"
            class="rounded-[14px] border border-dashed border-black/10 bg-transparent p-4 text-[13px] font-medium text-[#666666] sm:col-span-2"
          >
            ไม่ได้ระบุรายละเอียดเพิ่มเติม
          </div>
        </div>

        <!-- Attributes Grid -->
        <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-[14px] border border-black/5 bg-white/80 p-4">
            <span class="block text-[12px] font-medium text-[#666666]">วันรับงาน</span>
            <span class="mt-0.5 block text-[14px] font-bold text-[#171717]">{{ formatDate(form.orderRequiredDate) }}</span>
          </div>
          <div class="rounded-[14px] border border-black/5 bg-white/80 p-4">
            <span class="block text-[12px] font-medium text-[#666666]">ความเร่งด่วน</span>
            <div class="mt-2 flex items-center">
              <span
                v-if="form.orderIsUrgent"
                class="inline-flex items-center rounded-full border border-[#9A6812]/20 bg-[#FFF7E6] px-2.5 py-0.5 text-[12px] font-bold text-[#9A6812]"
              >
                เร่งด่วน
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full border border-black/10 bg-[#f8f8f8] px-2.5 py-0.5 text-[12px] font-bold text-[#666666]"
              >
                ปกติ
              </span>
            </div>
          </div>
          <div class="rounded-[14px] border border-black/5 bg-white/80 p-4">
            <span class="block text-[12px] font-medium text-[#666666]">การแสดงใน Gallery</span>
            <div class="mt-2 flex items-center">
              <span
                v-if="form.orderIsGalleryAllowed"
                class="inline-flex items-center rounded-full border border-[#267A48]/20 bg-[#EDF8F1] px-2.5 py-0.5 text-[12px] font-bold text-[#267A48]"
              >
                อนุญาต
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full border border-black/10 bg-[#f8f8f8] px-2.5 py-0.5 text-[12px] font-bold text-[#666666]"
              >
                ไม่อนุญาต
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Images -->
      <div class="rounded-[20px] border border-black/5 bg-white/60 p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
        <div class="mb-4 flex items-center justify-between gap-4">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#929292]">
            รูปต้นฉบับ
          </p>
          <span class="text-[12px] font-bold text-[#666666]">{{ sourceImages.length }} รูป</span>
        </div>
        <div
          v-if="sourceImages.length > 0"
          class="grid gap-3"
          :class="sourceImages.length === 1 ? 'max-w-[200px] grid-cols-1' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5'"
        >
          <a
            v-for="(url, idx) in sourceImages"
            :key="url"
            :href="url"
            target="_blank"
            class="overflow-hidden rounded-[14px] border border-black/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            :class="sourceImages.length === 1 ? 'aspect-[4/3]' : 'aspect-square'"
          >
            <img
              :src="url"
              :alt="`รูปต้นฉบับหรือรูปอ้างอิง ${idx + 1}`"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            >
          </a>
        </div>
        <p
          v-else
          class="rounded-[14px] border border-dashed border-black/10 bg-transparent p-4 text-[13px] font-medium text-[#666666]"
        >
          ไม่มีรูปต้นฉบับหรือรูปอ้างอิงแนบมากับคำสั่งงานนี้
        </p>
      </div>

      <!-- Pricing -->
      <div class="rounded-[20px] border border-black/5 bg-white/80 p-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
        <p class="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#929292]">
          สรุปราคา
        </p>
        <div class="space-y-2 text-[13px] font-medium">
          <div class="flex justify-between gap-4">
            <span class="text-[#666666]">ราคาแพ็กเกจ ({{ selectedPackage?.packageName }})</span>
            <span class="font-bold text-[#171717]">฿{{ formatPrice(pricePreview.base) }}</span>
          </div>
          <div
            v-if="pricePreview.urgent > 0"
            class="flex justify-between gap-4 text-[#171717]"
          >
            <span>ค่าเร่งด่วน</span>
            <span class="font-bold">+฿{{ formatPrice(pricePreview.urgent) }}</span>
          </div>
          <div
            v-if="pricePreview.discount > 0"
            class="flex justify-between gap-4 text-[#267A48]"
          >
            <span>ส่วนลด Gallery ({{ selectedPackage?.packageGalleryDiscount }}%)</span>
            <span class="font-bold">-฿{{ formatPrice(pricePreview.discount) }}</span>
          </div>
          <hr class="my-3 border-black/5">
          <div class="flex justify-between gap-4 text-[18px] font-bold text-[#171717]">
            <span>รวมทั้งหมด</span>
            <span>฿{{ formatPrice(pricePreview.total) }}</span>
          </div>
        </div>
        <p class="mt-3 text-[12px] font-medium text-[#929292]">
          * ราคาสุทธิจะถูกคำนวณอีกครั้งโดยระบบเมื่อยืนยัน
        </p>
      </div>

      <!-- Disclaimers -->
      <div class="space-y-4 border-t border-black/5 pt-6">
        <h3 class="text-[14px] font-bold text-[#171717]">
          ข้อตกลงและเงื่อนไขการใช้บริการ
        </h3>

        <div class="rounded-[16px] border border-black/5 bg-white/60 p-5 text-left text-[12px] leading-relaxed text-[#666666]">
          <p class="mb-1 font-bold text-[#171717]">
            นโยบายความเป็นส่วนตัว (Privacy Policy)
          </p>
          <p>รูปภาพต้นฉบับที่ท่านอัปโหลดเข้าระบบ จะถูกนำไปใช้เพื่อการประมวลผลและการตกแต่งภาพตามสั่งเท่านั้น ทางเราจะเก็บรักษาไฟล์ของท่านไว้เป็นความลับ และลบออกจากฐานข้อมูลภายใน 30 วันหลังจากออเดอร์เสร็จสิ้น</p>
        </div>

        <div class="rounded-[16px] border border-black/5 bg-white/60 p-5 text-left text-[12px] leading-relaxed text-[#666666]">
          <p class="mb-1 font-bold text-[#171717]">
            ข้อจำกัดความรับผิดชอบและลิขสิทธิ์ AI (AI Disclaimer)
          </p>
          <p>ผลงานภาพชิ้นนี้มีการใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) ในกระบวนการสร้างสรรค์ร่วมกับงานฝีมือของศิลปิน ลิขสิทธิ์ของภาพผลงานขั้นสุดท้ายจะถูกโอนย้ายให้เป็นของท่าน แต่ทางระบบขอสงวนสิทธิ์การนำผลงานไปโชว์ใน Portfolio/Gallery หากท่านได้เลือกรับส่วนลด</p>
        </div>

        <label class="mt-3 flex cursor-pointer items-start gap-3 text-left">
          <input
            type="checkbox"
            :checked="modelValue"
            class="mt-1 h-4 w-4 cursor-pointer appearance-none rounded border border-black/20 bg-white text-[#171717] transition checked:border-[#171717] checked:bg-[#171717] checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 focus:ring-offset-1"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
          >
          <span class="select-none text-[13px] font-medium leading-[1.6] text-[#666666]">
            ข้าพเจ้าได้อ่าน เข้าใจ และยอมรับนโยบายความเป็นส่วนตัวและข้อตกลงเกี่ยวกับผลงาน AI เรียบร้อยแล้ว
          </span>
        </label>
      </div>

      <div
        v-if="submitError"
        class="rounded-xl bg-[#FDEEEE]/80 p-4"
      >
        <p class="text-[13px] font-bold text-[#B93B3B]">
          {{ submitError }}
        </p>
      </div>
    </div>
  </div>
</template>
