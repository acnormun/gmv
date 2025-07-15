/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, readonly, computed } from 'vue'

export interface RAGQueryRequest {
  question: string,
  context: string[],
  query: string
}

export interface RAGSearchRequest {
  query: string
  filters?: {
    tema?: string
    status?: string
    responsavel?: string
    suspeitos?: string
  }
  k?: number
}

export interface RAGChunk {
  chunk_id: number
  content: string
  similarity: number
  metadata: {
    document_id: string
    chunk_id: number
    tema: string
    status: string
    suspeitos: string[]
    data_distribuicao: string
  }
}

export interface RAGSourceDocument {
  metadata: Record<string, any>
  content?: string
  filename: string
}

export interface RAGResult {
  data: {
    answer: string
    context_size: number
    documents_count: number
    processing_time: number
    question: string
    search_method: string
    source_documents: RAGSourceDocument[]
  }
}

export interface RAGStatus {
  isReady: boolean
  documents_loaded: number,
  message: string,
  method: string,
  status: string,
  error?: string
}

export interface RAGStatistics {
  total_documents: number
  total_chunks: number
  cache_size: number
  is_initialized: boolean
  status_distribution: Record<string, number>
  tema_distribution: Record<string, number>
  top_suspeitos: Record<string, number>
  system_info?: {
    rag_available: boolean
    rag_initialized: boolean
    paths: {
      triagem: string
      processos: string
      dat: string
    }
  }
}

export interface RAGSuggestion {
  type: 'factual' | 'analytical' | 'opinion' | 'contextual'
  query: string
  category: string
}

export interface RAGSuggestionsResponse {
  suggestions: RAGSuggestion[]
  total_suggestions: number
  based_on_data: {
    total_documents: number
    unique_themes: number
    unique_status: number
  }
}

export interface RAGHealthStatus {
  status: 'healthy' | 'unhealthy' | 'error'
  rag_available: boolean
  rag_initialized: boolean
  timestamp: string
  documents_loaded?: number
  chunks_processed?: number
  cache_size?: number
  error?: string
}

export interface ProcessAnalysis {
  processo: string
  analise: RAGResult
  timestamp: string
}

export interface DashboardInsights {
  insights: Array<{
    question: string
    insight: string
    confidence: number
    strategy: string
  }>
  statistics: RAGStatistics
  rag_available: boolean
  generated_at: string
}

export interface ContextConfig {
  documentos: string[]
  processos: string[]
  incluir_metadata?: boolean
}

export interface RAGQueryWithContextRequest {
  question: string
  context: ContextConfig
  k?: number
}

export interface RAGContextResult extends RAGResult {
  data: RAGResult['data'] & {
    context_info: {
      documentos_selecionados: string[]
      processos_selecionados: string[]
      total_filtered_docs: number
      relevant_chunks: number
    }
  }
}

export interface DocumentoDisponivel {
  filename: string
  metadata?: Record<string, any>
}

export interface ProcessoTriagem {
  numeroProcesso: string
  tema: string
  dataDistribuicao: string
  responsavel: string
  status: string
  ultimaAtualizacao: string
  suspeitos: string
  comentarios?: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export class RAGAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'RAGAPIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new RAGAPIError(
      errorData.error || `Erro HTTP ${response.status}`,
      response.status,
      errorData
    )
  }
  return response.json()
}

export async function getRAGStatus(): Promise<RAGStatus> {
  const response = await fetch(`${API_BASE}/api/rag/status`)
  return handleResponse<RAGStatus>(response)
}

export async function queryRAG(request: RAGQueryRequest): Promise<RAGResult> {
  const response = await fetch(`${API_BASE}/api/rag/query-with-context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: request.question,
      context: request.context || ''
    })
  })

  return handleResponse<RAGResult>(response)
}

export async function searchRAG(request: RAGSearchRequest): Promise<RAGResult> {
  const response = await fetch(`${API_BASE}/rag/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })
  return handleResponse<RAGResult>(response)
}

export async function getRAGStatistics(): Promise<RAGStatistics> {
  const response = await fetch(`${API_BASE}/api/rag/statistics`)
  return handleResponse<RAGStatistics>(response)
}

