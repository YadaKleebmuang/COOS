<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Package } from '~/types/order.types'

definePageMeta({ layout: 'default' })
useHead({
  title: 'COOS Studio — เปลี่ยนไอเดียให้เป็นภาพที่ใช่',
  meta: [
    {
      name: 'description',
      content:
        'สร้างสรรค์ภาพในสไตล์ของคุณกับ COOS Studio สำรวจผลงาน เลือกแพ็กเกจ ส่งบรีฟ และติดตามงานได้ในที่เดียว'
    }
  ]
})

interface GalleryImage {
  imageId: number
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}
const { apiFetch } = useApi()
const { publicGalleryUrl } = useProtectedAsset()
const images = ref<GalleryImage[]>([])
const packages = ref<Package[]>([])
const loading = ref(true)
const galleryError = ref(false)
const packageError = ref(false)
const failedImages = ref(new Set<number>())
const selectedCategory = ref<number | null>(null)
const selectedHeroId = ref<number | null>(null)
const selectedImage = ref<GalleryImage | null>(null)

const availableImages = computed(() =>
  images.value.filter((img) => !failedImages.value.has(img.imageId))
)
// Start with one real work per category, then fill the remaining spaces with recent work.
const showcaseImages = computed(() => {
  const seen = new Set<number | undefined>()
  const first = availableImages.value.filter((img) => {
    if (seen.has(img.workTypeId)) return false
    seen.add(img.workTypeId)
    return true
  })
  return [
    ...first,
    ...availableImages.value.filter((img) => !first.includes(img))
  ].slice(0, 6)
})
const heroImage = computed(
  () =>
    availableImages.value.find((img) => img.imageId === selectedHeroId.value) ||
    showcaseImages.value[0]
)
const categories = computed(() =>
  Array.from(
    new Map(
      availableImages.value
        .filter((img) => img.workTypeId != null)
        .map((img) => [
          img.workTypeId!,
          { id: img.workTypeId!, name: img.workTypeName || 'ผลงาน' }
        ])
    ).values()
  )
)
const visibleImages = computed(() =>
  selectedCategory.value == null
    ? showcaseImages.value
    : availableImages.value
        .filter((img) => img.workTypeId === selectedCategory.value)
        .slice(0, 6)
)
const startingPrice = computed(() =>
  packages.value.length
    ? Math.min(...packages.value.map((pkg) => Number(pkg.packagePrice)))
    : null
)
const money = (amount: number) =>
  Number(amount).toLocaleString('th-TH', { maximumFractionDigits: 2 })
const markFailed = (id: number) => {
  failedImages.value.add(id)
}

const loadData = async () => {
  if (!loading.value) loading.value = true
  galleryError.value = false
  packageError.value = false
  failedImages.value.clear()
  const [gallery, pricing] = await Promise.allSettled([
    apiFetch<GalleryImage[]>('/gallery-images'),
    apiFetch<Package[]>('/packages')
  ])
  if (gallery.status === 'fulfilled')
    images.value = gallery.value.filter((img) => img.imageId != null)
  else {
    images.value = []
    galleryError.value = true
  }
  if (pricing.status === 'fulfilled')
    packages.value = pricing.value
      .filter((pkg) => Number(pkg.packageIsActive) === 1)
      .sort((a, b) => Number(a.packagePrice) - Number(b.packagePrice))
  else {
    packages.value = []
    packageError.value = true
  }
  loading.value = false
}
onMounted(loadData)

const steps = [
  {
    title: 'เลือกภาพที่ใช่',
    text: 'หาแรงบันดาลใจจากผลงาน หรือเริ่มด้วยไอเดียของคุณเอง'
  },
  {
    title: 'เลือกแพ็กเกจ ส่งบรีฟ',
    text: 'กำหนดจำนวนภาพ แนบภาพอ้างอิง และบอกสไตล์ที่ต้องการ'
  },
  {
    title: 'ติดตามและคัดเลือก',
    text: 'ติดตามสถานะในระบบ แล้วเลือกผลงานที่ถูกใจ'
  },
  {
    title: 'รับภาพพร้อมใช้งาน',
    text: 'ชำระส่วนที่เหลือและดาวน์โหลดไฟล์เมื่อส่งมอบงาน'
  }
]
</script>

