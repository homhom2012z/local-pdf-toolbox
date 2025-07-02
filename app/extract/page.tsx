'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentArrowDownIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { extractPages, validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

export default function ExtractPagesPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing, setResult } = usePdfStore()
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [extractResults, setExtractResults] = useState<Blob[]>([])
  const [pageCount, setPageCount] = useState<number>(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const validation = validatePdfFile(file)
      if (validation.isValid) {
        addFile(file)
        // Get page count from the PDF
        getPageCount(file)
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
    multiple: false
  })

  const getPageCount = async (file: File) => {
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(pdfBytes)
      setPageCount(pdf.getPageCount())
    } catch (error) {
      console.error('Failed to get page count:', error)
    }
  }

  const togglePage = (pageNumber: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    )
  }

  const selectAllPages = () => {
    const allPages = Array.from({ length: pageCount }, (_, i) => i + 1)
    setSelectedPages(allPages)
  }

  const clearSelection = () => {
    setSelectedPages([])
  }

  const handleExtract = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file')
      return
    }

    if (selectedPages.length === 0) {
      alert('Please select at least one page to extract')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing extraction...' })

    try {
      const file = files[0].file
      
      setProcessing({ progress: 50, currentStep: 'Extracting pages...' })
      const results = await extractPages(file, { pages: selectedPages })
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setExtractResults(results)
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to extract pages' 
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

  const downloadAll = () => {
    extractResults.forEach((blob, index) => {
      const pageNumber = selectedPages[index]
      const filename = files[0] ? 
        `${files[0].name.replace('.pdf', '')}_page_${pageNumber}.pdf` : 
        `extracted_page_${pageNumber}.pdf`
      downloadResult(blob, filename)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-500 p-4 rounded-2xl mb-4">
            <DocumentArrowDownIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Extract Pages</h1>
          <p className="text-lg text-gray-600 text-center">Select and download individual pages from your PDF.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <DocumentArrowDownIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop PDF file here'}
            </p>
            <p className="text-sm text-gray-500 mb-2">or click to select file</p>
            <p className="text-xs text-gray-400">Maximum file size: 100MB</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">Selected File</span>
              <button onClick={clearFiles} className="text-xs text-red-500 hover:underline">Clear</button>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-700">{files[0].name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(files[0].size)} • {pageCount} pages</p>
            </div>
          </div>
        )}

        {pageCount > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-800">Select Pages</label>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllPages}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => togglePage(pageNumber)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPages.includes(pageNumber)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            
            {selectedPages.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedPages.join(', ')} ({selectedPages.length} pages)
              </p>
            )}
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
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
          onClick={handleExtract}
          disabled={files.length === 0 || selectedPages.length === 0 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
        >
          {processing.isProcessing ? 'Extracting...' : 'Extract Pages'}
        </button>

        {extractResults.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">Extracted Pages ({extractResults.length} files)</span>
              <button
                onClick={downloadAll}
                className="btn btn-outline text-sm py-2 flex items-center"
                style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download All
              </button>
            </div>
            <div className="space-y-2">
              {extractResults.map((blob, index) => {
                const pageNumber = selectedPages[index]
                return (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">
                      Page {pageNumber} ({formatFileSize(blob.size)})
                    </span>
                    <button
                      onClick={() => downloadResult(blob, `extracted_page_${pageNumber}.pdf`)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="w-full mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file you want to extract pages from</li>
            <li>Select the pages you want to extract by clicking on them</li>
            <li>Use "Select All" to choose all pages or "Clear" to deselect</li>
            <li>Click "Extract Pages" to process</li>
            <li>Download individual pages or all at once</li>
          </ol>
          <div className="mt-3 text-xs text-purple-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 