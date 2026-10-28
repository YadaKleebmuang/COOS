<script setup lang="ts">
import { ref, watch } from 'vue'

type GalleryImage = {
  imageId?: number | string
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}
const props = defineProps<{ img: GalleryImage }>()
const { publicGalleryUrl } = useProtectedAsset()
const imageFailed = ref(false)
watch(
  () => props.img.imageId,
  () => {
    imageFailed.value = false
  }
)
defineEmits<{ (e: 'view-details', img: GalleryImage): void }>()
</script>

<template>
  <article class="gallery-art-card">
    <button
      class="artwork"
      :aria-label="`ดูรายละเอียด ${img.imageTitle || img.workTypeName || 'ผลงาน'}`"
      @click="$emit('view-details', img)"
    >
      <img
        v-if="img.imageId != null && !imageFailed"
        :src="publicGalleryUrl(img.imageId)"
        :alt="img.imageTitle || img.workTypeName || 'ผลงานจาก COOS Studio'"
        width="600"
        height="750"
        loading="lazy"
        @error="imageFailed = true"
      />
      <span v-else class="image-unavailable"
        >ยังแสดงภาพนี้ไม่ได้<br /><small>เปิดดูรายละเอียดผลงาน</small></span
      >
      <span class="art-category">{{
        img.workTypeName || 'ผลงานสร้างสรรค์'
      }}</span>
      <span class="art-arrow" aria-hidden="true">↗</span>
    </button>
    <div class="art-info">
      <p>COOS COLLECTION</p>
      <button class="art-title" @click="$emit('view-details', img)">
        {{ img.imageTitle || img.workTypeName || 'ผลงานจากสตูดิโอ' }}</button
      ><NuxtLink
        v-if="img.imageId != null"
        :to="`/customer/orders/create?galleryImageId=${img.imageId}`"
        class="art-order"
        >สั่งทำภาพแนวนี้ <span aria-hidden="true">↗</span></NuxtLink
      >
    </div>
  </article>
</template>

<style scoped>
.gallery-art-card {
  min-width: 0;
  color: #172c3b;
}
.gallery-art-card :is(button, a):focus-visible {
  outline: 3px solid #d7642c;
  outline-offset: 4px;
}
.artwork {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4/5;
  border-radius: 12px;
  overflow: hidden;
  background: #e4ddd2;
  text-align: left;
}
.artwork img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s;
}
.artwork:hover img {
  transform: scale(1.04);
}
.art-category {
  position: absolute;
  top: 12px;
  left: 12px;
  max-width: calc(100% - 24px);
  border-radius: 20px;
  background: #fcf9f3f2;
  color: #172c3b;
  font-size: 10px;
  padding: 6px 11px;
}
.art-arrow {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f5f0e7;
  font-size: 20px;
}
.art-info {
  padding-top: 15px;
}
.art-info > p {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #68757c;
  margin-bottom: 7px;
}
.art-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.7;
}
.art-order {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px solid #172c3b24;
  color: #8a492d;
  font-size: 11px;
  font-weight: 600;
}
.art-order:hover {
  color: #172c3b;
}
.image-unavailable {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 50px 14px;
  font-size: 13px;
  text-align: center;
  color: #52616a;
}
.image-unavailable small {
  font-size: 10px;
}
@media (max-width: 639px) {
  .art-category {
    left: 8px;
    top: 8px;
    padding: 5px 8px;
    font-size: 9px;
  }
  .art-arrow {
    width: 28px;
    height: 28px;
    bottom: 8px;
    right: 8px;
  }
  .art-title {
    font-size: 12px;
  }
  .art-info > p {
    font-size: 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .artwork img {
    transition: none;
  }
}
</style>
