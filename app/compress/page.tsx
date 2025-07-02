'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArchiveBoxIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { compressPdf, validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

export default function CompressPdfPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing } = usePdfStore()
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [result, setResult] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const validation = validatePdfFile(file)
      if (validation.isValid) {
        addFile(file)
        setOriginalSize(file.size)
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

  const handleCompress = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing file...' })

    try {
      const file = files[0].file
      
      setProcessing({ progress: 25, currentStep: 'Analyzing PDF...' })
      
      setProcessing({ progress: 50, currentStep: 'Compressing PDF...' })
      const compressedBlob = await compressPdf(file, { quality: compressionLevel, removeMetadata: true, optimizeImages: true })
      
      setProcessing({ progress: 75, currentStep: 'Finalizing...' })
      setCompressedSize(compressedBlob.size)
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setResult(compressedBlob)
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to compress PDF' 
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

  const getCompressionSavings = () => {
    if (originalSize === 0 || compressedSize === 0) return null
    const savings = originalSize - compressedSize
    const percentage = ((savings / originalSize) * 100).toFixed(1)
    return { savings, percentage }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-500 p-4 rounded-2xl mb-4">
            <ArchiveBoxIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Compress PDF</h1>
          <p className="text-lg text-gray-600 text-center">Reduce PDF file size while maintaining quality.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <ArchiveBoxIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
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
              <p className="text-xs text-gray-500">{formatFileSize(files[0].size)}</p>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="w-full mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Compression Level</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="low"
                  checked={compressionLevel === 'low'}
                  onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="mr-2"
                />
                <span className="text-sm">Low (Best Quality)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={compressionLevel === 'medium'}
                  onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="mr-2"
                />
                <span className="text-sm">Medium (Balanced)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="high"
                  checked={compressionLevel === 'high'}
                  onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="mr-2"
                />
                <span className="text-sm">High (Smallest Size)</span>
              </label>
            </div>
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
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
          onClick={handleCompress}
          disabled={files.length === 0 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6' }}
        >
          {processing.isProcessing ? 'Compressing...' : 'Compress PDF'}
        </button>

        {result && (
          <div className="w-full mb-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-teal-900 mb-2">Compression Results</h4>
              <div className="space-y-1 text-xs text-teal-800">
                <p>Original size: {formatFileSize(originalSize)}</p>
                <p>Compressed size: {formatFileSize(compressedSize)}</p>
                {getCompressionSavings() && (
                  <p className="font-semibold">
                    Saved: {formatFileSize(getCompressionSavings()!.savings)} ({getCompressionSavings()!.percentage}%)
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => downloadResult(result, 'compressed_document.pdf')}
              className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
              style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download Compressed PDF
            </button>
          </div>
        )}

        <div className="w-full mt-4 bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file you want to compress</li>
            <li>Choose the compression level (Low/Medium/High)</li>
            <li>Click "Compress PDF" to process</li>
            <li>View the compression results and download</li>
          </ol>
          <div className="mt-3 text-xs text-teal-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 