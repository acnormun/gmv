<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header do Chat -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full" :class="ragStatus.available ? 'bg-green-500' : 'bg-red-500'"></div>
            <h1 class="text-xl font-semibold text-gray-900">Assistente Inteligente GMV</h1>
          </div>
          <div class="text-sm text-gray-500">
            {{ ragStatus.available ? 'Sistema RAG Online' : 'Sistema RAG Offline' }}
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button @click="limparChat" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Limpar Conversa">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
              </path>
            </svg>
          </button>

          <button @click="salvarHistorico" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Salvar Histórico">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarEstatisticas && estatisticas" class="bg-blue-50 border-b border-blue-200 px-6 py-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="text-2xl font-bold text-blue-600">{{ estatisticas.total_documents || 0 }}</div>
          <div class="text-sm text-gray-600">Documentos</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="text-2xl font-bold text-green-600">{{ estatisticas.total_chunks || 0 }}</div>
          <div class="text-sm text-gray-600">Chunks</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="text-2xl font-bold text-purple-600">{{ estatisticas.cache_size || 0 }}</div>
          <div class="text-sm text-gray-600">Cache</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="text-2xl font-bold text-orange-600">{{ Object.keys(estatisticas.tema_distribution || {}).length }}
          </div>
          <div class="text-sm text-gray-600">Temas</div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden flex">
      <div class="flex-1 flex flex-col">
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div v-if="mensagens.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                </path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Olá! Como posso ajudar?</h3>
            <p class="text-gray-600 mb-4">Faça perguntas sobre os processos, análises ou qualquer informação do sistema
              GMV.</p>

            <div v-if="sugestoes.length > 0" class="max-w-2xl mx-auto">
              <p class="text-sm text-gray-500 mb-3">Sugestões de consultas:</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button v-for="(sugestao, index) in sugestoes.slice(0, 4)" :key="index"
                  @click="enviarSugestao(sugestao.query)"
                  class="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div class="text-sm font-medium text-gray-900">{{ sugestao.query }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ sugestao.category }}</div>
                </button>
              </div>
            </div>
          </div>

          <div v-for="(mensagem, index) in mensagens" :key="index" class="flex"
            :class="mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'">
            <div class="max-w-3xl rounded-lg px-4 py-3" :class="[
              mensagem.tipo === 'usuario'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            ]">
              <div class="flex items-start space-x-3" v-if="mensagem.tipo === 'assistente'">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                    </path>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="text-sm font-medium">Assistente GMV</span>
                    <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {{ mensagem.strategy || 'RAG' }}
                    </span>
                    <span v-if="mensagem.confidence" class="text-xs text-gray-500">
                      Confiança: {{ formatarConfianca(mensagem.confidence) }}
                    </span>
                  </div>
                  <div class="prose prose-sm max-w-none" v-html="formatarMensagem(mensagem.conteudo)"></div>

                  <div v-if="mensagem.chunks && mensagem.chunks.length > 0" class="mt-3 border-t pt-3">
                    <button @click="mensagem.mostrarChunks = !mensagem.mostrarChunks"
                      class="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                      <span> 3 fonte(s) consultada(s)</span>
                      <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': mensagem.mostrarChunks }"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    <div v-if="mensagem.mostrarChunks" class="mt-2 space-y-2">
                      <div v-for="(doc, docIndex) in mensagem.chunks.slice(0, 3)" :key="docIndex"
                        class="bg-gray-50 rounded p-2 text-xs">
                        <div class="font-medium">{{ doc.metadata?.nome_documento || doc.filename }}</div>
                        <div v-if="doc.metadata" class="mt-1 text-gray-500">
                          <span class="inline-block bg-gray-200 rounded px-1 text-xs mr-1">Processo: {{
                            doc.metadata.numero_processo }}</span>
                          <span class="inline-block bg-gray-200 rounded px-1 text-xs">Páginas: {{ doc.metadata.paginas
                            }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else>
                {{ mensagem.conteudo }}
              </div>

              <div class="text-xs mt-2 opacity-70"
                :class="mensagem.tipo === 'usuario' ? 'text-blue-100' : 'text-gray-500'">
                {{ formatarHora(mensagem.timestamp) }}
              </div>
            </div>
          </div>

          <div v-if="processing" class="flex justify-start">
            <div class="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-xs">
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span class="text-sm text-gray-600">Processando...</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 bg-white px-6 py-4">
          <form @submit.prevent="enviarMensagem" class="flex space-x-4">
            <div class="flex-1 relative">
              <textarea ref="messageInput" v-model="novaMensagem" @keydown.enter.exact.prevent="enviarMensagem"
                @keydown.enter.shift.exact="novaMensagem += '\n'"
                placeholder="Digite sua pergunta sobre os processos GMV..." rows="1"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                :disabled="processing || !ragStatus.available" style="min-height: 48px; max-height: 120px;"></textarea>

              <div class="absolute bottom-1 right-2 text-xs text-gray-400">
                Enter para enviar • Shift+Enter para quebra de linha
              </div>
            </div>

            <button type="button" @click="abrirDrawerContexto"
              class="px-3 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              :class="{ 'bg-blue-50 text-blue-600': filtros.tema || filtros.status }" title="Filtros de busca">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z">
                </path>
              </svg>
            </button>

            <button type="submit" :disabled="!novaMensagem.trim() || processing || !ragStatus.available"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2">
              <svg v-if="processing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <span>{{ processing ? 'Enviando' : 'Enviar' }}</span>
            </button>
          </form>

          <div v-if="filtros.tema || filtros.status" class="mt-3 flex items-center space-x-2 text-sm">
            <span class="text-gray-500">Filtros ativos:</span>
            <span v-if="filtros.tema" class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Tema: {{ filtros.tema }}
              <button @click="filtros.tema = ''" class="ml-1 text-blue-600 hover:text-blue-800">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
            <span v-if="filtros.status"
              class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Status: {{ filtros.status }}
              <button @click="filtros.status = ''" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <div v-if="mostrarFiltros" class="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Filtros de Busca</h3>
          <button @click="mostrarFiltros = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <select v-model="filtros.tema"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos os temas</option>
              <option v-for="tema in temasDisponiveis" :key="tema" :value="tema">{{ tema }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="filtros.status"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos os status</option>
              <option v-for="status in statusDisponiveis" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Número de Resultados</label>
            <select v-model="filtros.k"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option :value="3">3 resultados</option>
              <option :value="5">5 resultados</option>
              <option :value="8">8 resultados</option>
              <option :value="10">10 resultados</option>
            </select>
          </div>

          <div class="pt-4 border-t">
            <button @click="aplicarFiltros"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2">
              Aplicar Filtros
            </button>

            <button @click="limparFiltros" class="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
              Limpar Filtros
            </button>
          </div>

          <div v-if="estatisticas" class="pt-4 border-t">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Distribuição</h4>

            <div class="space-y-2">
              <div>
                <span class="text-xs text-gray-500">Por Tema:</span>
                <div class="mt-1 space-y-1">
                  <div v-for="(count, tema) in Object.entries(estatisticas.tema_distribution).slice(0, 3)" :key="tema"
                    class="flex justify-between text-xs">
                    <span class="text-gray-700">{{ tema }}</span>
                    <span class="text-gray-500">{{ count }}</span>
                  </div>
                </div>
              </div>

              <div>
                <span class="text-xs text-gray-500">Por Status:</span>
                <div class="mt-1 space-y-1">
                  <div v-for="(count, status) in Object.entries(estatisticas.status_distribution).slice(0, 3)"
                    :key="status" class="flex justify-between text-xs">
                    <span class="text-gray-700">{{ status }}</span>
                    <span class="text-gray-500">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ContextDrawer v-if="mostrarDrawerContexto" :processosSelecionados="processosSelecionados"
    @confirmar="aplicarContextoSelecionado" @fechar="mostrarDrawerContexto = false" />

</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ContextDrawer from '@/components/ContextDrawer.vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useChatStore } from '@/stores/chat.store'
import { storeToRefs } from 'pinia'
import {
  getRAGStatus,
  queryRAG,
  getRAGSuggestions,
  type RAGResult,
  type RAGStatistics,
  type RAGSuggestion,
  formatConfidence,
  validateQuery
} from '@/api/rag'

const chatStore = useChatStore()
const { mensagens, processing, contexto} = storeToRefs(chatStore)
const novaMensagem = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

const ragStatus = ref<any>({
  available: false,
  initialized: false
})

const estatisticas = ref<RAGStatistics | null>(null)
const sugestoes = ref<RAGSuggestion[]>([])

const mostrarEstatisticas = ref(false)
const mostrarFiltros = ref(false)

const mostrarDrawerContexto = ref(false)
const processosSelecionados = ref<string[]>(contexto.value)

function abrirDrawerContexto() {
  mostrarDrawerContexto.value = true
}

function aplicarContextoSelecionado(novosProcessos: string[]) {
  processosSelecionados.value = novosProcessos
  mostrarDrawerContexto.value = false

  chatStore.setContext(novosProcessos)
}

const filtros = ref({
  tema: '',
  status: '',
  k: 5
})

const temasDisponiveis = computed(() => {
  if (!estatisticas.value?.tema_distribution) return []
  return Object.keys(estatisticas.value.tema_distribution)
})

const statusDisponiveis = computed(() => {
  if (!estatisticas.value?.status_distribution) return []
  return Object.keys(estatisticas.value.status_distribution)
})

async function verificarStatusRAG() {
  try {
    const status = await getRAGStatus()

    ragStatus.value = {
      available: status.isReady,
      initialized: status.isReady,
      error: status.error
    }
  } catch (error) {
    console.error('Erro ao verificar status do RAG:', error)
    ragStatus.value = {
      available: false,
      initialized: false,
      error: 'Erro de conexão'
    }
  }
}

async function carregarSugestoes() {
  try {
    const response = await getRAGSuggestions()
    sugestoes.value = response.suggestions || []
  } catch (error) {
    console.error('Erro ao carregar sugestões:', error)
  }
}

async function enviarMensagem() {
  if (!novaMensagem.value.trim() || processing.value || !ragStatus.value.available) {
    return
  }

  const mensagemUsuario = novaMensagem.value.trim()

  const validation = validateQuery(mensagemUsuario)
  if (!validation.valid) {
    alert(validation.error)
    return
  }

  novaMensagem.value = ''

  chatStore.addMensagem({
    tipo: 'usuario',
    conteudo: mensagemUsuario,
    timestamp: new Date()
  })

  await nextTick()
  scrollToBottom()

  processing.value = true

  try {
    const resultado: RAGResult = await queryRAG({
      question: mensagemUsuario,
      context: processosSelecionados.value,
      query: ''
    })
    chatStore.addMensagem({
      tipo: 'assistente',
      conteudo: resultado.data.answer || 'Desculpe, não consegui processar sua consulta.',
      timestamp: new Date(),
      strategy: resultado.data.search_method,
      confidence: undefined,
      chunks: resultado.data.source_documents || [],
      mostrarChunks: false
    })

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)

    chatStore.addMensagem({
      tipo: 'assistente',
      conteudo: `Desculpe, ocorreu um erro ao processar sua consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      timestamp: new Date()
    })
  } finally {
    processing.value = false
    await nextTick()
    scrollToBottom()

    if (messageInput.value) {
      messageInput.value.focus()
    }
  }
}


function enviarSugestao(query: string) {
  novaMensagem.value = query
  enviarMensagem()
}

function limparChat() {
  if (confirm('Tem certeza que deseja limpar toda a conversa?')) {
    chatStore.clear()
  }
}

function salvarHistorico() {
  const texto = chatStore.exportAsText()
  const blob = new Blob([texto], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `historico-chat-${new Date().toISOString().slice(0, 10)}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function aplicarFiltros() {
  if (mensagens.value.length > 0) {
    const ultimaMensagemUsuario = mensagens.value
      .slice()
      .reverse()
      .find(m => m.tipo === 'usuario')

    if (ultimaMensagemUsuario) {
      novaMensagem.value = ultimaMensagemUsuario.conteudo
      enviarMensagem()
    }
  }
}

function limparFiltros() {
  filtros.value.tema = ''
  filtros.value.status = ''
  filtros.value.k = 5
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatarMensagem(conteudo: string): string {
  return conteudo
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '&bull;')
}

function formatarHora(timestamp: Date): string {
  return timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatarConfianca(confidence: number): string {
  return formatConfidence(confidence)
}


onMounted(async () => {
  chatStore.load()
  await verificarStatusRAG()
  await carregarSugestoes()
  if (messageInput.value) {
    messageInput.value.focus()
  }
  await nextTick()
  scrollToBottom()
})

watch(novaMensagem, () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
})


onMounted(() => {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + L para limpar chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault()
      limparChat()
    }

    // Ctrl/Cmd + / para focar no input
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      if (messageInput.value) {
        messageInput.value.focus()
      }
    }
  })
})

</script>

<style scoped>
@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.prose {
  color: inherit;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}
</style>