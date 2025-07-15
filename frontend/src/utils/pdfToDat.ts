export async function pdfToDat(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler o PDF'))
    }

    reader.readAsDataURL(file)
  })
}
