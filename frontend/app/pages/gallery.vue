<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import type { WorkType } from '~/types/order.types'

definePageMeta({
  layout: 'default'
})

const token = useCookie<string | null>('token')
const { apiFetch } = useApi()
const { publicGalleryUrl } = useProtectedAsset()
useHead({ title: 'แกลเลอรีผลงาน — COOS Studio' })

type PublicUser = {
  userFirstName?: string
  userLastName?: string
  userEmail?: string
}

type GalleryImage = {
  imageId?: number | string
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
  orderStyle?: string
  orderColorTone?: string
  orderComposition?: string
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

// --- Auth & User State ---
const currentUser = ref<PublicUser | null>(null)
const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<PublicUser>('/users/me')
      currentUser.value = data
    } catch (err) {
      console.error('Auth check failed:', err)
      token.value = null // Clear invalid token
      currentUser.value = null
    }
  }
}

// --- Gallery & Category State ---
const images = ref<GalleryImage[]>([])
const workTypes = ref<Pick<WorkType, 'workTypeId' | 'workTypeName'>[]>([])
const loading = ref(false)
const error = ref('')

const selectedImage = ref<GalleryImage | null>(null)
const isDetailsModalOpen = ref(false)

const openDetails = (img: GalleryImage) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

// Search, Filter & Tag State
const search = ref('')
const selectedWorkTypeId = ref<number | null>(null) // null means "ทั้งหมด"
const selectedTag = ref<string | null>(null)
const sortBy = ref('newest') // newest, oldest

const availableTags = ref<string[]>([])

const toggleTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = null
  } else {
    selectedTag.value = tag
  }
}

// Pagination
const route = useRoute()
const router = useRouter()
const currentPage = ref(parseInt(route.query.page as string) || 1)
const itemsPerPage = 16

const updateUrl = () => {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value === 1 ? undefined : currentPage.value
    }
  })
}

// Reset pagination when filters change
watch([search, selectedWorkTypeId, selectedTag, sortBy], () => {
  currentPage.value = 1
  updateUrl()
})

watch(currentPage, () => {
  updateUrl()
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [imgData, wtData, tagsData] = await Promise.all([
      apiFetch<GalleryImage[]>('/gallery-images'),
      apiFetch<WorkType[]>('/work-types').catch(() => []),
      apiFetch<string[]>('/gallery-images/tags').catch(() => [])
    ])
    images.value = imgData

    if (wtData && wtData.length > 0) {
      workTypes.value = wtData.filter((wt) => wt.workTypeIsActive === 1)
    } else {
      // Keep categories grounded in the public gallery if category loading fails.
      workTypes.value = Array.from(
        new Map(
          imgData
            .filter((img) => img.workTypeId != null && img.workTypeName)
            .map((img) => [
              img.workTypeId!,
              { workTypeId: img.workTypeId!, workTypeName: img.workTypeName! }
            ])
        ).values()
      )
    }

    availableTags.value = tagsData.length
      ? tagsData
      : Array.from(
          new Set(
            imgData.flatMap(
              (img) =>
                img.imageTags
                  ?.split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean) || []
            )
          )
        )
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลแกลเลอรีได้')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAuth()
  await loadData()
})

