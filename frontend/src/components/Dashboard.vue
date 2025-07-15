<template>
  <div id="dashboard" class="bg-white p-6 rounded-lg shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-neutral-900">Painel de Processos</h2>
        <p class="text-sm text-neutral-500">Visão geral dos processos</p>
      </div>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-4 gap-6 mb-6">
      <div class="bg-neutral-50 rounded-lg p-4 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200">
          <img src="../assets/folder-open-solid.svg" class="w-5 h-5"/>
        </div>
        <div>
          <div class="text-2xl text-neutral-900">{{ abertos }}</div>
          <div class="text-sm text-neutral-600">Aberto</div>
        </div>
      </div>
      <div class="bg-neutral-50 rounded-lg p-4 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200">
          <img src="../assets/spinner-solid.svg" class="w-5 h-5"/>
        </div>
        <div>
          <div class="text-2xl text-neutral-900">{{ emAndamento }}</div>
          <div class="text-sm text-neutral-600">Em andamento</div>
        </div>
      </div>
      <div class="bg-neutral-50 rounded-lg p-4 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200">
          <img src="../assets/pencil-solid.svg" class="w-5 h-5"/>
        </div>
        <div>
          <div class="text-2xl text-neutral-900">{{ revisao }}</div>
          <div class="text-sm text-neutral-600">Para revisão</div>
        </div>
      </div>
      <div class="bg-neutral-50 rounded-lg p-4 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200">
          <img src="../assets/circle-check-solid.svg" class="w-5 h-5"/>
        </div>
        <div>
          <div class="text-2xl text-neutral-900">{{ concluidos }}</div>
          <div class="text-sm text-neutral-600">Concluído</div>
        </div>
      </div>
    </div>

    <div id="tema-block" class="mt-2">
      <h3 class="text-base mb-2 text-neutral-900">Temas Mais Atuados</h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="tema in temasMaisAtuados"
          :key="tema.nome"
          class="flex items-center space-x-2 bg-neutral-100 rounded-full px-4 py-1"
        >
          <img :src="getIconPath(tema.icon)" class="h-4"/>
          <span class="text-sm text-neutral-800">{{ tema.nome }}</span>
          <span class="text-xs text-neutral-500">({{ tema.total }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  emAndamento: number
  abertos: number
  revisao: number
  concluidos: number
  temasMaisAtuados: { nome: string; total: number; icon: string }[]
}>()

const icons = import.meta.glob('../assets/*.svg', { eager: true, as: 'url' })

function getIconPath(icon: string) {
  return icons[`../assets/${icon}`] || ''
}
</script>
