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
    if (this.socket) {
      this.socket.disconnect()
    }

    this.connectionStatus = 'connecting'

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
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
      this.reregisterAllOperations()
    })

    this.socket.on('disconnect', (reason) => {
      this.connectionStatus = 'disconnected'
      if (reason !== 'io client disconnect' && this.operations.size > 0) {
        this.attemptReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      this.connectionStatus = 'error'
      this.attemptReconnect()
    })

    this.socket.on('progress_update', (data: ProgressData) => {
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

      callbacks.onProgress(data)

      if (data.percentage >= 100 && !data.error) {
        callbacks.onComplete(data)

        setTimeout(() => {
          this.unregisterOperation(operationId)
        }, 3000)
      }

      // Verificar se houve erro
      if (data.error || (data.percentage === 0 && data.message.includes('Erro'))) {
        console.log(`❌ [WebSocketManager] Erro na operação: ${operationId}`)
        callbacks.onError(data.message)

        setTimeout(() => {
          this.unregisterOperation(operationId)
        }, 3000)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WebSocketManager] Máximo de tentativas de reconexão atingido')
      return
    }

    this.reconnectAttempts++
    const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Backoff exponencial

    setTimeout(() => {
      this.initializeSocket()
    }, delay)
  }

  private reregisterAllOperations() {
    for (const operationId of this.operations.keys()) {
      this.sendRegistration(operationId)
    }
  }

  private sendRegistration(operationId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn(`⚠️ [WebSocketManager] Socket não conectado para registrar: ${operationId}`)
      return
    }

    this.socket.emit('start_listening', {
      operation_id: operationId,
      client_id: this.socket.id
    })
  }

  public registerOperation(operationId: string, callbacks: OperationCallbacks): void {
    this.operations.set(operationId, callbacks)

    if (this.connectionStatus === 'connected') {
      this.sendRegistration(operationId)
    } else if (this.connectionStatus === 'disconnected') {
      this.initializeSocket()
    }

  }

  public unregisterOperation(operationId: string): void {
    this.operations.delete(operationId)

    if (this.operations.size === 0) {
      this.disconnect()
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionStatus = 'disconnected'
    this.operations.clear()
  }

  public getConnectionStatus(): string {
    return this.connectionStatus
  }

  public getActiveOperationsCount(): number {
    return this.operations.size
  }

  public getActiveOperations(): string[] {
    return Array.from(this.operations.keys())
  }
}

export const webSocketManager = new WebSocketManager()

export interface UseWebSocketReturn {
  registerOperation: (operationId: string, callbacks: OperationCallbacks) => void
  unregisterOperation: (operationId: string) => void
  connectionStatus: () => string
  activeOperations: () => string[]
}

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