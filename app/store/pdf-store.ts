import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface PdfFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  preview?: string
}

export interface ProcessingState {
  isProcessing: boolean
  progress: number
  currentStep: string
  error: string | null
}

export interface Settings {
  defaultQuality: number
  maxFileSize: number
  enableNotifications: boolean
  autoDownload: boolean
}

interface PdfStore {
  // File management
  files: PdfFile[]
  addFile: (file: File) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  updateFile: (id: string, updates: Partial<PdfFile>) => void
  
  // Processing state
  processing: ProcessingState
  setProcessing: (processing: Partial<ProcessingState>) => void
  resetProcessing: () => void
  
  // Results
  result: Blob | null
  setResult: (result: Blob | null) => void
  
  // Settings
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
  
  // UI state
  selectedPages: number[]
  setSelectedPages: (pages: number[]) => void
  clearSelectedPages: () => void
}

const defaultSettings: Settings = {
  defaultQuality: 0.8,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  enableNotifications: true,
  autoDownload: true,
}

const defaultProcessing: ProcessingState = {
  isProcessing: false,
  progress: 0,
  currentStep: '',
  error: null,
}

export const usePdfStore = create<PdfStore>()(
  devtools(
    (set, get) => ({
      // File management
      files: [],
      addFile: (file: File) => {
        const id = crypto.randomUUID()
        const pdfFile: PdfFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        }
        set((state) => ({
          files: [...state.files, pdfFile]
        }))
      },
      removeFile: (id: string) => {
        set((state) => ({
          files: state.files.filter(f => f.id !== id)
        }))
      },
      clearFiles: () => {
        set({ files: [] })
      },
      updateFile: (id: string, updates: Partial<PdfFile>) => {
        set((state) => ({
          files: state.files.map(f => 
            f.id === id ? { ...f, ...updates } : f
          )
        }))
      },
      
      // Processing state
      processing: defaultProcessing,
      setProcessing: (processing: Partial<ProcessingState>) => {
        set((state) => ({
          processing: { ...state.processing, ...processing }
        }))
      },
      resetProcessing: () => {
        set({ processing: defaultProcessing })
      },
      
      // Results
      result: null,
      setResult: (result: Blob | null) => {
        set({ result })
      },
      
      // Settings
      settings: defaultSettings,
      updateSettings: (settings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }))
      },
      
      // UI state
      selectedPages: [],
      setSelectedPages: (pages: number[]) => {
        set({ selectedPages: pages })
      },
      clearSelectedPages: () => {
        set({ selectedPages: [] })
      },
    }),
    {
      name: 'pdf-store',
    }
  )
) 