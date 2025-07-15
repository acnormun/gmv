import { defineStore } from "pinia"
import { ref, computed } from 'vue'
import { useTriagemStore } from './triagem.store'
import { io, Socket } from 'socket.io-client'

export interface ProgressTask {
  uuid: string
  numeroProcesso?: string
  inProgress: boolean
  percentage: number
  step: number
  message: string
  completed: boolean
  error: boolean
  errorMessage?: string
  createdAt: Date
}

export const useProgressStore = defineStore('progresso', () => {
  const minimized = ref(true)
  const selectedTask = ref<string | null>(null)
  const showDetails = ref(false)
  const inProgress = ref<ProgressTask[]>([])
  const socket = ref<Socket | null>(null)
  const connectionStatus = ref('Desconectado')

  const activeTasks = computed(() =>
    inProgress.value.filter(task => task.inProgress && !task.completed && !task.error)
  )

  const completedTasks = computed(() =>
    inProgress.value.filter(task => task.completed)
  )

  const errorTasks = computed(() =>
    inProgress.value.filter(task => task.error)
  )

  const hasActiveTasks = computed(() => activeTasks.value.length > 0)
  const hasTasks = computed(() => inProgress.value.length > 0)

  const selectedTaskData = computed(() =>
    selectedTask.value ? inProgress.value.find(t => t.uuid === selectedTask.value) : null
  )

  function initializeSocket() {
    if (socket.value?.connected) return

    if (socket.value) {
      socket.value.disconnect()
    }

    socket.value = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    socket.value.on('connect', () => {
      connectionStatus.value = 'Conectado'
    })

    socket.value.on('disconnect', (reason) => {
      connectionStatus.value = `Desconectado (${reason})`
    })

    socket.value.on('connect_error', () => {
      connectionStatus.value = 'Erro de conexão'
    })

    socket.value.on('progress_update', (data: { operation_id: string; percentage: number; step: number; message: string; completed?: boolean; error?: boolean; errorMessage?: string; numeroProcesso?: string }) => {
      updateTaskProgress(data.operation_id, data)
    })
  }

  function addTask(uuid: string, numeroProcesso?: string): ProgressTask {
    const existing = inProgress.value.find(t => t.uuid === uuid)
    if (existing) {
      existing.inProgress = true
      existing.completed = false
      existing.error = false
      return existing
    }

    const newTask: ProgressTask = {
      uuid,
      numeroProcesso,
      inProgress: true,
      percentage: 0,
      step: 0,
      message: 'Iniciando processamento...',
      completed: false,
      error: false,
      createdAt: new Date()
    }

    inProgress.value.push(newTask)

    initializeSocket()

    if (socket.value?.connected) {
      socket.value.emit('start_listening', { operation_id: uuid })
    } else {
      socket.value?.once('connect', () => {
        setTimeout(() => {
          socket.value?.emit('start_listening', { operation_id: uuid })
        }, 100)
      })
    }

    if (!minimized.value) {
      minimized.value = true
    }

    return newTask
  }

  interface TaskProgressUpdate {
    percentage?: number
    step?: number
    message?: string
    error?: boolean
    errorMessage?: string
  }

  function updateTaskProgress(uuid: string, data: TaskProgressUpdate) {
    const task = inProgress.value.find(t => t.uuid === uuid)
    if (!task) {
      return
    }

    if (data.percentage !== undefined) task.percentage = data.percentage
    if (data.step !== undefined) task.step = data.step
    if (data.message !== undefined) task.message = data.message
    if (data.error !== undefined) {
      task.error = data.error
      task.inProgress = !data.error
    }
    if (data.errorMessage !== undefined) {
      task.errorMessage = data.errorMessage
    }

     if (
      (data.percentage !== undefined && data.percentage >= 100 && !data.error) ||
      (data.step !== undefined && data.step === 10 && !data.error)
    ) {
      task.completed = true
      task.inProgress = false
      task.message = 'Processamento concluído!'

      setTimeout(() => {
        const triagemStore = useTriagemStore()
        triagemStore.carregarProcessos()
      }, 1000)


      setTimeout(() => {
        removeTask(uuid)
      }, 10000)
    }

    if (data.error) {
      task.errorMessage = data.errorMessage ?? data.message
      task.inProgress = false
    }
  }

  function selectTask(uuid: string) {
    selectedTask.value = uuid
    showDetails.value = true
  }

  function closeDetails() {
    showDetails.value = false
    selectedTask.value = null
  }

  function toggleMinimized() {
    minimized.value = !minimized.value
  }

  function hideInterface() {
    minimized.value = false
    showDetails.value = false
    selectedTask.value = null
  }

  function showInterface() {
    minimized.value = true
  }

  function removeTask(uuid: string) {
    const index = inProgress.value.findIndex(t => t.uuid === uuid)
    if (index > -1) {
      inProgress.value.splice(index, 1)

      if (selectedTask.value === uuid) {
        closeDetails()
      }
    }
  }

  function cancelTask(uuid: string) {
    const task = inProgress.value.find(t => t.uuid === uuid)
    if (task) {
      socket.value?.emit('cancel_operation', { operation_id: uuid })

      task.error = true
      task.inProgress = false
      task.errorMessage = 'Operação cancelada pelo usuário'
      task.message = 'Cancelado'
    }
  }

  function clearFinished() {
    inProgress.value = inProgress.value.filter(task => task.inProgress)

    if (selectedTask.value && !inProgress.value.find(t => t.uuid === selectedTask.value)) {
      closeDetails()
    }
  }

  function cleanup() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    inProgress.value = []
    selectedTask.value = null
    showDetails.value = false
    minimized.value = false
  }

  return {
    minimized: computed(() => minimized.value),
    selectedTask: computed(() => selectedTask.value),
    showDetails: computed(() => showDetails.value),
    inProgress: computed(() => inProgress.value),
    connectionStatus: computed(() => connectionStatus.value),
    activeTasks,
    completedTasks,
    errorTasks,
    hasActiveTasks,
    hasTasks,
    selectedTaskData,
    initializeSocket,
    addTask,
    updateTaskProgress,
    selectTask,
    closeDetails,
    toggleMinimized,
    hideInterface,
    showInterface,
    removeTask,
    cancelTask,
    clearFinished,
    cleanup
  }
})