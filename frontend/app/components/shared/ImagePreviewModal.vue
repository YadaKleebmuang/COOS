<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useImagePreview } from '~/composables/useImagePreview'

const { previewState, closePreview } = useImagePreview()

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && previewState.value) {
    closePreview()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="previewState"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <button
          class="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-default focus:outline-none w-full h-full border-none"
          aria-label="ปิดรูปภาพ"
          @click="closePreview"
        />

        <!-- Close Button (Fixed Top-Right) -->
        <button
          class="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:bg-gray-100 hover:scale-105 focus:outline-none pointer-events-auto"
          aria-label="ปิดภาพตัวอย่าง"
          type="button"
          @click="closePreview"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Modal Content -->
        <div class="relative flex flex-col items-center justify-center w-full max-w-6xl max-h-full pointer-events-none">
          <img
            :src="previewState.url"
            :alt="previewState.alt"
            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black/20 pointer-events-auto"
          >
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
