<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div
      class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
    >
      <!-- Campo de pesquisa -->
      <input
        type="text"
        v-model="search"
        :placeholder="placeholder"
        class="w-full focus:outline-none"
      />

      <!-- Lista de opções -->
      <div v-if="filteredOptions.length" class="mt-2 max-h-40 overflow-y-auto border-t pt-2">
        <div
          v-for="option in filteredOptions"
          :key="option"
          @click="toggleSelection(option)"
          class="cursor-pointer px-2 py-1 rounded hover:bg-blue-50 flex justify-between items-center"
        >
          <span>{{ option }}</span>
          <span v-if="modelValue.includes(option)" class="text-blue-500 font-bold">✓</span>
        </div>
      </div>

      <!-- Selecionados -->
      <div v-if="modelValue.length" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="item in modelValue"
          :key="item"
          class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
        >
          {{ item }}
          <button @click.stop="remove(item)" class="ml-1 text-blue-600 hover:text-blue-800">
            &times;
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: string[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const search = ref('')

const filteredOptions = computed(() => {
  const lowerSearch = search.value.toLowerCase()
  return props.options.filter(
    opt => opt.toLowerCase().includes(lowerSearch) && !props.modelValue.includes(opt)
  )
})

function toggleSelection(option: string) {
  if (props.modelValue.includes(option)) {
    remove(option)
  } else {
    emit('update:modelValue', [...props.modelValue, option])
    search.value = ''
  }
}

function remove(option: string) {
  emit('update:modelValue', props.modelValue.filter(o => o !== option))
}
</script>
