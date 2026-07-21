<script setup lang="ts">
const userRole = useCookie<string | null>("userRole")
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50">
    <LayoutNavbarCustomer v-if="userRole === 'customer'" />
    <LayoutNavbarPublic v-else />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooterPublic />
  </div>
</template>
