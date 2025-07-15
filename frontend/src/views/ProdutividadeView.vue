<template>
  <main class="min-h-screen bg-[#F9FAFB]">
    <div class="w-full max-w-[2000px] mx-auto px-1 sm:px-2 lg:px-3 py-4 lg:py-6">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Produtividade por Assessor</h1>
            <p class="text-gray-600">Análise de performance e distribuição de processos</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="refreshData"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Atualizar
            </button>
            <router-link 
              to="/"
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Voltar
            </router-link>
          </div>
        </div>
      </div>

      <!-- Métricas Gerais -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total de Processos</p>
              <p class="text-2xl font-bold text-gray-900">{{ estatisticasGerais.total }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Em Aberto</p>
              <p class="text-2xl font-bold text-gray-900">{{ estatisticasGerais.abertos }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Atrasados</p>
              <p class="text-2xl font-bold text-gray-900">{{ estatisticasGerais.atrasados }}</p>
              <p class="text-xs text-gray-500">apenas em aberto</p>
            </div>
            <div class="p-3 bg-red-100 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Concluídos</p>
              <p class="text-2xl font-bold text-gray-900">{{ estatisticasGerais.concluidos }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Produtividade por Assessor -->
      <div class="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-6">
        <!-- Tabela de Assessores -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Produtividade por Assessor</h2>
          <div class="overflow-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-3 font-medium text-gray-700">Assessor</th>
                  <th class="text-left py-3 px-3 font-medium text-gray-700">Total</th>
                  <th class="text-left py-3 px-3 font-medium text-gray-700">Abertos</th>
                  <th class="text-left py-3 px-3 font-medium text-gray-700">Atrasados</th>
                  <th class="text-left py-3 px-3 font-medium text-gray-700">% Atraso</th>
                  <th class="text-left py-3 px-3 font-medium text-gray-700">Eficiência</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="assessor in dadosAssessores" 
                  :key="assessor.nome"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-3">
                      <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        :style="{ backgroundColor: assessor.cor }"
                      >
                        {{ assessor.iniciais }}
                      </div>
                      <span class="font-medium text-gray-900">{{ assessor.nome }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-gray-700">{{ assessor.total }}</td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {{ assessor.abertos }}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <span 
                      class="px-2 py-1 rounded-full text-sm"
                      :class="assessor.atrasados > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ assessor.atrasados }}
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <span 
                      class="font-medium"
                      :class="assessor.percentualAtraso > 30 ? 'text-red-600' : assessor.percentualAtraso > 15 ? 'text-yellow-600' : 'text-green-600'"
                    >
                      {{ assessor.percentualAtraso }}%
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full transition-all"
                          :class="assessor.eficiencia > 80 ? 'bg-green-500' : assessor.eficiencia > 60 ? 'bg-yellow-500' : 'bg-red-500'"
                          :style="{ width: assessor.eficiencia + '%' }"
                        ></div>
                      </div>
                      <span class="text-sm font-medium text-gray-700">{{ assessor.eficiencia }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Ranking de Eficiência -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Ranking de Eficiência</h2>
          <div class="space-y-4">
            <div 
              v-for="(assessor, index) in rankingEficiencia" 
              :key="assessor.nome"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="index === 0 ? 'bg-green-50 border-green-200' : index === 1 ? 'bg-blue-50 border-blue-200' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  :class="index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-orange-500' : 'bg-gray-500'"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ assessor.nome }}</p>
                  <p class="text-sm text-gray-600">{{ assessor.abertos }} em aberto • {{ assessor.total }} total</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ assessor.eficiencia }}%</p>
                <p class="text-sm text-gray-600">{{ assessor.atrasados }} atrasados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Temas por Assessor -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Distribuição de Temas por Assessor</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div 
            v-for="assessor in dadosAssessores" 
            :key="assessor.nome"
            class="border rounded-lg p-4"
          >
            <div class="flex items-center gap-2 mb-3">
              <div 
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                :style="{ backgroundColor: assessor.cor }"
              >
                {{ assessor.iniciais }}
              </div>
              <h3 class="font-medium text-gray-900">{{ assessor.nome }}</h3>
              <span class="text-sm text-gray-500">({{ assessor.total }})</span>
            </div>
            <div class="space-y-2">
              <div 
                v-for="tema in assessor.temas" 
                :key="tema.nome"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-700">{{ tema.nome }}</span>
                <span class="font-medium text-gray-900">{{ tema.quantidade }}</span>
              </div>
              <div v-if="assessor.temas.length === 0" class="text-sm text-gray-500 italic">
                Nenhum processo
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas e Pendências -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <!-- Processos Críticos -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            Processos Críticos (15+ dias em aberto)
          </h2>
          <div class="space-y-3 max-h-80 overflow-y-auto">
            <div 
              v-for="processo in processosCriticos" 
              :key="processo.numeroProcesso"
              class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ processo.numeroProcesso }}</p>
                <p class="text-sm text-gray-600">{{ processo.responsavel }} • {{ processo.tema }}</p>
                <p class="text-xs text-gray-500">Status: {{ processo.status }}</p>
              </div>
              <div class="text-right">
                <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {{ getDiasAtraso(processo.dataDistribuicao) }} dias
                </span>
              </div>
            </div>
            <div v-if="processosCriticos.length === 0" class="text-center py-8 text-gray-500">
              🎉 Nenhum processo crítico!
            </div>
          </div>
        </div>

        <!-- Processos com Suspeitos -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Processos com Suspeitos
          </h2>
          <div class="space-y-3 max-h-80 overflow-y-auto">
            <div 
              v-for="processo in processosComSuspeitos" 
              :key="processo.numeroProcesso"
              class="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ processo.numeroProcesso }}</p>
                <p class="text-sm text-gray-600">{{ processo.responsavel }} • {{ processo.tema }}</p>
                <p class="text-xs text-gray-500">Status: {{ processo.status }}</p>
              </div>
              <div class="text-right">
                <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {{ getSuspeitosCount(processo) }} suspeito(s)
                </span>
              </div>
            </div>
            <div v-if="processosComSuspeitos.length === 0" class="text-center py-8 text-gray-500">
              ✅ Nenhum processo com suspeitos!
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTriagemStore } from '@/stores/triagem.store'
import type { Processo } from '@/api/triagem'