export async function getRAGSuggestions(): Promise<RAGSuggestionsResponse> {
  const response = await fetch(`${API_BASE}/rag/suggestions`)
  return handleResponse<RAGSuggestionsResponse>(response)
}

export async function reinitializeRAG(): Promise<{ success: boolean; message: string; statistics?: RAGStatistics }> {
  const response = await fetch(`${API_BASE}/rag/reinitialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  return handleResponse(response)
}

export async function getRAGHealth(): Promise<RAGHealthStatus> {
  const response = await fetch(`${API_BASE}/rag/health`)
  return handleResponse<RAGHealthStatus>(response)
}

export async function analyzeProcess(numeroProcesso: string): Promise<ProcessAnalysis> {
  const response = await fetch(`${API_BASE}/triagem/${numeroProcesso}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  return handleResponse<ProcessAnalysis>(response)
}

export async function getDashboardInsights(): Promise<DashboardInsights> {
  const response = await fetch(`${API_BASE}/dashboard/insights`)
  return handleResponse<DashboardInsights>(response)
}

export async function queryRAGWithContext(request: RAGQueryWithContextRequest): Promise<RAGContextResult> {
  const response = await fetch(`${API_BASE}/api/rag/query-with-context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })

  return handleResponse<RAGContextResult>(response)
}

export async function getDocumentosDisponiveis(): Promise<{
  success: boolean
  documentos: string[]
  total: number
}> {
  const response = await fetch(`${API_BASE}/api/rag/documentos-disponiveis`)
  return handleResponse(response)
}

export async function getProcessosTriagem(): Promise<{
  success: boolean
  processos: ProcessoTriagem[]
  total: number
}> {
  const response = await fetch(`${API_BASE}/api/rag/processos-triagem`)
  return handleResponse(response)
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`
}

export function formatProcessingTime(time: number): string {
  if (time < 1) {
    return `${(time * 1000).toFixed(0)}ms`
  }
  return `${time.toFixed(2)}s`
}

export function getStrategyColor(strategy: string): string {
  const colors = {
    factual: 'blue',
    analytical: 'green',
    contextual: 'purple',
    opinion: 'orange',
    default: 'gray'
  }
  return colors[strategy as keyof typeof colors] || colors.default
}

export function getStrategyDescription(strategy: string): string {
  const descriptions = {
    factual: 'Busca informações específicas e objetivas',
    analytical: 'Realiza análises comparativas e estatísticas',
    contextual: 'Considera contexto e metadados relevantes',
    opinion: 'Identifica padrões e tendências',
    default: 'Estratégia não identificada'
  }
  return descriptions[strategy as keyof typeof descriptions] || descriptions.default
}

export function validateQuery(query: string): { valid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Consulta não pode estar vazia' }
  }

  if (query.trim().length < 3) {
    return { valid: false, error: 'Consulta deve ter pelo menos 3 caracteres' }
  }

  if (query.length > 1000) {
    return { valid: false, error: 'Consulta muito longa (máximo 1000 caracteres)' }
  }

  return { valid: true }
}

export function buildFilteredQuery(baseQuery: string, filters: RAGSearchRequest['filters']): string {
  if (!filters) return baseQuery

  const filterParts: string[] = []

  if (filters.tema) {
    filterParts.push(`tema: ${filters.tema}`)
  }

  if (filters.status) {
    filterParts.push(`status: ${filters.status}`)
  }

  if (filters.responsavel) {
    filterParts.push(`responsável: ${filters.responsavel}`)
  }

  if (filters.suspeitos) {
    filterParts.push(`suspeitos: ${filters.suspeitos}`)
  }

  if (filterParts.length === 0) return baseQuery

  return `${baseQuery} considerando ${filterParts.join(', ')}`
}

export function extractKeywords(query: string): string[] {
  const cleaned = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const stopWords = new Set([
    'a', 'o', 'e', 'de', 'da', 'do', 'em', 'para', 'com', 'que', 'por',
    'qual', 'quais', 'como', 'quando', 'onde', 'porque', 'se', 'mais',
    'menos', 'muito', 'pouco', 'sobre', 'entre', 'sem', 'mas', 'ou'
  ])

  return cleaned
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10)
}

