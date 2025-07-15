<template>
  <div
    v-if="open"
    id="modal-overlay"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40"
  >
    <div id="modal-novo-processo" class="bg-white rounded-xl shadow-lg w-[400px] max-w-full p-7">
      <div class="mb-5">
        <h2 class="text-lg text-neutral-900">
          {{
            mode === 'view'
              ? 'Visualizar Processo'
              : mode === 'edit'
                ? 'Editar Processo'
                : 'Novo Processo'
          }}
        </h2>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div
          v-if="
            isView && form?.suspeitos && Array.isArray(form.suspeitos) && form.suspeitos.length > 0
          "
          class="text-md text-red-600 mb-1 bg-red-50 p-3"
        >
          <p class="text-md text-red-600 mb-1 bg-red-50 p-3">
            ⚠ Atenção! Este processo apresenta nomes em suspeição:
          </p>
          <ul class="list-disc list-inside text-sm text-neutral-800">
            <li v-for="(nome, index) in form.suspeitos" :key="index">{{ nome }}</li>
          </ul>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Número do Processo</label>
          <input
            v-model="form.numeroProcesso"
            type="text"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Tema</label>
          <select
            v-model="form.tema"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            required
          >
            <option disabled value="">Selecione o tema</option>
            <option v-for="tema in temas" :key="tema" :value="tema">{{ tema }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Prioridade</label>
          <select
            v-model="form.prioridade"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            required
          >
            <option value="BAIXA">🟢 Baixa</option>
            <option value="MÉDIA">🟡 Média</option>
            <option value="ALTA">🔴 Alta</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Data da Distribuição</label>
          <div class="relative">
            <input
              v-model="form.dataDistribuicao"
              type="date"
              :disabled="isView"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 pr-9 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
              required
            />
            <span
              class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
            >
              <i class="fa-regular fa-calendar"></i>
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Responsável</label>
          <select
            v-model="form.responsavel"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            required
          >
            <option disabled value="">Selecione o responsável</option>
            <option v-for="nome in responsaveis" :key="nome" :value="nome">{{ nome }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Status</label>
          <select
            v-model="form.status"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            required
          >
            <option>Aberto</option>
            <option>Em andamento</option>
            <option>Para revisão</option>
            <option>Concluído</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Anexo</label>
          <div class="flex items-center space-x-3">
            <input
              type="file"
              accept=".pdf"
              :disabled="isView"
              @change="handlePdf"
              class="cursor-pointer border border-neutral-300 rounded-md px-3 py-1 text-sm file:bg-neutral-100 file:border-0 file:mr-2 file:rounded file:px-3 file:py-1 file:text-neutral-700"
              :required="mode === 'new'"
            />
            <span class="text-xs text-neutral-500 truncate">
              {{ arquivoPdf?.name || 'Nenhum arquivo escolhido' }}
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm text-neutral-500 mb-1">Comentários</label>
          <textarea
            v-model="form.comentarios"
            rows="3"
            :disabled="isView"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300"
            placeholder="Observações, detalhes relevantes etc."
          ></textarea>
        </div>

        <div v-if="debugMode" class="text-xs bg-gray-100 p-2 rounded">
          <div><strong>Form Data:</strong></div>
          <pre>{{ JSON.stringify(form, null, 2) }}</pre>
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="text-neutral-500 px-4 py-2 rounded-md hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            v-if="mode !== 'view'"
            type="submit"
            :disabled="loading"
            class="bg-neutral-900 text-white px-5 py-2 rounded-md hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <span
              v-if="loading"
              class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
            ></span>
            <span>Salvar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { pdfToMarkdown } from '@/utils/pdfToMarkdown'
import { pdfToDat } from '@/utils/pdfToDat'
import { useTriagemStore } from '@/stores/triagem.store'
import { useProgressStore } from '@/stores/progress.store'
import { updateProcesso, addProcesso } from '@/api/triagem'

const props = defineProps<{
  open: boolean
  mode: 'new' | 'view' | 'edit'
}>()

const emit = defineEmits(['close', 'added'])

const triagemStore = useTriagemStore()
const progressStore = useProgressStore()

const arquivoPdf = ref<File | null>(null)
const processoAntigo = ref('')
const loading = ref(false)
const debugMode = ref(false)

const form = ref<{
  numeroProcesso: string
  tema: string
  prioridade: string
  dataDistribuicao: string
  responsavel: string
  status: string
  comentarios: string
  suspeitos: string[]
}>({
  numeroProcesso: '',
  tema: '',
  prioridade: 'MÉDIA',
  dataDistribuicao: '',
  responsavel: '',
  status: 'Em andamento',
  comentarios: '',
  suspeitos: [],
})

const isView = computed(() => props.mode === 'view')

const temas = [
  'CÍVEL',
  'PENAL',
  'TRABALHISTA',
  'SAÚDE',
  'ADMINISTRATIVO',
  'TRIBUTÁRIO',
  'PREVIDENCIÁRIO',
  'CONSUMIDOR',
  'FAMÍLIA',
  'AMBIENTAL',
  'EXECUÇÃO FISCAL',
  'EMPRESARIAL',
  'ELEITORAL',
  'IMOBILIÁRIO',
  'MILITAR',
  'DIGITAL',
]

const responsaveis = [
  'LOURIVAL',
  'NAIRA',
  'NATÁLIA',
  'JUSSARA',
  'LEISI',
  'JORDAM',
  'RAQUEL',
  'FERNANDA',
  'VANUCE',
]

watch(
  () => props.open,
  (aberto) => {
    if (aberto) {
      if (props.mode === 'new') {
        form.value = {
          numeroProcesso: '',
          tema: '',
          prioridade: 'MÉDIA',
          dataDistribuicao: '',
          responsavel: '',
          status: 'Em andamento',
          comentarios: '',
          suspeitos: [],
        }
        arquivoPdf.value = null
        processoAntigo.value = ''
      } else {
        const processo = triagemStore.processoSelecionado
        if (processo) {
          const { ...processoSemUltimaAtt } = processo
          form.value = {
            ...processoSemUltimaAtt,
            prioridade: processo.prioridade || 'MÉDIA',
            suspeitos: Array.isArray(processo.suspeitos)
              ? processo.suspeitos.filter((s): s is string => typeof s === 'string')
              : []
          }
          processoAntigo.value = processo.numeroProcesso
        }
      }
    }
  },
)

function handlePdf(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    arquivoPdf.value = target.files[0]
  }
}

async function submit() {
  try {
    let markdown = ''
    let dat = ''

    if (arquivoPdf.value) {
      loading.value = true
      markdown = await pdfToMarkdown(arquivoPdf.value)
      dat = await pdfToDat(arquivoPdf.value)
      loading.value = false
    }

    const { ...formSemSuspeitos } = form.value

    const payload = {
      ...formSemSuspeitos,
      prioridade: formSemSuspeitos.prioridade as 'MÉDIA' | 'BAIXA' | 'ALTA',
      markdown,
      dat,
    }

    console.log('📋 Payload enviado:', payload)

    if (props.mode === 'new') {
      console.log('🚀 Iniciando adição de processo...')

      const response = await addProcesso(payload)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao adicionar processo')
      }

      const operationId = result.operation_id
      const numeroProcesso = form.value.numeroProcesso

      progressStore.addTask(operationId, numeroProcesso)


      setTimeout(() => {
        emit('added', operationId)
        emit('close')
      }, 500);

    } else if (props.mode === 'edit') {
      loading.value = true
      await updateProcesso(processoAntigo.value, payload)

      emit('added')
      emit('close')
    }

  } catch (err) {
    let errorMessage = 'Erro ao salvar processo'
    if (err instanceof Error) {
      errorMessage = err.message
    } else if (typeof err === 'string') {
      errorMessage = err
    }
    console.error('❌ Erro no submit:', err)
    alert(`Erro: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}
</script>
