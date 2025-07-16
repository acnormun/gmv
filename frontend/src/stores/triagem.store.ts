// src/stores/useTriagemStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProcessos, type Processo } from '@/api/triagem'

export const useTriagemStore = defineStore('triagem', () => {
  const processos = ref<Processo[]>([])
  const processoSelecionado = ref<Processo | null>(null)
  const processosFiltrados = ref<Processo[]>([])

  async function carregarProcessos() {
    const data = await getProcessos().then((res) => res.map((item) => ({
      ...item,
      comentarios: item.comentarios === 'nan' ? '' : item.comentarios,
      suspeitos: item.suspeitos === 'nan' ? null : item.suspeitos
    })));
    processos.value = data
    processosFiltrados.value = [...data]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filtrar(filtros: Record<string, any>) {
    processosFiltrados.value = processos.value.filter((proc) => {
      return (
        (!filtros.numeroProcesso || proc.numeroProcesso.includes(filtros.numeroProcesso)) &&
        (!filtros.tema?.length || filtros.tema.includes(proc.tema)) &&
        (!filtros.dataDistribuicao || proc.dataDistribuicao === filtros.dataDistribuicao) &&
        (!filtros.responsavel ||
          proc.responsavel.toLowerCase().includes(filtros.responsavel.toLowerCase())) &&
        (!filtros.status || proc.status === filtros.status) &&
        (!filtros.prioridade || proc.prioridade === filtros.prioridade) &&
        (!filtros.ultimaAtualizacao || proc.ultimaAtualizacao === filtros.ultimaAtualizacao)
      )
    })

    return processosFiltrados.value
  }

  function selecionarProcesso(processo: Processo) {
    processoSelecionado.value = { ...processo }
  }

  function limparSelecionado() {
    processoSelecionado.value = null
  }

  return {
    processos,
    processoSelecionado,
    processosFiltrados,
    carregarProcessos,
    filtrar,
    selecionarProcesso,
    limparSelecionado,
  }
})