const store = useTriagemStore()

const responsaveis = [
  'LOURIVAL', 'NAIRA', 'NATÁLIA', 'JUSSARA', 
  'LEISI', 'JORDAM', 'RAQUEL', 'FERNANDA', 'VANUCE'
]

// Função para gerar cores consistentes para cada assessor
function getCorAssessor(nome: string): string {
  const cores = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ]
  const index = responsaveis.indexOf(nome)
  return cores[index] || '#6B7280'
}

// Função para obter iniciais
function getIniciais(nome: string): string {
  return nome.split(' ').map(n => n[0]).join('').substring(0, 2)
}

// Função para calcular dias de atraso
function getDiasAtraso(dataDistribuicao: string): number {
  if (!dataDistribuicao) return 0
  
  try {
    let dataDistrib: Date
    
    if (dataDistribuicao.includes('/')) {
      const [dia, mes, ano] = dataDistribuicao.split('/')
      dataDistrib = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
    } else if (dataDistribuicao.includes('-')) {
      dataDistrib = new Date(dataDistribuicao)
    } else {
      return 0
    }
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    dataDistrib.setHours(0, 0, 0, 0)
    
    const diferencaMs = hoje.getTime() - dataDistrib.getTime()
    const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diferencaDias)
  } catch (error) {
    return 0
  }
}

