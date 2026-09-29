<script setup lang="ts">
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FCFAF8] to-[#FFF4E6] font-sans relative overflow-x-hidden text-[#171717]">
    <Teleport to="body">
      <div class="fixed left-0 right-0 top-0 z-[35] h-[80px] pointer-events-none progressive-blur-layer lg:h-[100px]" />
    </Teleport>

    <div class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute left-[-10%] top-[-14%] h-[36rem] w-[36rem] rounded-full bg-[#FF9999]/80 blur-[90px]" />
      <div class="absolute right-[-5%] top-10 h-[36rem] w-[36rem] rounded-full bg-[#FFC233]/70 blur-[100px]" />
      <div class="absolute bottom-[-20%] left-[20%] h-[40rem] w-[40rem] rounded-full bg-[#FFD699]/40 blur-[100px]" />
    </div>

    <LayoutSidebarDashboard
      role="editor"
      :collapsed="sidebarOpen"
      @close="sidebarOpen = false"
    />
    <div class="lg:pl-60 flex flex-col min-h-screen relative z-10">
      <LayoutNavbarStaff
        role="editor"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.98) 18%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.38) 72%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.98) 18%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.38) 72%, transparent 100%);
}

.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}
</style>
