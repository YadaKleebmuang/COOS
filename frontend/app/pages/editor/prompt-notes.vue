<script setup lang="ts">
import { useHead } from "#imports"

definePageMeta({
  layout: "editor"
})

useHead({
  title: "บันทึก Prompt - COOS Studio Editor"
})

const breadcrumb = [
  { label: "หน้าแรก", to: "/editor/dashboard" },
  { label: "บันทึก Prompt" }
]
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">บันทึก Prompt ส่วนตัว</h1>
        <p class="mt-0.5 text-sm text-gray-500">จัดการ Prompt ของคุณสำหรับใช้กับงานตกแต่งภาพ</p>
      </div>
      <AdminActionButton icon="M12 4v16m8-8H4" variant="primary">
        เพิ่ม Prompt ใหม่
      </AdminActionButton>
    </div>

    <!-- Placeholder Content -->
    <AdminEmptyState
      icon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      title="ยังไม่มีบันทึก Prompt"
      description="คุณยังไม่ได้สร้าง Prompt เริ่มต้นใช้งานโดยเพิ่ม Prompt แรกของคุณ"
    />
  </div>
</template>
