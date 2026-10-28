<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'default' })
useHead({ title: 'นโยบายและเงื่อนไขบริการ — COOS Studio' })

const { apiFetch } = useApi()
const route = useRoute()
type PolicyType = 'terms' | 'privacy' | 'refund'
type Policy = {
  policyId: number | string
  policyTitle: string
  policyContent: string
  policyType: PolicyType
  policyUpdatedAt?: string
}

const categories = [
  {
    key: 'terms',
    title: 'เงื่อนไขการใช้บริการ',
    caption: 'ข้อตกลงในการใช้บริการ',
    number: '01'
  },
  {
    key: 'privacy',
    title: 'ความเป็นส่วนตัว',
    caption: 'นโยบายเกี่ยวกับข้อมูลของคุณ',
    number: '02'
  }
] as const
const selectedCategory = computed(
  () =>
    categories.find((category) => category.key === route.query.tab) ||
    categories[0]
)
const policies = ref<Policy[]>([])
const loading = ref(true)
const error = ref(false)
const visiblePolicies = computed(() =>
  policies.value.filter(
    (policy) => policy.policyType === selectedCategory.value.key
  )
)
const categoryTitle = (type: PolicyType) =>
  categories.find((category) => category.key === type)?.title ||
  'นโยบายการใช้บริการ'
