import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.js?url'
// @ts-ignore
import TurndownService from 'turndown'

// Linka o worker corretamente para Vite/Webpack
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

/**
 * Converte um arquivo PDF em Markdown
 * @param file Arquivo PDF
 * @returns Texto convertido em Markdown
 */
export async function pdfToMarkdown(file: File): Promise<string> {

  const arrayBuffer = await file.arrayBuffer()
  let pdf
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  } catch (error) {
    throw new Error('Falha ao processar o PDF')
  }

  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => (item as any).str).join(' ')
    text += pageText + '\n\n'
  }

  const turndown = new TurndownService()
  const markdown = turndown.turndown(text)

  return markdown
}
