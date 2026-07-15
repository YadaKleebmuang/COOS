<script setup lang="ts">
// Reverted layout script
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <LayoutSidebarDashboard role="editor" />
    <div class="flex-grow flex flex-col min-w-0">
      <LayoutNavbarStaff role="editor" />
      <main class="flex-grow p-6 lg:p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

