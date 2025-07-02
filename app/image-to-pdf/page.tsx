'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentTextIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'

interface ImageFile {
  id: string
  file: File
  name: string
  size: number
  preview: string
}

export default function ImageToPdfPage() {
  const { processing, setProcessing } = usePdfStore()
  const [images, setImages] = useState<ImageFile[]>([])
  const [result, setResult] = useState<Blob | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = crypto.randomUUID()
        const imageFile: ImageFile = {
          id,
          file,
          name: file.name,
          size: file.size,
          preview: URL.createObjectURL(file)
        }
        setImages(prev => [...prev, imageFile])
      } else {
        alert('Please select image files only')
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  })

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const clearImages = () => {
    images.forEach(image => URL.revokeObjectURL(image.preview))
    setImages([])
    setResult(null)
  }

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id)
      if (index === -1) return prev
      
      const newImages = [...prev]
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      }
      return newImages
    })
  }

  const handleConvert = async () => {
    if (images.length === 0) {
      alert('Please select at least one image')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing images...' })

    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      
      setProcessing({ progress: 25, currentStep: 'Converting images...' })
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const imageBytes = await image.file.arrayBuffer()
        
        let pdfImage
        if (image.file.type === 'image/jpeg' || image.file.type === 'image/jpg') {
          pdfImage = await pdf.embedJpg(imageBytes)
        } else if (image.file.type === 'image/png') {
          pdfImage = await pdf.embedPng(imageBytes)
        } else {
          // Convert other formats to PNG using canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = image.preview
          })
          
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          const pngDataUrl = canvas.toDataURL('image/png')
          const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer())
          pdfImage = await pdf.embedPng(pngBytes)
        }
        
        const page = pdf.addPage([pdfImage.width, pdfImage.height])
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        })
        
        setProcessing({ 
          progress: 25 + ((i + 1) / images.length) * 50, 
          currentStep: `Processing image ${i + 1} of ${images.length}...` 
        })
      }
      
      setProcessing({ progress: 75, currentStep: 'Generating PDF...' })
      const pdfBytes = await pdf.save()
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setResult(new Blob([pdfBytes], { type: 'application/pdf' }))
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to convert images to PDF' 
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-500 p-4 rounded-2xl mb-4">
            <DocumentTextIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Image to PDF</h1>
          <p className="text-lg text-gray-600 text-center">Convert multiple images into a single PDF document.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <DocumentTextIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-gray-500 mb-2">or click to select files</p>
            <p className="text-xs text-gray-400">Supports: JPG, PNG, GIF, BMP, WebP</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-800">Selected Images ({images.length})</span>
              <button onClick={clearImages} className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {images.map((image, index) => (
                <div key={image.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <img 
                    src={image.preview} 
                    alt={image.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
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
          onClick={handleConvert}
          disabled={images.length === 0 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
        >
          {processing.isProcessing ? 'Converting...' : 'Convert to PDF'}
        </button>

        {result && (
          <button
            onClick={() => downloadResult(result, 'converted_images.pdf')}
            className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        )}

        <div className="w-full mt-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload one or more image files (JPG, PNG, GIF, BMP, WebP)</li>
            <li>Arrange the images in the desired order using the up/down arrows</li>
            <li>Remove unwanted images using the trash icon</li>
            <li>Click "Convert to PDF" to process</li>
            <li>Download the generated PDF file</li>
          </ol>
          <div className="mt-3 text-xs text-red-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 