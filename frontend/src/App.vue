<!-- App.vue (Versão Limpa) -->
<template>
  <main>
    <header
      id="header"
      class="w-full h-[65px] py-3 border-b bg-white shadow-sm flex items-center justify-center"
    >
      <div class="w-full max-w-[2000px] px-2 lg:px-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img
            src="./assets/scale-balanced-solid.svg"
            class="w-6 h-6"
            alt="Gabinete - Márcio Vidal"
          />
          <span class="title text-xl font-semibold text-neutral-800">Gabinete - Márcio Vidal</span>
        </div>

        <!-- Navegação -->
        <nav class="flex items-center gap-1">
          <router-link
            to="/"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.name === 'home'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z"
                ></path>
              </svg>
              Processos
            </div>
          </router-link>

          <router-link
            to="/produtividade"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.name === 'produtividade'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              Produtividade
            </div>
          </router-link>

          <router-link
            to="/ia"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="
              $route.name === 'ia'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            <div class="flex items-center gap-2">
              <img src="./assets/robot-solid.svg" class="w-4 h-4 text-neutral-400" />
              GMV IA
            </div>
          </router-link>
        </nav>
      </div>
    </header>

    <div class="flex-1 bg-[#F9FAFB]">
      <RouterView />
    </div>
  </main>

  <GlobalProgressInterface />
  <div v-if="!progressStore.minimized && progressStore.hasTasks" class="fixed bottom-4 left-4 z-50">
    <button
      @click="progressStore.showInterface()"
      class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      title="Mostrar progresso dos processos"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        ></path>
      </svg>
      <span
        v-if="progressStore.activeTasks.length > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
      >
        {{ progressStore.activeTasks.length }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
import { useProgressStore } from '@/stores/progress.store'
import GlobalProgressInterface from '@/components/GlobalProgressInterface.vue'

const progressStore = useProgressStore()

onMounted(() => {
  progressStore.initializeSocket()
})

onBeforeUnmount(() => {
  progressStore.cleanup()
})
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
  font-family: Inter;
}

.title {
  font-family: Inter;
}
</style>