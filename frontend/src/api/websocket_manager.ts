import { io, Socket } from 'socket.io-client'

interface ProgressData {
  message: string
  percentage: number
  operation_id?: string
  error?: boolean
}

interface OperationCallbacks {
  onProgress: (data: ProgressData) => void
  onComplete: (data: ProgressData) => void
  onError: (message: string) => void
}

class WebSocketManager {
  private socket: Socket | null = null
  private operations: Map<string, OperationCallbacks> = new Map()
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    console.log('🔌 [WebSocketManager] Inicializando conexão única...')

    if (this.socket) {
      this.socket.disconnect()
    }

    this.connectionStatus = 'connecting'

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false, // Reutilizar conexão quando possível
      query: {
        client_type: 'multi_operation_tracker'
      }
    })

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.connectionStatus = 'connected'
      this.reconnectAttempts = 0
      console.log('🔌 [WebSocketManager] Conectado:', this.socket?.id)

      // Re-registrar todas as operações ativas
      this.reregisterAllOperations()
    })

    this.socket.on('disconnect', (reason) => {
      this.connectionStatus = 'disconnected'
      console.log('🔌 [WebSocketManager] Desconectado:', reason)

      // Tentar reconectar se não foi desconexão intencional
      if (reason !== 'io client disconnect' && this.operations.size > 0) {
        this.attemptReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      this.connectionStatus = 'error'
      console.error('❌ [WebSocketManager] Erro de conexão:', error)
      this.attemptReconnect()
    })

    // Listener principal para atualizações de progresso
    this.socket.on('progress_update', (data: ProgressData) => {
      console.log('📊 [WebSocketManager] Progresso recebido:', data)

      const operationId = data.operation_id
      if (!operationId) {
        console.warn('⚠️ [WebSocketManager] Progresso sem operation_id')
        return
      }

      const callbacks = this.operations.get(operationId)
      if (!callbacks) {
        console.warn(`⚠️ [WebSocketManager] Operação não registrada: ${operationId}`)
        return
      }

      // Chamar callback de progresso
      callbacks.onProgress(data)

      // Verificar se completou
      if (data.percentage >= 100 && !data.error) {
        console.log(`✅ [WebSocketManager] Operação concluída: ${operationId}`)
        callbacks.onComplete(data)

        // Remover da lista após conclusão
        setTimeout(() => {
          this.unregisterOperation(operationId)
        }, 3000)
      }

      // Verificar se houve erro
      if (data.error || (data.percentage === 0 && data.message.includes('Erro'))) {
        console.log(`❌ [WebSocketManager] Erro na operação: ${operationId}`)
        callbacks.onError(data.message)

        // Remover da lista após erro
        setTimeout(() => {
          this.unregisterOperation(operationId)
        }, 3000)
      }
    })

    // Debug: Capturar todos os eventos
    this.socket.onAny((eventName, ...args) => {
      console.log('📨 [WebSocketManager] Evento:', eventName, args)
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WebSocketManager] Máximo de tentativas de reconexão atingido')
      return
    }

    this.reconnectAttempts++
    const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Backoff exponencial

    console.log(`🔄 [WebSocketManager] Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`)

    setTimeout(() => {
      this.initializeSocket()
    }, delay)
  }

  private reregisterAllOperations() {
    console.log(`🔄 [WebSocketManager] Re-registrando ${this.operations.size} operações...`)

    for (const operationId of this.operations.keys()) {
      this.sendRegistration(operationId)
    }
  }

  private sendRegistration(operationId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn(`⚠️ [WebSocketManager] Socket não conectado para registrar: ${operationId}`)
      return
    }

    console.log(`📤 [WebSocketManager] Registrando operação: ${operationId}`)

    this.socket.emit('start_listening', {
      operation_id: operationId,
      client_id: this.socket.id
    })
  }

  // Método público para registrar uma nova operação
  public registerOperation(operationId: string, callbacks: OperationCallbacks): void {
    console.log(`📋 [WebSocketManager] Registrando nova operação: ${operationId}`)

    // Armazenar callbacks
    this.operations.set(operationId, callbacks)

    // Se já conectado, registrar imediatamente
    if (this.connectionStatus === 'connected') {
      this.sendRegistration(operationId)
    } else if (this.connectionStatus === 'disconnected') {
      // Se desconectado, inicializar conexão
      this.initializeSocket()
    }

    console.log(`📊 [WebSocketManager] Total de operações ativas: ${this.operations.size}`)
  }

  // Método público para remover uma operação
  public unregisterOperation(operationId: string): void {
    console.log(`🗑️ [WebSocketManager] Removendo operação: ${operationId}`)

    this.operations.delete(operationId)

    console.log(`📊 [WebSocketManager] Total de operações ativas: ${this.operations.size}`)

    // Se não há mais operações, desconectar
    if (this.operations.size === 0) {
      console.log('🔌 [WebSocketManager] Nenhuma operação ativa, desconectando...')
      this.disconnect()
    }
  }

  // Método público para forçar desconexão
  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 [WebSocketManager] Desconectando...')
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionStatus = 'disconnected'
    this.operations.clear()
  }

  // Getter para status da conexão
  public getConnectionStatus(): string {
    return this.connectionStatus
  }

  // Getter para número de operações ativas
  public getActiveOperationsCount(): number {
    return this.operations.size
  }

  // Getter para lista de operações ativas
  public getActiveOperations(): string[] {
    return Array.from(this.operations.keys())
  }
}

// Instância singleton
export const webSocketManager = new WebSocketManager()

// Interface para uso em componentes Vue
export interface UseWebSocketReturn {
  registerOperation: (operationId: string, callbacks: OperationCallbacks) => void
  unregisterOperation: (operationId: string) => void
  connectionStatus: () => string
  activeOperations: () => string[]
}

// Composable para uso em componentes Vue
export function useWebSocket(): UseWebSocketReturn {
  return {
    registerOperation: (operationId: string, callbacks: OperationCallbacks) => {
      webSocketManager.registerOperation(operationId, callbacks)
    },
    unregisterOperation: (operationId: string) => {
      webSocketManager.unregisterOperation(operationId)
    },
    connectionStatus: () => webSocketManager.getConnectionStatus(),
    activeOperations: () => webSocketManager.getActiveOperations()
  }
}