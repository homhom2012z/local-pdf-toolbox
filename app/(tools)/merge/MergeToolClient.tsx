'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentDuplicateIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { mergePdfs, validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

export default function MergeToolClient() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing, setResult } = usePdfStore()
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const validation = validatePdfFile(file)
      if (validation.isValid) {
        addFile(file)
      } else {
        alert(validation.error)
      }
    })
  }, [addFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing files...' })

    try {
      const fileList = files.map(f => f.file)
      
      setProcessing({ progress: 25, currentStep: 'Merging PDFs...' })
      const result = await mergePdfs(fileList)
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setResult(result)
      
      // Auto download if enabled
      if (usePdfStore.getState().settings.autoDownload) {
        downloadResult(result, 'merged-document.pdf')
      }
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to merge PDFs' 
      })
    } finally {
      setTimeout(() => {
        setProcessing({ isProcessing: false, progress: 0, currentStep: '' })
      }, 2000)
    }
  }

  const downloadResult = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    const result = usePdfStore.getState().result
    if (result) {
      downloadResult(result, 'merged-document.pdf')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500 p-4 rounded-2xl mb-4">
            <DocumentDuplicateIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Merge PDF</h1>
          <p className="text-lg text-gray-600 text-center">Combine multiple PDF files into one document. All processing happens locally in your browser.</p>
        </div>
        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <DocumentDuplicateIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">{isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF files here'}</p>
            <p className="text-sm text-gray-500 mb-2">or click to select files</p>
            <p className="text-xs text-gray-400">Maximum file size: 100MB per file</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">Selected Files ({files.length})</span>
              <button onClick={clearFiles} className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="truncate text-sm text-gray-700">{idx + 1}. {file.name}</span>
                  <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500" aria-label="Remove file"><TrashIcon className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-700">{processing.currentStep} ({processing.progress}%)</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-bar-fill" style={{ width: `${processing.progress}%` }}></div>
            </div>
          </div>
        )}
        {processing.error && (
          <div className="w-full mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{processing.error}</div>
        )}
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
        >
          {processing.isProcessing ? 'Merging...' : 'Merge PDFs'}
        </button>
        {usePdfStore.getState().result && (
          <button
            onClick={handleDownload}
            className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Result
          </button>
        )}
        <div className="w-full mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Drag and drop multiple PDF files into the upload area, or click to select files</li>
            <li>Arrange the files in the desired order (they will be merged in the order shown)</li>
            <li>Click "Merge PDFs" to combine the files</li>
            <li>Download the merged PDF when processing is complete</li>
          </ol>
          <div className="mt-3 text-xs text-blue-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 