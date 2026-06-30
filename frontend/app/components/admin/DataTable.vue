<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  align?: "left" | "center" | "right"
  width?: string
}

defineProps<{
  columns: TableColumn[]
  rows: Record<string, any>[]
  loading?: boolean
  rowKey?: string
}>()
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl border border-gray-200">
    <table class="w-full text-sm">
      <!-- Head -->
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? `width: ${col.width}` : ''"
            class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
            :class="{
              'text-left': col.align === 'left' || !col.align,
              'text-center': col.align === 'center',
              'text-right': col.align === 'right'
            }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="bg-white divide-y divide-gray-100">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <tr v-for="i in 5" :key="`skeleton-${i}`">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <div class="h-4 bg-gray-100 rounded animate-pulse" />
            </td>
          </tr>
        </template>

        <!-- Data rows -->
        <template v-else>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKey ? row[rowKey] : rowIndex"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 whitespace-nowrap"
              :class="{
                'text-left': col.align === 'left' || !col.align,
                'text-center': col.align === 'center',
                'text-right': col.align === 'right'
              }"
            >
              <!-- Named slot per column key -->
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                <span class="text-gray-700">{{ row[col.key] ?? '—' }}</span>
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
