<template>
  <div id="main-content" class="col-span-9">
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl">Processos</h1>
        <div class="flex space-x-2">
          <button @click="exportarTabelaParaPdf" class="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-neutral-50">
            <img src="../assets/download-solid.svg" class="h-5 w-5" alt="Exportar" />
            <span>Exportar</span>
          </button>
          <button @click="abrirNovo" class="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800">
            <img src="@/assets/plus-solid.svg" class="w-4 h-4" />
            Novo Processo
          </button>
          <AddTriagem :open="showModal" :mode="modalMode" @close="showModal = false" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full table-fixed">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 w-48">Nº Processo</th>
              <th class="text-left py-3 px-4 w-32">Tema</th>
              <th class="text-left py-3 px-4 w-36">Data da Distribuição</th>
              <th class="text-left py-3 px-4 w-28">Responsável</th>
              <th class="text-left py-3 px-8 w-36">Status</th>
              <th class="text-left py-3 px-4 w-36">Prioridade</th>
              <th class="text-left py-3 px-4 w-36">Última Atualização</th>
              <th class="text-left py-3 px-4 w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in processosPaginados" :key="index" class="border-b hover:bg-neutral-50" :class="[
              item.suspeitos && 'bg-yellow-100',
              verificarProcessoEmAtraso(item) && 'bg-red-50 border-red-200'
            ]">
              <td class="py-3 px-4 truncate text-sm" :title="item.numeroProcesso">
                <div class="flex items-center space-x-2">
                  <span v-if="verificarProcessoEmAtraso(item) && !verificaImpedimento(item)" class="text-red-500" title="Processo em atraso">⏰</span>
                  <span>{{ item.numeroProcesso }}</span>
                </div>
              </td>
              <td class="py-3 px-4 truncate text-sm" :title="item.tema">{{ item.tema }}</td>
              <td class="py-3 px-4 text-sm">{{ item.dataDistribuicao }}</td>
              <td class="py-3 px-4 truncate text-sm" :title="item.responsavel">{{ item.responsavel }}</td>
              <td class="py-3 px-8">
                <span class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap" :class="statusPillClass(item.status)">{{ item.status }}</span>
              </td>
              <td class="py-3 px-4 truncate text-sm" :title="item.prioridade">{{ item.prioridade }}</td>
              <td class="py-3 px-4 text-sm">{{ item.ultimaAtualizacao }}</td>
              <td class="py-3 px-4 relative">
                <button class="text-neutral-600 hover:text-neutral-900 mr-2" @click="abrirModal('view', item)" title="Visualizar processo">
                  <img src="@/assets/eye-solid.svg" class="w-4 h-4" />
                </button>
                <button class="text-neutral-600 hover:text-neutral-900 mr-2" @click="(e) => toggleMenu(index, e)" title="Mais opções">
                  <img src="@/assets/ellipsis-vertical-solid.svg" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-center items-center space-x-2 mt-4">
        <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
        <span class="text-sm">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="px-3 py-1 border rounded disabled:opacity-40">Próxima</button>
      </div>

      <teleport to="body">
        <div v-if="menuAberto !== null" :style="menuEstilo" class="absolute z-50 w-32 bg-white border rounded shadow-md">
          <button @click="abrirModal('edit', lista[menuAberto])" class="block w-full text-left text-sm px-4 py-2 hover:bg-neutral-100">Editar</button>
          <button @click="abrirArquivo(lista[menuAberto])" class="block w-full text-left text-sm px-4 py-2 hover:bg-neutral-100">Ver arquivo</button>
          <button @click="excluir(lista[menuAberto])" class="block w-full text-left text-sm px-4 py-2 text-red-600 hover:bg-neutral-100">Excluir</button>
        </div>
      </teleport>

      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-neutral-600">
          Mostrando {{ (paginaAtual - 1) * itensPorPagina + 1 }} - {{ Math.min(paginaAtual * itensPorPagina, lista.length) }} de {{ lista.length }} resultados
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import AddTriagem from './AddTriagem.vue'
import type { Processo } from '@/api/triagem'
import { useTriagemStore } from '@/stores/triagem.store'
import { deleteProcesso, getProcesso } from '@/api/triagem'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const store = useTriagemStore()
const showModal = ref(false)
const modalMode = ref<'new' | 'view' | 'edit'>('new')
const menuAberto = ref<number | null>(null)
const menuPos = ref({ top: 0, left: 0 })