// --- Computed Filters & Sorting ---
const filteredImages = computed(() => {
  let result = images.value

  // Filter by category
  if (selectedWorkTypeId.value !== null) {
    result = result.filter((img) => img.workTypeId === selectedWorkTypeId.value)
  }

  // Filter by hashtag
  if (selectedTag.value) {
    const active = selectedTag.value.toLowerCase()
    result = result.filter((img) =>
      img.imageTags
        ?.toLowerCase()
        .split(',')
        .map((t: string) => t.trim())
        .includes(active)
    )
  }

  // Filter by search query
  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    result = result.filter(
      (img) =>
        img.imageTitle?.toLowerCase().includes(query) ||
        img.imageDescription?.toLowerCase().includes(query) ||
        img.imageTags?.toLowerCase().includes(query) ||
        img.workTypeName?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  const sorted = [...result]
  if (sortBy.value === 'oldest') {
    return sorted.reverse()
  }

  return sorted
})

// --- Category Tabs ---
const categoryTabs = computed(() => {
  return [
    { id: null, name: 'ทั้งหมด' },
    ...workTypes.value.map((wt) => ({
      id: wt.workTypeId,
      name: wt.workTypeName.replace(/\s*\(.*\)/, '') // Clean up text, e.g. "ครอบครัว (Family)" -> "ครอบครัว"
    }))
  ]
})

// --- Paginated Images ---
const totalPages = computed(() =>
  Math.ceil(filteredImages.value.length / itemsPerPage)
)

const displayedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredImages.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
const hasFilters = computed(() =>
  Boolean(
    search.value.trim() ||
    selectedWorkTypeId.value !== null ||
    selectedTag.value
  )
)
const clearFilters = () => {
  search.value = ''
  selectedWorkTypeId.value = null
  selectedTag.value = null
}
const failedHeroImages = ref(new Set<number | string>())
const heroImages = computed(() => {
  const seen = new Set<number | undefined>()
  return images.value
    .filter((img) => {
      if (
        img.imageId == null ||
        failedHeroImages.value.has(img.imageId) ||
        seen.has(img.workTypeId)
      )
        return false
      seen.add(img.workTypeId)
      return true
    })
    .slice(0, 2)
})
</script>

<template>
  <div class="gallery-page">
    <section class="gallery-hero">
      <div class="coos-shell hero-layout">
        <div class="hero-copy">
          <NuxtLink to="/" class="back-link"
            >หน้าแรก <span aria-hidden="true">/</span> แกลเลอรี</NuxtLink
          >
          <p class="eyebrow">THE COOS COLLECTION</p>
          <h1>ค้นพบภาพที่ชอบ<br /><span>ต่อยอดเป็นสไตล์คุณ.</span></h1>
          <p class="hero-description">
            ทุกภาพคือจุดเริ่มต้นของไอเดียใหม่ สำรวจผลงานจากสตูดิโอ<br
              class="hidden sm:block"
            />
            เลือกแนวที่ถูกใจ แล้วให้เราสร้างสรรค์ภาพในแบบของคุณ
          </p>
          <div class="hero-actions">
            <a href="#gallery-results" class="gallery-button button-orange"
              >สำรวจผลงาน <span aria-hidden="true">↘</span></a
            ><NuxtLink to="/#packages" class="hero-price-link"
              >ดูแพ็กเกจและราคา →</NuxtLink
            >
          </div>
        </div>
        <div
          v-if="heroImages.length"
          class="hero-collection"
          aria-label="ตัวอย่างผลงานจากสตูดิโอ"
        >
          <button
            v-for="img in heroImages"
            :key="img.imageId"
            class="hero-photo"
            :aria-label="`ดูรายละเอียด ${img.imageTitle || img.workTypeName}`"
            @click="openDetails(img)"
          >
            <img
              :src="publicGalleryUrl(img.imageId!)"
              :alt="img.imageTitle || img.workTypeName || 'ผลงานจากสตูดิโอ'"
              width="360"
              height="480"
              @error="failedHeroImages.add(img.imageId!)"
            />
            <span
              >{{ img.workTypeName }} <span aria-hidden="true">↗</span></span
            >
          </button>
          <span class="collection-note">YOUR NEXT INSPIRATION ↗</span>
        </div>
        <div v-else class="hero-mark" aria-hidden="true">✳</div>
      </div>
    </section>
    <div class="gallery-ribbon">
      <div class="coos-shell">
        <span>เลือกภาพที่ชอบ</span><span aria-hidden="true">✳</span
        ><span>ส่งไอเดียของคุณ</span><span aria-hidden="true">✳</span
        ><span>สร้างผลงานไปด้วยกัน</span>
      </div>
    </div>

    <section id="gallery-results" class="gallery-content coos-shell">
      <div class="collection-heading">
        <div>
          <p class="eyebrow">EXPLORE THE COLLECTION</p>
          <h2>สไตล์ไหนที่เป็นคุณ?</h2>
        </div>
        <p>เลือกภาพเพื่อดูรายละเอียด<br />และเริ่มสั่งทำในแนวที่คุณชอบ</p>
      </div>
      <div class="filter-panel">
        <div class="search-row">
          <label class="search-field"
            ><span class="sr-only">ค้นหาผลงาน</span
            ><svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" /></svg
            ><input
              v-model="search"
              type="search"
              placeholder="ค้นหาชื่อภาพ สไตล์ หรือประเภทงาน…"
          /></label>
          <label class="sort-field"
            ><span>เรียงตาม</span
            ><select v-model="sortBy" aria-label="เรียงลำดับผลงาน">
              <option value="newest">ผลงานล่าสุด</option>
              <option value="oldest">ผลงานเก่าสุด</option>
            </select></label
          >
        </div>
        <div class="category-tabs" aria-label="ประเภทผลงาน">
          <button
            v-for="tab in categoryTabs"
            :key="tab.id ?? 'all'"
            :class="{ active: selectedWorkTypeId === tab.id }"
            :aria-pressed="selectedWorkTypeId === tab.id"
            @click="selectedWorkTypeId = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>
        <details v-if="availableTags.length" class="tag-filter">
          <summary>
            ค้นหาตามแท็ก
            <span>{{
              selectedTag ? `#${selectedTag}` : `${availableTags.length} แท็ก`
            }}</span>
          </summary>
          <div class="tag-list">
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="{ active: selectedTag === tag }"
              :aria-pressed="selectedTag === tag"
              @click="toggleTag(tag)"
            >
              #{{ tag }}
            </button>
          </div>
        </details>
      </div>
      <div class="results-toolbar">
        <p aria-live="polite">
          {{
            loading
              ? 'กำลังโหลดผลงาน…'
              : error
                ? 'ยังโหลดผลงานไม่ได้'
                : `${filteredImages.length} ผลงานที่รอให้คุณค้นพบ`
          }}<span v-if="selectedTag"> · #{{ selectedTag }}</span>
        </p>
        <button v-if="hasFilters" class="clear-filters" @click="clearFilters">
          ล้างตัวกรอง ×
        </button>
      </div>
      <div
        v-if="loading"
        class="art-grid"
        aria-label="กำลังโหลดผลงาน"
        aria-busy="true"
      >
        <div v-for="n in 8" :key="n" class="art-skeleton" />
      </div>
      <div v-else-if="error" class="state-panel" role="alert">
        <span class="state-symbol" aria-hidden="true">↻</span>
        <h3>ยังเปิดคอลเลกชันไม่ได้ในตอนนี้</h3>
        <p>{{ error }}</p>
        <button class="gallery-button button-navy" @click="loadData">
          ลองโหลดใหม่อีกครั้ง →
        </button>
      </div>
      <div v-else-if="!filteredImages.length" class="state-panel" role="status">
        <span class="state-symbol" aria-hidden="true">✳</span>
        <h3>
          {{
            hasFilters
              ? 'ลองค้นหาแรงบันดาลใจในแนวอื่น'
              : 'กำลังเตรียมผลงานให้คุณค้นพบ'
          }}
        </h3>
        <p>
          {{
            hasFilters
              ? 'ยังไม่มีผลงานที่ตรงกับคำค้นหาหรือตัวกรองนี้'
              : 'คุณสามารถเริ่มจากไอเดียและภาพอ้างอิงของคุณเองได้'
          }}
        </p>
        <button
          v-if="hasFilters"
          class="gallery-button button-navy"
          @click="clearFilters"
        >
          ดูผลงานทั้งหมด →</button
        ><NuxtLink
          v-else
          to="/customer/orders/create"
          class="gallery-button button-navy"
          >เริ่มด้วยไอเดียของคุณ →</NuxtLink
        >
      </div>
      <template v-else>
        <div class="art-grid">
          <GalleryImageCard
            v-for="img in displayedImages"
            :key="img.imageId"
            :img="img"
            @view-details="openDetails"
          />
        </div>
        <nav
          v-if="totalPages > 1"
          class="gallery-pagination"
          aria-label="หน้าผลงาน"
        >
          <button
            aria-label="หน้าก่อนหน้า"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ←</button
          ><button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
            :aria-label="`หน้าที่ ${page}`"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="goToPage(page)"
          >
            {{ page }}</button
          ><button
            aria-label="หน้าถัดไป"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            →
          </button>
        </nav>
      </template>
    </section>
    <section class="gallery-cta">
      <div class="coos-shell">
        <div>
          <p class="eyebrow">MAKE IT YOURS</p>
          <h2>มีภาพในใจแล้ว?<br />ให้เราช่วยสร้างให้เป็นจริง</h2>
          <p>เลือกแพ็กเกจและบอกแนวที่ชอบ แล้วเริ่มต้นงานของคุณได้เลย</p>
        </div>
        <NuxtLink
          to="/customer/orders/create"
          class="gallery-button button-orange"
          >เริ่มสร้างภาพของคุณ <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </section>
    <GalleryDetailsModal
      :img="selectedImage"
      :is-open="isDetailsModalOpen"
      variant="gallery"
      @close="isDetailsModalOpen = false"
    />
  </div>
</template>

<style scoped>
.gallery-page {
  background: #f5f0e7;
  color: #172c3b;
  min-height: 100vh;
}
.gallery-page :is(button, a, input, select, summary):focus-visible {
  outline: 3px solid #d7642c;
  outline-offset: 4px;
}
.gallery-hero {
  padding: 118px 0 58px;
  background: #172c3b;
  color: #f5f0e7;
  overflow: hidden;
}
.hero-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 64px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #c7d2d7;
  margin-bottom: 28px;
}
.back-link span {
  opacity: 0.5;
}
.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.17em;
  line-height: 1.8;
}
.hero-copy .eyebrow {
  color: #ffad80;
}
h1 {
  font-size: clamp(32px, 3.6vw, 52px);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.035em;
  margin: 18px 0;
}
h1 span {
  color: #ff955e;
}
.hero-description {
  font-size: 14px;
  line-height: 1.9;
  color: #c7d2d7;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 26px;
}
.gallery-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 14px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 0.2s,
    background 0.2s;
}
.gallery-button:hover {
  transform: translateY(-2px);
}
.button-orange {
  background: #ff955e;
  color: #172c3b;
}
.button-orange:hover {
  background: #ffae84;
}
.button-navy {
  background: #172c3b;
  color: #fff;
}
.hero-price-link {
  font-size: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #c7d2d770;
}
.hero-collection {
  display: flex;
  gap: 16px;
  position: relative;
  padding: 20px 0 44px;
  min-width: 0;
}
.hero-photo {
  position: relative;
  width: 50%;
  min-width: 0;
  aspect-ratio: 3/4;
  border-radius: 70px 8px 8px 8px;
  overflow: hidden;
  background: #2a4655;
  transform: rotate(-5deg);
  border: 5px solid #38515e;
}
.hero-photo:nth-child(2) {
  transform: translateY(30px) rotate(5deg);
  border-radius: 8px 8px 70px 8px;
}
.hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-photo > span {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 30px 14px 14px;
  background: linear-gradient(transparent, #091722e6);
  color: #fff;
  font-size: 11px;
}
.collection-note {
  position: absolute;
  bottom: -12px;
  left: 6px;
  color: #c7d2d7;
  font-size: 9px;
  letter-spacing: 0.16em;
}
.hero-mark {
  font-size: 220px;
  color: #ff955e;
  text-align: center;
  line-height: 1;
}
.gallery-ribbon {
  background: #e4ae83;
  padding: 17px 0;
}
.gallery-ribbon > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  font-weight: 600;
}
.gallery-content {
  padding-top: 58px;
  padding-bottom: 64px;
  scroll-margin-top: 90px;
}
.collection-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.collection-heading .eyebrow {
  color: #8a492d;
  margin-bottom: 12px;
}
h2 {
  font-size: clamp(26px, 2.6vw, 36px);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.025em;
}
.collection-heading > p {
  font-size: 13px;
  line-height: 1.9;
  color: #52616a;
}
.filter-panel {
  background: #e5e9e1;
  border: 1px solid #172c3b18;
  padding: 22px;
  border-radius: 12px;
}
.search-row {
  display: flex;
  gap: 16px;
}
.search-field {
  position: relative;
  flex: 1;
  min-width: 0;
}
.search-field svg {
  position: absolute;
  left: 16px;
  top: 15px;
  width: 18px;
  height: 18px;
  color: #52616a;
}
.search-field input {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 44px;
  border: 1px solid #172c3b22;
  border-radius: 8px;
  background: #fcf9f3;
  font-size: 13px;
}
.sort-field {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}
.sort-field select {
  border: 1px solid #172c3b22;
  border-radius: 8px;
  height: 48px;
  background: #fcf9f3;
  padding: 0 12px;
  font-size: 12px;
}
.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.category-tabs button {
  padding: 9px 16px;
  border: 1px solid #172c3b30;
  border-radius: 24px;
  font-size: 12px;
  transition: background 0.2s;
}
.category-tabs button:hover {
  background: #d4dcd2;
}
.category-tabs button.active {
  background: #172c3b;
  color: #fff;
  border-color: #172c3b;
}
.tag-filter {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #172c3b22;
}
.tag-filter summary {
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.tag-filter summary span {
  font-weight: 400;
  margin-left: 10px;
  color: #52616a;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
}
.tag-list button {
  font-size: 11px;
  padding: 6px 10px;
  background: #f5f0e7;
  border: 1px solid #172c3b20;
  border-radius: 6px;
  overflow-wrap: anywhere;
  max-width: 100%;
  text-align: left;
}
.tag-list button.active {
  background: #172c3b;
  color: #fff;
}
.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0;
  font-size: 12px;
  color: #52616a;
}
.clear-filters {
  color: #8a492d;
  font-weight: 600;
  flex-shrink: 0;
}
.art-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 30px 22px;
}
.art-skeleton {
  aspect-ratio: 3/4;
  background: #e4ddd2;
  border-radius: 12px;
}
.state-panel {
  text-align: center;
  padding: 64px 24px;
  background: #eee6da;
  border-radius: 12px;
}
.state-symbol {
  color: #9e542f;
  display: block;
  font-size: 54px;
  margin-bottom: 16px;
}
.state-panel h3 {
  font-size: 20px;
  font-weight: 600;
}
.state-panel p {
  margin: 14px 0 24px;
  color: #52616a;
  font-size: 13px;
  line-height: 1.8;
}
.gallery-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 40px;
}
.gallery-pagination button {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #172c3b26;
  border-radius: 8px;
  font-size: 13px;
}
.gallery-pagination button.active {
  background: #172c3b;
  color: #fff;
}
.gallery-pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.gallery-cta {
  background: #172c3b;
  color: #f5f0e7;
  padding: 54px 0;
}
.gallery-cta > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}
.gallery-cta .eyebrow {
  color: #ff955e;
  margin-bottom: 14px;
}
.gallery-cta p:not(.eyebrow) {
  font-size: 13px;
  color: #c7d2d7;
  margin-top: 16px;
  line-height: 1.9;
}
@media (max-width: 1023px) {
  .hero-layout {
    gap: 32px;
  }
  .art-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 28px 16px;
  }
  .hero-photo {
    border-radius: 44px 8px 8px 8px;
  }
  .hero-photo:nth-child(2) {
    border-radius: 8px 8px 44px 8px;
  }
}
@media (max-width: 767px) {
  .gallery-hero {
    padding: 110px 0 40px;
  }
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 26px;
  }
  .hero-collection {
    width: min(85%, 400px);
    margin: 0 auto;
  }
  .hero-description {
    font-size: 13px;
  }
  .hero-mark {
    display: none;
  }
  .gallery-ribbon > div {
    font-size: 10px;
    gap: 8px;
  }
  .gallery-content {
    padding-top: 40px;
    padding-bottom: 44px;
  }
  .collection-heading {
    align-items: start;
    flex-direction: column;
    gap: 12px;
  }
  .collection-heading > p br {
    display: none;
  }
  .filter-panel {
    padding: 16px;
  }
  .search-row {
    flex-direction: column;
    gap: 12px;
  }
  .sort-field {
    justify-content: space-between;
  }
  .sort-field select {
    flex: 1;
    max-width: 220px;
    height: 40px;
  }
  .art-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 14px;
  }
  .gallery-cta > div {
    align-items: start;
    flex-direction: column;
  }
}
@media (max-width: 359px) {
  .art-grid {
    gap: 20px 10px;
  }
  .gallery-ribbon > div {
    font-size: 9px;
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