const categoryLink = (key: 'terms' | 'privacy') => ({
  path: '/policy',
  query: { ...route.query, tab: key },
  hash: '#policy-content'
})
const updatedDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  })
}
const loadPolicies = async () => {
  loading.value = true
  error.value = false
  try {
    policies.value = (await apiFetch<Policy[]>('/policies')) || []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onMounted(loadPolicies)
</script>

<template>
  <div class="policy-page">
    <section class="policy-hero">
      <div class="coos-shell hero-layout">
        <div>
          <NuxtLink to="/" class="breadcrumb"
            >หน้าแรก
            <span aria-hidden="true">/</span> นโยบายและเงื่อนไข</NuxtLink
          >
          <p class="eyebrow">THE COOS STUDIO GUIDE</p>
          <h1>เข้าใจทุกเงื่อนไข<br /><span>ก่อนเริ่มสร้างสรรค์.</span></h1>
          <p class="hero-description">
            อ่านรายละเอียดการใช้บริการและความเป็นส่วนตัว<br
              class="hidden sm:block"
            />
            เพื่อเตรียมพร้อมก่อนเริ่มงานกับ COOS Studio
          </p>
          <a href="#policy-content" class="hero-link"
            >อ่านนโยบายของเรา <span aria-hidden="true">↓</span></a
          >
        </div>
        <div class="guide-illustration" aria-hidden="true">
          <div class="guide-sheet">
            <div class="guide-brand">COOS <span>STUDIO</span></div>
            <span class="guide-star">✳</span>
            <div class="guide-title">GOOD TO KNOW.<br />BEFORE WE CREATE.</div>
            <div class="guide-lines"><span /><span /><span /></div>
            <div class="guide-footer">SERVICE & POLICY <span>↗</span></div>
          </div>
          <span class="guide-seal"
            >LET’S<br />CREATE<br /><strong>TOGETHER</strong></span
          >
        </div>
      </div>
    </section>
    <div class="policy-ribbon">
      <div class="coos-shell">
        <span>เงื่อนไขการใช้บริการ</span><span aria-hidden="true">✳</span
        ><span>ความเป็นส่วนตัว</span>
      </div>
    </div>

    <section id="policy-content" class="coos-shell policy-layout">
      <aside class="policy-sidebar">
        <nav aria-label="หมวดนโยบาย" class="category-nav">
          <p class="eyebrow">EXPLORE OUR POLICIES</p>
          <h2>เลือกหัวข้อที่ต้องการอ่าน</h2>
          <NuxtLink
            v-for="category in categories"
            :key="category.key"
            :to="categoryLink(category.key)"
            class="category-link"
            :class="{ selected: selectedCategory.key === category.key }"
            :aria-current="
              selectedCategory.key === category.key ? 'page' : undefined
            "
          >
            <span class="category-number">{{ category.number }}</span
            ><span class="category-text"
              ><strong>{{ category.title }}</strong
              ><small>{{ category.caption }}</small></span
            ><span class="category-arrow" aria-hidden="true">↗</span>
          </NuxtLink>
        </nav>
        <div class="reading-note">
          <span class="note-mark" aria-hidden="true">i</span>
          <div>
            <h3>อ่านก่อนเริ่มสั่งงาน</h3>
            <p>
              เลือกอ่านแต่ละหัวข้อ
              เพื่อทำความเข้าใจรายละเอียดและเงื่อนไขที่เกี่ยวข้องกับบริการ
            </p>
          </div>
        </div>
      </aside>

      <div class="policy-reading" :aria-busy="loading">
        <div class="reading-heading">
          <div>
            <p class="eyebrow">POLICY & TERMS</p>
            <h2>{{ selectedCategory.title }}</h2>
          </div>
          <span
            v-if="!loading && !error"
            class="policy-count"
            aria-live="polite"
            >{{ visiblePolicies.length }} หัวข้อ</span
          >
        </div>
        <div v-if="loading" class="policy-loading" role="status">
          <p>กำลังโหลดนโยบาย…</p>
          <div v-for="n in 3" :key="n" class="loading-line" />
        </div>
        <div v-else-if="error" class="state-panel" role="alert">
          <span class="state-mark" aria-hidden="true">↻</span>
          <h3>ยังโหลดนโยบายไม่ได้ในขณะนี้</h3>
          <p>กรุณาลองใหม่อีกครั้งเพื่ออ่านรายละเอียดการใช้บริการ</p>
          <button class="policy-button button-navy" @click="loadPolicies">
            ลองโหลดใหม่ →
          </button>
        </div>
        <div
          v-else-if="!visiblePolicies.length"
          class="state-panel"
          role="status"
        >
          <span class="state-mark" aria-hidden="true">≡</span>
          <h3>ยังไม่มีนโยบายในหมวดนี้</h3>
          <p>คุณสามารถเลือกอ่านหัวข้ออื่นจากเมนูนโยบายได้</p>
        </div>
        <div v-else class="policy-articles">
          <article
            v-for="policy in visiblePolicies"
            :key="policy.policyId"
            class="policy-article"
            :aria-labelledby="`policy-title-${policy.policyId}`"
          >
            <div class="article-meta">
              <span class="policy-badge">{{
                categoryTitle(policy.policyType)
              }}</span
              ><span
                v-if="updatedDate(policy.policyUpdatedAt)"
                class="updated-date"
                >อัปเดต {{ updatedDate(policy.policyUpdatedAt) }}</span
              >
            </div>
            <h3 :id="`policy-title-${policy.policyId}`">
              {{ policy.policyTitle }}
            </h3>
            <p class="policy-text">{{ policy.policyContent }}</p>
          </article>
          <a href="#policy-content" class="back-to-top"
            >กลับไปด้านบน <span aria-hidden="true">↑</span></a
          >
        </div>
      </div>
    </section>
    <section class="policy-next">
      <div class="coos-shell next-layout">
        <div>
          <p class="eyebrow">YOUR NEXT CREATIVE STEP</p>
          <h2>เมื่อพร้อมแล้ว<br />มาเริ่มจากไอเดียที่คุณชอบ</h2>
          <p>สำรวจผลงานและแพ็กเกจ เพื่อเลือกแนวทางสำหรับภาพของคุณ</p>
        </div>
        <div class="next-actions">
          <NuxtLink to="/gallery" class="policy-button button-navy"
            >ค้นหาแรงบันดาลใจ <span aria-hidden="true">↗</span></NuxtLink
          ><NuxtLink to="/#packages" class="package-link"
            >ดูแพ็กเกจและราคา →</NuxtLink
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.policy-page {
  background: #f5f0e7;
  color: #172c3b;
  min-height: 100vh;
}
.policy-page :is(a, button):focus-visible {
  outline: 3px solid #d7642c;
  outline-offset: 4px;
}
.policy-hero {
  background: #172c3b;
  color: #f5f0e7;
  padding: 120px 0 58px;
  overflow: hidden;
}
.hero-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 64px;
}
.breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #c7d2d7;
  font-size: 11px;
  margin-bottom: 30px;
}
.breadcrumb > span {
  opacity: 0.5;
}
.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.17em;
  line-height: 1.8;
}
.policy-hero .eyebrow {
  color: #ffad80;
}
h1 {
  font-size: clamp(34px, 3.7vw, 54px);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.035em;
  margin: 18px 0;
}
h1 > span {
  color: #ff955e;
}
.hero-description {
  font-size: 14px;
  line-height: 1.9;
  color: #c7d2d7;
}
.hero-link {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  border-bottom: 1px solid #ff955e80;
  color: #ffad80;
  margin-top: 22px;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
}
.guide-illustration {
  position: relative;
  width: 270px;
  justify-self: center;
  padding: 10px 0;
}
.guide-sheet {
  position: relative;
  padding: 26px;
  border-radius: 10px;
  background: #efe8db;
  color: #172c3b;
  transform: rotate(7deg);
  box-shadow: -16px 14px 0 #38515d;
}
.guide-brand {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2em;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.guide-brand > span {
  font-size: 7px;
  font-weight: 500;
}
.guide-star {
  display: block;
  color: #9b502b;
  font-size: 76px;
  line-height: 1.4;
}
.guide-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.02em;
}
.guide-lines {
  display: grid;
  gap: 7px;
  margin: 20px 0 26px;
}
.guide-lines span {
  height: 4px;
  background: #cfc6b6;
  border-radius: 4px;
}
.guide-lines span:last-child {
  width: 65%;
}
.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8px;
  letter-spacing: 0.12em;
  border-top: 1px solid #172c3b30;
  padding-top: 14px;
}
.guide-footer > span {
  font-size: 20px;
}
.guide-seal {
  position: absolute;
  bottom: 16px;
  right: -32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 5px solid #172c3b;
  background: #ff955e;
  color: #172c3b;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  transform: rotate(-9deg);
}
.guide-seal strong {
  font-size: 9px;
  margin-top: 3px;
}
.policy-ribbon {
  background: #e4ae83;
  padding: 17px 0;
}
.policy-ribbon > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  font-weight: 600;
}
.policy-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 48px;
  padding-top: 56px;
  padding-bottom: 64px;
  scroll-margin-top: 98px;
  align-items: start;
}
.policy-sidebar {
  position: sticky;
  top: 100px;
}
.category-nav {
  background: #e5e9e1;
  border: 1px solid #172c3b15;
  border-radius: 12px;
  padding: 22px 14px 14px;
}
.category-nav > .eyebrow {
  color: #617061;
  padding: 0 10px;
  font-size: 9px;
}
.category-nav > h2 {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 10px 20px;
}
.category-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px;
  border-radius: 8px;
  margin-top: 4px;
  transition: background 0.2s;
}
.category-link:hover {
  background: #d8dfd4;
}
.category-link.selected {
  background: #172c3b;
  color: #f5f0e7;
}
.category-number {
  font-size: 11px;
  color: #667468;
}
.selected .category-number,
.selected .category-arrow {
  color: #ffad80;
}
.category-text {
  flex: 1;
  min-width: 0;
}
.category-text strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
}
.category-text small {
  display: block;
  font-size: 10px;
  margin-top: 5px;
  color: #52616a;
  line-height: 1.6;
}
.selected .category-text small {
  color: #c7d2d7;
}
.category-arrow {
  font-size: 17px;
}
.reading-note {
  display: flex;
  gap: 12px;
  padding: 22px 10px 0;
}
.note-mark {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid #8a492d;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 11px;
  color: #8a492d;
}
.reading-note h3 {
  font-size: 12px;
  font-weight: 600;
}
.reading-note p {
  font-size: 11px;
  color: #52616a;
  line-height: 1.9;
  margin-top: 7px;
}
.policy-reading {
  min-width: 0;
}
.reading-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 0 24px;
}
.reading-heading .eyebrow {
  color: #8a492d;
  margin-bottom: 10px;
}
.reading-heading h2 {
  font-size: clamp(24px, 2.4vw, 32px);
  font-weight: 600;
  line-height: 1.5;
}
.policy-count {
  color: #52616a;
  font-size: 11px;
  white-space: nowrap;
}
.policy-articles {
  display: grid;
  gap: 22px;
}
.policy-article {
  background: #fcf9f3;
  border: 1px solid #172c3b1c;
  border-radius: 12px;
  padding: 30px 32px;
}
.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}
.policy-badge {
  display: inline-block;
  background: #f1e0d0;
  color: #804526;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 600;
}
.updated-date {
  color: #637078;
  font-size: 10px;
}
.policy-article h3 {
  font-size: 21px;
  line-height: 1.6;
  font-weight: 600;
  padding-bottom: 20px;
  border-bottom: 1px solid #172c3b1c;
  margin-bottom: 20px;
  overflow-wrap: anywhere;
}
.policy-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 2.15;
  color: #44535d;
}
.back-to-top {
  justify-self: end;
  display: inline-flex;
  gap: 18px;
  align-items: center;
  color: #52616a;
  font-size: 11px;
  padding: 8px 0;
}
.policy-loading,
.state-panel {
  border: 1px solid #172c3b20;
  background: #eee6da;
  border-radius: 12px;
  padding: 40px 28px;
}
.policy-loading p {
  color: #52616a;
  font-size: 13px;
  margin-bottom: 28px;
}
.loading-line {
  height: 12px;
  border-radius: 4px;
  background: #d9d0c1;
  margin-top: 16px;
}
.loading-line:last-child {
  width: 65%;
}
.state-panel {
  text-align: center;
}
.state-mark {
  display: block;
  font-size: 44px;
  color: #8a492d;
  margin-bottom: 16px;
}
.state-panel h3 {
  font-size: 18px;
  font-weight: 600;
}
.state-panel p {
  margin: 12px 0 24px;
  font-size: 13px;
  line-height: 1.9;
  color: #52616a;
}
.policy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 14px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
.button-navy {
  background: #172c3b;
  color: #f5f0e7;
}
.button-navy:hover {
  background: #294655;
}
.policy-next {
  background: #e5e9e1;
  padding: 54px 0;
}
.next-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}
.policy-next .eyebrow {
  color: #8a492d;
  margin-bottom: 14px;
}
.policy-next h2 {
  font-size: clamp(26px, 2.5vw, 36px);
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: -0.025em;
}
.policy-next p:not(.eyebrow) {
  color: #52616a;
  font-size: 13px;
  line-height: 1.9;
  margin-top: 16px;
}
.next-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.package-link {
  font-size: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #172c3b50;
}
@media (max-width: 1023px) {
  .hero-layout {
    gap: 40px;
  }
  .guide-illustration {
    width: 225px;
  }
  .guide-sheet {
    padding: 22px;
  }
  .policy-layout {
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 24px;
  }
  .policy-article {
    padding: 24px;
  }
}
@media (max-width: 767px) {
  .policy-hero {
    padding: 110px 0 40px;
  }
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .guide-illustration {
    display: none;
  }
  .hero-description {
    font-size: 13px;
  }
  .policy-ribbon > div {
    font-size: 10px;
    gap: 8px;
  }
  .policy-layout {
    grid-template-columns: 1fr;
    gap: 30px;
    padding-top: 32px;
    padding-bottom: 40px;
  }
  .policy-sidebar {
    position: static;
  }
  .category-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 16px;
  }
  .category-nav > .eyebrow,
  .category-nav > h2 {
    grid-column: 1 / -1;
    padding: 0;
  }
  .category-nav > h2 {
    padding-bottom: 8px;
  }
  .category-link {
    gap: 8px;
    padding: 12px 10px;
    margin: 0;
    background: #f5f0e780;
  }
  .category-text strong {
    font-size: 11px;
  }
  .category-text small,
  .category-arrow {
    display: none;
  }
  .reading-note {
    padding: 18px 0 0;
  }
  .reading-heading {
    padding-bottom: 18px;
  }
  .policy-article {
    padding: 22px 20px;
  }
  .policy-article h3 {
    font-size: 18px;
  }
  .policy-text {
    font-size: 13px;
  }
  .next-layout {
    flex-direction: column;
    align-items: start;
    gap: 24px;
  }
  .next-actions {
    align-items: start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .category-link {
    transition: none;
  }
}
</style>
