<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "confirm"): void
  (e: "cancel"): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="emit('cancel')"
        />

        <!-- Dialog -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6"
          >
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              :class="danger ? 'bg-red-50' : 'bg-gray-50'"
            >
              <svg
                class="w-5 h-5"
                :class="danger ? 'text-red-500' : 'text-gray-500'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <!-- Text -->
            <h3 class="text-sm font-bold text-gray-900 mb-1">
              {{ title ?? 'ยืนยันการดำเนินการ' }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ message ?? 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?' }}
            </p>

            <!-- Actions -->
            <div class="mt-6 flex gap-2 justify-end">
              <button
                @click="emit('cancel')"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {{ cancelLabel ?? 'ยกเลิก' }}
              </button>
              <button
                @click="emit('confirm')"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                :class="danger
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-900 text-white hover:bg-gray-700'"
              >
                <span v-if="loading" class="flex items-center gap-1.5">
                  <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังดำเนินการ...
                </span>
                <span v-else>{{ confirmLabel ?? 'ยืนยัน' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