<template>
  <div class="studio-home">
    <section class="studio-hero">
      <div class="coos-shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">
            <span class="status-dot" /> YOUR IDEA. OUR STUDIO.
          </p>
          <h1>ภาพที่ใช่<br />สร้างความรู้สึก<br /><span>ได้มากกว่า.</span></h1>
          <p class="hero-description">
            เปลี่ยนไอเดียให้เป็นภาพในแบบของคุณ<br class="hidden sm:block" />
            ด้วยสตูดิโอสร้างสรรค์ภาพดิจิทัล ที่ดูแลตั้งแต่บรีฟจนถึงส่งมอบ
          </p>
          <div class="hero-actions">
            <NuxtLink
              to="/customer/orders/create"
              class="studio-button button-orange"
              >เริ่มสร้างภาพของคุณ <span aria-hidden="true">↗</span></NuxtLink
            >
            <NuxtLink to="/#packages" class="text-link light-link"
              >ดูแพ็กเกจและราคา <span aria-hidden="true">→</span></NuxtLink
            >
          </div>
          <div class="hero-proof">
            <div>
              <strong v-if="startingPrice != null"
                >฿{{ money(startingPrice) }}</strong
              ><strong v-else>เลือกได้</strong
              ><span>{{
                startingPrice != null
                  ? 'ราคาเริ่มต้น / แพ็กเกจ'
                  : 'แพ็กเกจตามสไตล์ของคุณ'
              }}</span>
            </div>
            <div>
              <strong>ครบในที่เดียว</strong
              ><span>เลือกสไตล์ · สั่งงาน · รับไฟล์</span>
            </div>
          </div>
        </div>
        <div class="hero-showcase" :aria-busy="loading">
          <div class="showcase-heading">
            <span>THE STUDIO EDIT</span
            ><span>ผลงานจาก COOS <span aria-hidden="true">↙</span></span>
          </div>
          <button
            v-if="heroImage"
            class="hero-art"
            :aria-label="`ดูรายละเอียด ${heroImage.imageTitle || heroImage.workTypeName || 'ผลงาน'}`"
            @click="selectedImage = heroImage"
          >
            <img
              :key="heroImage.imageId"
              :src="publicGalleryUrl(heroImage.imageId)"
              :alt="
                heroImage.imageTitle ||
                heroImage.workTypeName ||
                'ผลงานจาก COOS Studio'
              "
              fetchpriority="high"
              width="720"
              height="860"
              @error="markFailed(heroImage.imageId)"
            />
            <span class="art-caption"
              ><span
                ><small>{{ heroImage.workTypeName || 'COOS STUDIO' }}</small
                ><strong>{{
                  heroImage.imageTitle || 'ค้นพบสไตล์ที่เป็นคุณ'
                }}</strong></span
              ><span class="round-arrow" aria-hidden="true">↗</span></span
            >
          </button>
          <div v-else class="hero-art art-empty" role="status">
            <span class="empty-symbol" aria-hidden="true">✳</span>
            <p>
              {{
                loading
                  ? 'กำลังเปิดสตูดิโอให้คุณชม…'
                  : galleryError
                    ? 'ยังโหลดผลงานไม่ได้ในขณะนี้'
                    : 'กำลังเตรียมผลงานให้คุณค้นพบ'
              }}
            </p>
            <button
              v-if="!loading"
              class="text-link light-link"
              @click="loadData"
            >
              ลองโหลดผลงานอีกครั้ง →
            </button>
          </div>
          <div
            v-if="showcaseImages.length"
            class="hero-thumbnails"
            aria-label="เลือกผลงานตัวอย่าง"
          >
            <button
              v-for="img in showcaseImages.slice(0, 4)"
              :key="img.imageId"
              :class="{ selected: heroImage?.imageId === img.imageId }"
              :aria-pressed="heroImage?.imageId === img.imageId"
              :aria-label="`แสดง ${img.imageTitle || img.workTypeName || 'ผลงาน'}`"
              @click="selectedHeroId = img.imageId"
            >
              <img
                :src="publicGalleryUrl(img.imageId)"
                :alt="img.workTypeName || 'ผลงาน'"
                width="120"
                height="100"
                @error="markFailed(img.imageId)"
              />
            </button>
            <NuxtLink to="/gallery" class="browse-all"
              >สำรวจ<br />ทุกผลงาน <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
          <span class="studio-stamp" aria-hidden="true"
            >MADE<br />FOR YOU <span>✳</span></span
          >
        </div>
      </div>
    </section>

    <div class="benefit-strip">
      <div class="coos-shell">
        <span>สร้างสรรค์จากไอเดียของคุณ</span><i aria-hidden="true">✳</i
        ><span>เลือกสไตล์ที่ชอบ</span><i aria-hidden="true">✳</i
        ><span>ติดตามงานผ่านระบบ</span><i aria-hidden="true">✳</i
        ><span>รับไฟล์ภาพดิจิทัล</span>
      </div>
    </div>

    <section id="selected-works" class="works-section section-space">
      <div class="coos-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow">SELECTED WORKS / ผลงานของเรา</p>
            <h2>แรงบันดาลใจครั้งต่อไป<br />อาจเริ่มจากภาพนี้</h2>
          </div>
          <div class="section-intro">
            <p>
              สำรวจผลงานจากสตูดิโอ แล้วเลือกแนวที่ชอบ<br />เพื่อเริ่มสร้างภาพในแบบของคุณ
            </p>
            <NuxtLink to="/gallery" class="text-link"
              >ดูผลงานทั้งหมด <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
        </div>
        <div
          v-if="categories.length"
          class="category-tabs"
          aria-label="กรองประเภทผลงาน"
        >
          <button
            :aria-pressed="selectedCategory === null"
            :class="{ active: selectedCategory === null }"
            @click="selectedCategory = null"
          >
            รวมแรงบันดาลใจ
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            :aria-pressed="selectedCategory === category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>
        <div
          v-if="loading"
          class="work-grid"
          aria-label="กำลังโหลดผลงาน"
          aria-busy="true"
        >
          <div v-for="n in 3" :key="n" class="work-skeleton" />
        </div>
        <div v-else-if="visibleImages.length" class="work-grid">
          <button
            v-for="(img, index) in visibleImages"
            :key="img.imageId"
            class="work-card"
            @click="selectedImage = img"
          >
            <span class="work-photo"
              ><img
                :src="publicGalleryUrl(img.imageId)"
                :alt="img.imageTitle || img.workTypeName || 'ผลงานจากสตูดิโอ'"
                loading="lazy"
                width="600"
                height="720"
                @error="markFailed(img.imageId)"
              /><span class="work-category">{{
                img.workTypeName || 'ผลงานสร้างสรรค์'
              }}</span
              ><span class="work-open" aria-hidden="true">↗</span></span
            >
            <span class="work-info"
              ><span
                ><small
                  >COOS COLLECTION /
                  {{ String(index + 1).padStart(2, '0') }}</small
                ><strong>{{
                  img.imageTitle || img.workTypeName || 'ผลงานจากสตูดิโอ'
                }}</strong></span
              ><span class="work-action">ดูรายละเอียด →</span></span
            >
          </button>
        </div>
        <div v-else class="empty-panel" role="status">
          <h3>
            {{
              galleryError
                ? 'ยังโหลดผลงานไม่ได้'
                : 'ยังไม่มีผลงานที่แสดงได้ในหมวดนี้'
            }}
          </h3>
          <p>
            {{
              galleryError
                ? 'ลองโหลดอีกครั้งเพื่อดูผลงานจากสตูดิโอ'
                : 'คุณสามารถเริ่มสั่งงานด้วยไอเดียและภาพอ้างอิงของคุณเองได้'
            }}
          </p>
          <button class="text-link" @click="loadData">
            โหลดผลงานอีกครั้ง →
          </button>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="process-section section-space">
      <div class="coos-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow">FROM IDEA TO IMAGE</p>
            <h2>คุณมีไอเดีย<br />เราช่วยทำให้เป็นภาพ</h2>
          </div>
          <p class="section-intro">
            ไม่ต้องเริ่มจากศูนย์ เลือกแนวภาพที่ชอบ<br />แล้วส่งรายละเอียดให้ทีมสร้างสรรค์ดูแลต่อ
          </p>
        </div>
        <div class="process-grid">
          <article v-for="(step, index) in steps" :key="step.title">
            <span class="step-number">0{{ index + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
        <NuxtLink to="/customer/orders/create" class="text-link"
          >เริ่มต้นด้วยไอเดียของคุณ <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </section>

    <section id="packages" class="pricing-section section-space">
      <div class="coos-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow">A PLAN FOR YOUR NEXT IDEA</p>
            <h2>เลือกแพ็กเกจที่ใช่<br />ให้ไอเดียไปได้ไกลขึ้น</h2>
          </div>
          <p class="section-intro">
            เปรียบเทียบจำนวนภาพ ความละเอียด และเวลาส่งมอบ<br />เลือกให้พอดีกับงานและงบประมาณของคุณ
          </p>
        </div>
        <div
          v-if="loading"
          class="pricing-grid"
          aria-label="กำลังโหลดแพ็กเกจ"
          aria-busy="true"
        >
          <div v-for="n in 3" :key="n" class="price-skeleton" />
        </div>
        <div v-else-if="packages.length" class="pricing-grid">
          <article
            v-for="(pkg, index) in packages"
            :key="pkg.packageId"
            class="price-card"
            :class="{ 'price-featured': index === 1 }"
          >
            <p class="package-index">
              PACKAGE / {{ String(index + 1).padStart(2, '0') }}
              <span aria-hidden="true">↗</span>
            </p>
            <h3>{{ pkg.packageName }}</h3>
            <p class="package-description">
              {{
                pkg.packageDescription ||
                'สร้างสรรค์ภาพตามสไตล์และรายละเอียดที่คุณเลือก'
              }}
            </p>
            <p class="package-price">
              ฿{{ money(pkg.packagePrice) }} <span>/ แพ็กเกจ</span>
            </p>
            <ul class="package-features">
              <li>
                <span>ภาพส่งมอบ</span
                ><strong>{{ pkg.packageImageCount }} ภาพ</strong>
              </li>
              <li>
                <span>ความละเอียด</span
                ><strong>{{
                  pkg.packageResolution === 'FullHD'
                    ? 'Full HD'
                    : pkg.packageResolution
                }}</strong>
              </li>
              <li>
                <span>ระยะเวลาส่งมอบ</span
                ><strong>{{ pkg.packageDeliveryDays }} วัน</strong>
              </li>
            </ul>
            <p
              v-if="Number(pkg.packageGalleryDiscount) > 0"
              class="package-discount"
            >
              ลด {{ money(pkg.packageGalleryDiscount) }}%
              เมื่ออนุญาตให้เผยแพร่ในแกลเลอรี
            </p>
            <NuxtLink
              :to="`/customer/orders/create?packageId=${pkg.packageId}`"
              class="studio-button"
              :class="index === 1 ? 'button-orange' : 'button-navy'"
              >เลือกแพ็กเกจนี้ <span aria-hidden="true">→</span></NuxtLink
            >
          </article>
        </div>
        <div v-else class="empty-panel" role="status">
          <h3>
            {{
              packageError
                ? 'ยังโหลดแพ็กเกจไม่ได้'
                : 'ยังไม่มีแพ็กเกจที่เปิดให้บริการ'
            }}
          </h3>
          <p>กรุณาลองใหม่อีกครั้งเพื่อดูราคาและรายละเอียดล่าสุด</p>
          <button class="text-link" @click="loadData">
            โหลดแพ็กเกจอีกครั้ง →
          </button>
        </div>
      </div>
    </section>

    <section class="closing-section">
      <div class="coos-shell closing-content">
        <div>
          <p class="eyebrow">LET’S MAKE SOMETHING YOU LOVE.</p>
          <h2>ถึงตาสร้างภาพ<br /><span>ในแบบของคุณแล้ว.</span></h2>
          <p>นำไอเดียมา แล้วมาเริ่มสร้างสรรค์ไปด้วยกัน</p>
          <NuxtLink
            to="/customer/orders/create"
            class="studio-button button-orange"
            >เริ่มสั่งงานกับ COOS <span aria-hidden="true">↗</span></NuxtLink
          >
        </div>
        <div class="closing-mark" aria-hidden="true">✳</div>
      </div>
    </section>
    <GalleryDetailsModal
      :img="selectedImage"
      :is-open="selectedImage !== null"
      @close="selectedImage = null"
    />
  </div>
</template>

<style scoped>
.studio-home {
  --navy: #172c3b;
  --orange: #ff955e;
  --cream: #f5f0e7;
  background: var(--cream);
  color: var(--navy);
}
.studio-home :is(button, a):focus-visible {
  outline: 3px solid #d7642c;
  outline-offset: 5px;
}
.studio-hero {
  background: var(--navy);
  color: var(--cream);
  padding: 146px 0 64px;
  overflow: hidden;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 70px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.15em;
  font-weight: 700;
  line-height: 1.8;
}
.hero-copy .eyebrow {
  color: #d2ddd9;
  display: flex;
  gap: 10px;
  align-items: center;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--orange);
}
h1 {
  font-size: clamp(44px, 4.6vw, 68px);
  font-weight: 600;
  line-height: 1.28;
  letter-spacing: -0.045em;
  margin: 26px 0;
}
h1 > span {
  color: var(--orange);
}
.hero-description {
  color: #c7d2d7;
  line-height: 1.9;
  font-size: 15px;
  max-width: 480px;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 30px;
}
.studio-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 26px;
  padding: 16px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 0.2s,
    background 0.2s;
}
.studio-button:hover {
  transform: translateY(-3px);
}
.button-orange {
  background: var(--orange);
  color: #182c3a;
}
.button-orange:hover {
  background: #ffae84;
}
.button-navy {
  background: var(--navy);
  color: #fff;
}
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 0;
  border-bottom: 1px solid currentColor;
}
.light-link {
  color: #e4e9e7;
}
.hero-proof {
  display: flex;
  gap: 28px;
  border-top: 1px solid #ffffff26;
  margin-top: 40px;
  padding-top: 24px;
}
.hero-proof > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hero-proof > div + div {
  border-left: 1px solid #ffffff26;
  padding-left: 28px;
}
.hero-proof strong {
  font-size: 21px;
  font-weight: 600;
}
.hero-proof span {
  font-size: 11px;
  color: #c7d2d7;
}
.hero-showcase {
  position: relative;
  min-width: 0;
}
.showcase-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 13px;
  color: #c7d2d7;
  font-size: 10px;
  letter-spacing: 0.1em;
}
.hero-art {
  display: block;
  width: 100%;
  aspect-ratio: 1.12;
  position: relative;
  border-radius: 80px 10px 10px 10px;
  background: #284555;
  overflow: hidden;
  text-align: left;
}
.hero-art > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  transition: transform 0.5s;
}
.hero-art:hover > img {
  transform: scale(1.025);
}
.art-caption {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 45px 26px 24px;
  color: #fff;
  background: linear-gradient(transparent, #091722e6);
}
.art-caption small {
  display: block;
  font-size: 11px;
  margin-bottom: 6px;
}
.art-caption strong {
  font-size: 18px;
  line-height: 1.5;
}
.round-arrow {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #ffffff70;
  border-radius: 50%;
}
.hero-thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.hero-thumbnails button {
  width: 18%;
  height: 66px;
  border-radius: 6px;
  overflow: hidden;
  opacity: 0.65;
  border: 2px solid transparent;
}
.hero-thumbnails button.selected {
  opacity: 1;
  border-color: var(--orange);
}
.hero-thumbnails img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.browse-all {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  font-size: 11px;
  line-height: 1.8;
}
.studio-stamp {
  position: absolute;
  top: -18px;
  right: -23px;
  background: var(--orange);
  color: var(--navy);
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transform: rotate(12deg);
  font-size: 10px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.07em;
  border: 5px solid var(--navy);
}
.studio-stamp span {
  font-size: 22px;
}
.art-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 28px;
  font-size: 14px;
  gap: 14px;
}
.empty-symbol {
  font-size: 100px;
  color: var(--orange);
}
.benefit-strip {
  background: #e4ae83;
  padding: 22px 0;
}
.benefit-strip > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  font-weight: 600;
}
.benefit-strip i {
  font-size: 20px;
  font-style: normal;
}
.section-space {
  padding: 88px 0;
  scroll-margin-top: 100px;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 32px;
  margin-bottom: 36px;
}
.section-heading .eyebrow {
  color: #8a492d;
  margin-bottom: 16px;
}
h2 {
  font-size: clamp(30px, 3.1vw, 44px);
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.035em;
}
.section-intro {
  font-size: 14px;
  line-height: 1.9;
  color: #52616a;
  max-width: 390px;
}
.section-intro .text-link {
  margin-top: 14px;
  color: var(--navy);
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}
.category-tabs button {
  padding: 10px 18px;
  border: 1px solid #172c3b28;
  border-radius: 24px;
  font-size: 12px;
  transition: background 0.2s;
}
.category-tabs button:hover {
  background: #e6dfd4;
}
.category-tabs button.active {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}
.work-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px 24px;
}
.work-card {
  text-align: left;
  min-width: 0;
}
.work-photo {
  display: block;
  position: relative;
  aspect-ratio: 4/4.7;
  overflow: hidden;
  border-radius: 12px;
  background: #ddd5c8;
}
.work-photo img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.work-card:hover img {
  transform: scale(1.045);
}
.work-category {
  position: absolute;
  left: 16px;
  top: 16px;
  border-radius: 20px;
  background: #fff9f0f2;
  padding: 6px 12px;
  font-size: 10px;
}
.work-open {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: var(--cream);
  border-radius: 50%;
  font-size: 20px;
}
.work-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 0 0;
}
.work-info small {
  display: block;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: #68757c;
  margin-bottom: 6px;
}
.work-info strong {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
}
.work-action {
  font-size: 10px;
  white-space: nowrap;
}
.process-section {
  background: #e3e9e2;
}
.process-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 40px 0 24px;
}
.process-grid article {
  border-top: 1px solid #172c3b35;
  padding: 22px 24px 8px 0;
}
.step-number {
  display: inline-block;
  color: #557564;
  font-size: 35px;
  font-weight: 500;
  margin-bottom: 26px;
}
.process-grid h3 {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
}
.process-grid p {
  color: #52616a;
  font-size: 13px;
  line-height: 1.9;
  max-width: 240px;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 20px;
}
.price-card {
  padding: 30px;
  border: 1px solid #172c3b24;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  background: #fcf9f3;
}
.price-featured {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}
.package-index {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.12em;
  margin-bottom: 24px;
}
.package-index span {
  font-size: 20px;
}
.price-card h3 {
  font-size: 27px;
  font-weight: 600;
}
.package-description {
  font-size: 12px;
  line-height: 1.8;
  opacity: 0.8;
  margin-top: 10px;
}
.package-price {
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin: 28px 0;
}
.package-price span {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: normal;
  opacity: 0.75;
  white-space: nowrap;
}
.package-features {
  border-top: 1px solid #172c3b24;
  padding-top: 10px;
  margin-bottom: 22px;
}
.price-featured .package-features {
  border-color: #ffffff35;
}
.package-features li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  font-size: 12px;
}
.package-features strong {
  font-weight: 600;
}
.package-discount {
  font-size: 11px;
  line-height: 1.8;
  margin-bottom: 24px;
}
.price-card .studio-button {
  margin-top: auto;
  width: 100%;
}
.closing-section {
  background: var(--navy);
  color: var(--cream);
  padding: 72px 0;
  overflow: hidden;
}
.closing-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}
.closing-section .eyebrow {
  color: #c7d2d7;
  margin-bottom: 18px;
}
.closing-section h2 {
  font-size: clamp(34px, 4vw, 56px);
}
.closing-section h2 span {
  color: var(--orange);
}
.closing-section p:not(.eyebrow) {
  color: #c7d2d7;
  margin: 20px 0 26px;
  font-size: 14px;
}
.closing-mark {
  color: var(--orange);
  font-size: 300px;
  line-height: 1;
  padding-right: 40px;
}
.empty-panel {
  padding: 50px 24px;
  text-align: center;
  border: 1px dashed #172c3b40;
  border-radius: 12px;
}
.empty-panel h3 {
  font-size: 18px;
  font-weight: 600;
}
.empty-panel p {
  margin: 12px 0;
  font-size: 14px;
  color: #52616a;
}
.work-skeleton,
.price-skeleton {
  background: #e6dfd4;
  border-radius: 12px;
  min-height: 320px;
}
@media (max-width: 1023px) {
  .hero-grid {
    gap: 36px;
  }
  .hero-proof {
    gap: 18px;
  }
  .hero-proof > div + div {
    padding-left: 18px;
  }
  .hero-proof strong {
    font-size: 18px;
  }
  .studio-stamp {
    right: -12px;
  }
  .work-action {
    display: none;
  }
  .process-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .closing-mark {
    font-size: 220px;
    padding-right: 0;
  }
}
@media (max-width: 767px) {
  .studio-hero {
    padding: 116px 0 40px;
  }
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  h1 {
    font-size: 48px;
  }
  .hero-description {
    font-size: 14px;
  }
  .hero-proof {
    margin-top: 28px;
  }
  .hero-showcase {
    margin: 0 8px;
  }
  .hero-art {
    aspect-ratio: 1;
  }
  .benefit-strip > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: 11px;
    text-align: center;
  }
  .benefit-strip i {
    display: none;
  }
  .section-space {
    padding: 56px 0;
  }
  .section-heading {
    flex-direction: column;
    align-items: start;
    gap: 20px;
    margin-bottom: 28px;
  }
  .work-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 14px;
  }
  .work-info {
    padding-top: 12px;
  }
  .work-info strong {
    font-size: 13px;
  }
  .work-info small {
    font-size: 8px;
  }
  .work-category {
    top: 10px;
    left: 10px;
    font-size: 9px;
    padding: 5px 9px;
  }
  .work-open {
    width: 30px;
    height: 30px;
    bottom: 10px;
    right: 10px;
  }
  .process-grid article {
    padding-right: 10px;
  }
  .process-grid h3 {
    font-size: 15px;
  }
  .step-number {
    margin-bottom: 16px;
  }
  .closing-mark {
    display: none;
  }
  .closing-section {
    padding: 56px 0;
  }
}
@media (max-width: 359px) {
  h1 {
    font-size: 40px;
  }
  .hero-proof {
    gap: 12px;
  }
  .hero-proof > div + div {
    padding-left: 12px;
  }
  .hero-proof strong {
    font-size: 16px;
  }
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  .price-card {
    padding: 22px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>