const paginaAtual = ref(1)
const itensPorPagina = 5

const emit = defineEmits(['refresh'])

const props = defineProps<{
  data: Processo[]
}>()

const lista = computed(() => store.processos)

const totalPaginas = computed(() =>
  Math.ceil(lista.value.length / itensPorPagina)
)

const processosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return lista.value.slice(inicio, fim)
})

function solicitarAtualizacao() {
  emit('refresh')
}

function abrirNovo() {
  store.limparSelecionado()
  modalMode.value = 'new'
  showModal.value = true
}

function abrirModal(mode: 'view' | 'edit', processo: Processo) {
  store.selecionarProcesso(processo)
  modalMode.value = mode
  showModal.value = true
  menuAberto.value = null
}

async function abrirArquivo(processo: Processo) {
  await getProcesso(processo.numeroProcesso)
}

function toggleMenu(index: number, event: MouseEvent) {
  if (menuAberto.value === index) {
    menuAberto.value = null
    return
  }

  const button = (event.target as HTMLElement).closest('button')
  if (button) {
    const rect = button.getBoundingClientRect()
    menuPos.value = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    }
  }

  menuAberto.value = index
}

const menuEstilo = computed(() => {
  return `top: ${menuPos.value.top}px; left: ${menuPos.value.left}px;`
})

async function excluir(processo: Processo) {
  const confirmacao = confirm(
    `Tem certeza que deseja excluir o processo ${processo.numeroProcesso}?`,
  )
  if (!confirmacao) return

  try {
    await deleteProcesso(processo.numeroProcesso)
    solicitarAtualizacao()
  } catch {
    alert('Erro ao excluir processo.')
  } finally {
    menuAberto.value = null
  }
}

function exportarTabelaParaPdf() {
  const doc = new jsPDF()

  autoTable(doc, {
    head: [[
      'Nº Processo', 'Tema', 'Data da Distribuição',
      'Responsável', 'Status','Prioridade', 'Última Atualização'
    ]],
    body: lista.value.map(item => [
      item.numeroProcesso,
      item.tema,
      item.dataDistribuicao,
      item.responsavel,
      item.status,
      item.prioridade,
      item.ultimaAtualizacao,
    ]),
    margin: { top: 20 },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
  })

  doc.save('processos.pdf')
}

function statusPillClass(status: string): string {
  switch (status) {
    case 'Aberto':
      return 'bg-neutral-300 text-neutral-800'
    case 'Em andamento':
      return 'bg-blue-100 text-blue-800'
    case 'Para revisão':
      return 'bg-yellow-100 text-yellow-800'
    case 'Concluído':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-neutral-100 text-neutral-600'
  }
}

function verificarProcessoEmAtraso(processo: Processo): boolean {
  if (processo.status === 'Concluído') {
    return false
  }

  const hoje = new Date()

  if (processo.dataDistribuicao) {
    const dataDistribuicao = new Date(processo.dataDistribuicao)
    const diasSemConclusao = Math.floor((hoje.getTime() - dataDistribuicao.getTime()) / (1000 * 60 * 60 * 24))

    if (diasSemConclusao > 15) {
      return true
    }
  }

  return false
}

function verificaImpedimento(processo: Processo): boolean {
  let impedimentos: any = [];
  if (typeof processo.suspeitos === 'string') {
    try {
      impedimentos = JSON.parse(processo.suspeitos);
    } catch {
      impedimentos = [];
    }
  }
  return Array.isArray(impedimentos) && impedimentos.length > 0;
}
</script>