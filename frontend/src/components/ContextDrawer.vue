<template>
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
    <div class="w-96 bg-white p-6 shadow-xl h-full overflow-auto">
      <h2 class="text-lg font-semibold mb-4">Selecionar Processos para Contexto</h2>

      <MultiSelect
        v-model="selecionados"
        :options="opcoesProcessos"
        label="Selecione os processos"
        placeholder="Digite ou selecione..."
      />

      <div class="mt-6 flex justify-end space-x-2">
        <button @click="$emit('fechar')" class="px-4 py-2 border rounded">Cancelar</button>
        <button @click="confirmar" class="px-4 py-2 bg-blue-600 text-white rounded">Aplicar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTriagemStore } from '@/stores/triagem.store';
import MultiSelect from './MultiSelect.vue';
import { ref } from 'vue'

const props = defineProps<{
  processosSelecionados: string[]
}>()

const emit = defineEmits(['fechar', 'confirmar'])

const store = useTriagemStore()
const selecionados = ref([...props.processosSelecionados])
const opcoesProcessos = ref<string[]>(store.processos.map(item => item.numeroProcesso))

function confirmar() {
  emit('confirmar', selecionados.value)
}
</script>