// Função para verificar se tem suspeitos
function temSuspeitos(item: Processo): boolean {
  if (!item.suspeitos) return false
  
  if (Array.isArray(item.suspeitos)) {
    return item.suspeitos.length > 0 && item.suspeitos.some(s => s !== null && s !== undefined && s !== '')
  }
  
  if (typeof item.suspeitos === 'string') {
    return item.suspeitos.trim() !== '' && item.suspeitos !== 'nan'
  }
  
  return false
}

// Função para obter quantidade de suspeitos
function getSuspeitosCount(item: Processo): number {
  if (!temSuspeitos(item)) return 0
  
  if (Array.isArray(item.suspeitos)) {
    return item.suspeitos.filter(s => s !== null && s !== undefined && s !== '').length
  }
  
  if (typeof item.suspeitos === 'string') {
    return item.suspeitos.split(',').filter(s => s.trim() !== '').length
  }
  
  return 0
}

// Função para verificar se processo está atrasado (só processos em aberto)
function isProcessoAtrasado(processo: Processo): boolean {
  const statusEmAberto = ['Aberto', 'Em andamento', 'Para revisão']
  return statusEmAberto.includes(processo.status) && getDiasAtraso(processo.dataDistribuicao) > 6
}

// Estatísticas gerais
const estatisticasGerais = computed(() => {
  const processos = store.processos
  return {
    total: processos.length,
    abertos: processos.filter(p => ['Aberto', 'Em andamento', 'Para revisão'].includes(p.status)).length,
    atrasados: processos.filter(p => isProcessoAtrasado(p)).length,
    concluidos: processos.filter(p => p.status === 'Concluído').length
  }
})

// Dados por assessor
const dadosAssessores = computed(() => {
  return responsaveis.map(responsavel => {
    const processos = store.processos.filter(p => p.responsavel === responsavel)
    const abertos = processos.filter(p => ['Aberto', 'Em andamento', 'Para revisão'].includes(p.status)).length
    const atrasados = processos.filter(p => isProcessoAtrasado(p)).length
    
    // Calcula percentual de atraso baseado apenas nos processos em aberto
    const processosEmAberto = processos.filter(p => ['Aberto', 'Em andamento', 'Para revisão'].includes(p.status))
    const percentualAtraso = processosEmAberto.length > 0 ? Math.round((atrasados / processosEmAberto.length) * 100) : 0
    const eficiencia = processosEmAberto.length > 0 ? Math.max(0, 100 - percentualAtraso) : 100
    
    // Temas por assessor
    const temasMap = new Map<string, number>()
    processos.forEach(p => {
      if (p.tema) {
        temasMap.set(p.tema, (temasMap.get(p.tema) || 0) + 1)
      }
    })
    
    const temas = [...temasMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
    
    return {
      nome: responsavel,
      iniciais: getIniciais(responsavel),
      cor: getCorAssessor(responsavel),
      total: processos.length,
      abertos,
      atrasados,
      percentualAtraso,
      eficiencia,
      temas
    }
  }).filter(assessor => assessor.total > 0) // Só mostra assessores com processos
})

// Ranking de eficiência
const rankingEficiencia = computed(() => {
  return [...dadosAssessores.value]
    .sort((a, b) => b.eficiencia - a.eficiencia)
    .slice(0, 5)
})

// Processos críticos (15+ dias e em aberto)
const processosCriticos = computed(() => {
  return store.processos
    .filter(p => ['Aberto', 'Em andamento', 'Para revisão'].includes(p.status))
    .filter(p => getDiasAtraso(p.dataDistribuicao) >= 15)
    .sort((a, b) => getDiasAtraso(b.dataDistribuicao) - getDiasAtraso(a.dataDistribuicao))
    .slice(0, 10)
})

// Processos com suspeitos
const processosComSuspeitos = computed(() => {
  return store.processos
    .filter(p => temSuspeitos(p))
    .slice(0, 10)
})

async function refreshData() {
  await store.carregarProcessos()
}

onMounted(async () => {
  await store.carregarProcessos()
})
</script>