import { PDFDocument } from 'pdf-lib'

export interface PdfPageInfo {
  pageNumber: number
  width: number
  height: number
  rotation: number
}

export interface MergeOptions {
  maintainOrder: boolean
  addPageNumbers: boolean
}

export interface SplitOptions {
  pageRanges: number[][]
  splitByCount: boolean
  pagesPerFile: number
}

export interface ExtractOptions {
  pages: number[]
}

export interface CompressOptions {
  quality: 'low' | 'medium' | 'high'
  removeMetadata: boolean
  optimizeImages: boolean
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(files: File[], options: MergeOptions = { maintainOrder: true, addPageNumbers: false }): Promise<Blob> {
  try {
    const mergedPdf = await PDFDocument.create()
    for (const file of files) {
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(pdfBytes)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }
    const mergedPdfBytes = await mergedPdf.save()
    return new Blob([mergedPdfBytes], { type: 'application/pdf' })
  } catch (error) {
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Split a PDF into multiple files
 */
export async function splitPdf(file: File, options: SplitOptions): Promise<Blob[]> {
  try {
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    const pageCount = pdf.getPageCount()
    const results: Blob[] = []
    if (options.splitByCount) {
      const pagesPerFile = options.pagesPerFile
      for (let i = 0; i < pageCount; i += pagesPerFile) {
        const newPdf = await PDFDocument.create()
        const endPage = Math.min(i + pagesPerFile, pageCount)
        const copiedPages = await newPdf.copyPages(pdf, Array.from({ length: endPage - i }, (_, idx) => i + idx))
        copiedPages.forEach((page) => newPdf.addPage(page))
        const newPdfBytes = await newPdf.save()
        results.push(new Blob([newPdfBytes], { type: 'application/pdf' }))
      }
    } else {
      for (const range of options.pageRanges) {
        const newPdf = await PDFDocument.create()
        const [start, end] = range
        const indices = Array.from({ length: end - start + 1 }, (_, idx) => start - 1 + idx)
        const copiedPages = await newPdf.copyPages(pdf, indices)
        copiedPages.forEach((page) => newPdf.addPage(page))
        const newPdfBytes = await newPdf.save()
        results.push(new Blob([newPdfBytes], { type: 'application/pdf' }))
      }
    }
    return results
  } catch (error) {
    throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract specific pages from a PDF (as PDF)
 */
export async function extractPages(file: File, options: ExtractOptions): Promise<Blob[]> {
  try {
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    const pageCount = pdf.getPageCount()
    const results: Blob[] = []
    for (const pageNum of options.pages) {
      if (pageNum > 0 && pageNum <= pageCount) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1])
        newPdf.addPage(copiedPage)
        const newPdfBytes = await newPdf.save()
        results.push(new Blob([newPdfBytes], { type: 'application/pdf' }))
      }
    }
    return results
  } catch (error) {
    throw new Error(`Failed to extract pages: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Compress PDF (basic implementation)
 */
export async function compressPdf(file: File, options: CompressOptions): Promise<Blob> {
  try {
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    // Basic compression by re-saving
    const compressedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 20,
    })
    return new Blob([compressedBytes], { type: 'application/pdf' })
  } catch (error) {
    throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate PDF file
 */
export function validatePdfFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' }
  }
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF' }
  }
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 100MB' }
  }
  return { isValid: true }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 