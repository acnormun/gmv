export interface ProcessoForm {
  numeroProcesso: string
  tema: string
  prioridade: 'BAIXA' | 'MÉDIA' | 'ALTA'
  dataDistribuicao: string
  responsavel: string
  status: string
  comentarios: string
  markdown?: string
  dat?: string
}

export interface Processo extends ProcessoForm {
  ultimaAtualizacao: string
  suspeitos: string | null
}

const API_BASE = 'http://localhost:5000'

export async function getProcessos(): Promise<Processo[]> {
  const res = await fetch(`${API_BASE}/triagem`)
  if (!res.ok) {
    throw new Error('Erro ao buscar processos')
  }
  return await res.json()
}

export async function addProcesso(processo: ProcessoForm): Promise<any> {
  console.log('📤 Enviando novo processo:', processo)

  const res = await fetch(`${API_BASE}/triagem/form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(processo),
  })

  if (!res.ok) {
    const error = await res.json()
    console.error('❌ Erro na resposta:', error)
    throw new Error(error.message || 'Erro ao adicionar processo')
  }
  return res
}

export async function updateProcesso(
  numeroAntigo: string,
  processoAtualizado: ProcessoForm,
): Promise<void> {
  console.log('📤 Enviando atualização:', processoAtualizado)

  const res = await fetch(`${API_BASE}/triagem/${numeroAntigo}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(processoAtualizado),
  })

  if (!res.ok) {
    const error = await res.json()
    console.error('❌ Erro na atualização:', error)
    throw new Error(error.message || 'Erro ao atualizar processo')
  }

  console.log('✅ Processo atualizado com sucesso')
}

export async function deleteProcesso(numero: string): Promise<void> {
  const res = await fetch(`${API_BASE}/triagem/${numero}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao excluir processo')
  }
}

export async function getProcesso(numero: number | string) {
  const res = await fetch(`${API_BASE}/triagem/${numero}/dat`, {
    method: 'GET',
  })
  const { dat } = await res.json()

  const blob = await (await fetch(`data:application/pdf;base64,${dat}`)).blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}