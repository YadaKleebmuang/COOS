<script setup lang="ts">
definePageMeta({
  middleware: [
    () => navigateTo('/#packages')
  ]
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
  </div>
</template>
