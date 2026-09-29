import { ref } from 'vue'

const previewState = ref<{ url: string; alt: string } | null>(null)

export const useImagePreview = () => {
  const openPreview = (url: string, alt = 'ภาพตัวอย่าง') => {
    previewState.value = { url, alt }
  }
  
  const closePreview = () => {
    previewState.value = null
  }
  
  return {
    previewState,
    openPreview,
    closePreview
  }
}
