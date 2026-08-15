<script setup lang="ts">
const userRole = useCookie<string | null>('userRole')
</script>

<template>
  <div class="coos-page flex min-h-screen flex-col">
    <LayoutNavbarCustomer v-if="userRole === 'customer'" />
    <LayoutNavbarPublic v-else />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooterPublic />
  </div>
</template>