export function suggestRelatedQueries(keywords: string[]): string[] {
  const templates = [
    'Quais processos envolvem {keyword}?',
    'Analise os casos relacionados a {keyword}',
    'Mostre estatísticas sobre {keyword}',
    'Compare processos com {keyword}',
    'Identifique padrões em {keyword}'
  ]

  const suggestions: string[] = []

  keywords.slice(0, 3).forEach(keyword => {
    const template = templates[Math.floor(Math.random() * templates.length)]
    suggestions.push(template.replace('{keyword}', keyword))
  })

  return suggestions
}

export function filtrarDocumentos(documentos: string[], busca: string): string[] {
  if (!busca.trim()) return documentos

  const termo = busca.toLowerCase()
  return documentos.filter(doc =>
    doc.toLowerCase().includes(termo)
  )
}

export function filtrarProcessos(
  processos: ProcessoTriagem[],
  filtros: {
    tema?: string
    status?: string
    responsavel?: string
    busca?: string
  }
): ProcessoTriagem[] {
  let resultado = [...processos]

  if (filtros.tema) {
    resultado = resultado.filter(p => p.tema === filtros.tema)
  }

  if (filtros.status) {
    resultado = resultado.filter(p => p.status === filtros.status)
  }

  if (filtros.responsavel) {
    resultado = resultado.filter(p => p.responsavel === filtros.responsavel)
  }

  if (filtros.busca) {
    const termo = filtros.busca.toLowerCase()
    resultado = resultado.filter(p =>
      p.numeroProcesso.toLowerCase().includes(termo) ||
      p.tema.toLowerCase().includes(termo) ||
      p.responsavel.toLowerCase().includes(termo)
    )
  }

  return resultado
}

export function obterTemasUnicos(processos: ProcessoTriagem[]): string[] {
  const temas = new Set(processos.map(p => p.tema))
  return Array.from(temas).sort()
}

export function obterResponsaveisUnicos(processos: ProcessoTriagem[]): string[] {
  const responsaveis = new Set(processos.map(p => p.responsavel))
  return Array.from(responsaveis).sort()
}

export function obterStatusUnicos(processos: ProcessoTriagem[]): string[] {
  const status = new Set(processos.map(p => p.status))
  return Array.from(status).sort()
}

export function validarContexto(contexto: ContextConfig): { valid: boolean; error?: string } {
  if (contexto.documentos.length === 0 && contexto.processos.length === 0) {
    return { valid: false, error: 'Selecione pelo menos um documento ou processo' }
  }

  if (contexto.documentos.length > 50) {
    return { valid: false, error: 'Máximo de 50 documentos permitidos' }
  }

  if (contexto.processos.length > 50) {
    return { valid: false, error: 'Máximo de 50 processos permitidos' }
  }

  return { valid: true }
}

export function useRAG() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const status = ref<RAGStatus | null>(null)
  const statistics = ref<RAGStatistics | null>(null)

  const checkStatus = async () => {
    try {
      isLoading.value = true
      error.value = null
      status.value = await getRAGStatus()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido'
    } finally {
      isLoading.value = false
    }
  }

  const query = async (queryRequest: RAGQueryRequest): Promise<RAGResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      const validation = validateQuery(queryRequest.query)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      return await queryRAG(queryRequest)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro na consulta'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const search = async (searchRequest: RAGSearchRequest): Promise<RAGResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      const validation = validateQuery(searchRequest.query)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      return await searchRAG(searchRequest)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro na busca'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    status: readonly(status),
    statistics: readonly(statistics),
    checkStatus,
    query,
    search
  }
}

