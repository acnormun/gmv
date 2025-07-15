import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface Mensagem {
  tipo: 'usuario' | 'assistente'
  conteudo: string
  timestamp: Date
  strategy?: string
  confidence?: number
  chunks?: any[]
  mostrarChunks?: boolean
}

const STORAGE_KEY = 'chat-history'

export const useChatStore = defineStore('chat', () => {
  const mensagens = ref<Mensagem[]>([])
  const processing = ref(false)
  const contexto = ref<string[]>([])

  function addMensagem(mensagem: Mensagem) {
    mensagens.value.push(mensagem)
  }

  function setContext(providedContext: string[]) {
    contexto.value = providedContext
  }

  function getContext() {
    return contexto.value
  }

  function clear() {
    mensagens.value = []
    contexto.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Mensagem[]
        mensagens.value = parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
      } catch (e) {
        console.error('Erro ao carregar histórico do chat:', e)
      }
    }
  }

  function exportAsText(): string {
    return mensagens.value
      .map((m) => `[${new Date(m.timestamp).toLocaleString('pt-BR')}] ${m.tipo === 'usuario' ? 'Usuário' : 'Assistente'}: ${m.conteudo}`)
      .join('\n')
  }

  watch(
    mensagens,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  return { 
    mensagens, 
    processing, 
    contexto,
    addMensagem, 
    setContext,
    getContext,
    clear, 
    load, 
    exportAsText 
  }
})