export function useRAGWithContext() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const contextConfig = ref<ContextConfig>({
    documentos: [],
    processos: [],
    incluir_metadata: true
  })

  const documentosDisponiveis = ref<string[]>([])
  const processosTriagem = ref<ProcessoTriagem[]>([])
  const isLoadingData = ref(false)

  const carregarDadosIniciais = async () => {
    try {
      isLoadingData.value = true
      error.value = null

      const [docsResponse, processosResponse] = await Promise.all([
        getDocumentosDisponiveis(),
        getProcessosTriagem()
      ])

      if (docsResponse.success) {
        documentosDisponiveis.value = docsResponse.documentos
      }

      if (processosResponse.success) {
        processosTriagem.value = processosResponse.processos
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar dados'
      console.error('Erro ao carregar dados iniciais:', err)
    } finally {
      isLoadingData.value = false
    }
  }

  const adicionarDocumento = (documento: string) => {
    if (!contextConfig.value.documentos.includes(documento)) {
      contextConfig.value.documentos.push(documento)
    }
  }

  const removerDocumento = (documento: string) => {
    const index = contextConfig.value.documentos.indexOf(documento)
    if (index > -1) {
      contextConfig.value.documentos.splice(index, 1)
    }
  }

  const adicionarProcesso = (numeroProcesso: string) => {
    if (!contextConfig.value.processos.includes(numeroProcesso)) {
      contextConfig.value.processos.push(numeroProcesso)
    }
  }

  const removerProcesso = (numeroProcesso: string) => {
    const index = contextConfig.value.processos.indexOf(numeroProcesso)
    if (index > -1) {
      contextConfig.value.processos.splice(index, 1)
    }
  }

  const toggleProcesso = (numeroProcesso: string) => {
    if (contextConfig.value.processos.includes(numeroProcesso)) {
      removerProcesso(numeroProcesso)
    } else {
      adicionarProcesso(numeroProcesso)
    }
  }

  const limparContexto = () => {
    contextConfig.value.documentos = []
    contextConfig.value.processos = []
  }

  const consultarComContexto = async (
    question: string,
    k: number = 5
  ): Promise<RAGContextResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      const validation = validateQuery(question)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      if (contextConfig.value.documentos.length === 0 &&
        contextConfig.value.processos.length === 0) {
        const result = await queryRAG({ question, context: [], query: question })
        return result as RAGContextResult
      }

      const result = await queryRAGWithContext({
        question,
        context: contextConfig.value,
        k
      })

      return result

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro na consulta'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const temContexto = computed(() => {
    return contextConfig.value.documentos.length > 0 ||
      contextConfig.value.processos.length > 0
  })

  const totalItensContexto = computed(() => {
    return contextConfig.value.documentos.length + contextConfig.value.processos.length
  })

  const resumoContexto = computed(() => {
    const documentos = contextConfig.value.documentos.length
    const processos = contextConfig.value.processos.length

    const partes = []
    if (documentos > 0) partes.push(`${documentos} documento(s)`)
    if (processos > 0) partes.push(`${processos} processo(s)`)

    return partes.join(' e ')
  })

  return {
    isLoading: readonly(isLoading),
    isLoadingData: readonly(isLoadingData),
    error: readonly(error),
    contextConfig: readonly(contextConfig),
    documentosDisponiveis: readonly(documentosDisponiveis),
    processosTriagem: readonly(processosTriagem),
    temContexto,
    totalItensContexto,
    resumoContexto,
    carregarDadosIniciais,
    adicionarDocumento,
    removerDocumento,
    adicionarProcesso,
    removerProcesso,
    toggleProcesso,
    limparContexto,
    consultarComContexto
  }
}

export default {
  getRAGStatus,
  queryRAG,
  searchRAG,
  getRAGStatistics,
  getRAGSuggestions,
  reinitializeRAG,
  getRAGHealth,
  analyzeProcess,
  getDashboardInsights,
  queryRAGWithContext,
  getDocumentosDisponiveis,
  getProcessosTriagem,
  formatConfidence,
  formatProcessingTime,
  getStrategyColor,
  getStrategyDescription,
  validateQuery,
  buildFilteredQuery,
  extractKeywords,
  suggestRelatedQueries,
  filtrarDocumentos,
  filtrarProcessos,
  obterTemasUnicos,
  obterResponsaveisUnicos,
  obterStatusUnicos,
  validarContexto,
  useRAG,
  useRAGWithContext,
  RAGAPIError
}
