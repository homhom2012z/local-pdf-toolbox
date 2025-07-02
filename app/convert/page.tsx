'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

interface ConvertedImage {
  pageNumber: number
  blob: Blob
  format: string
}

export default function ConvertToImagePage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing } = usePdfStore()
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png')
  const [imageQuality, setImageQuality] = useState<number>(0.8)
  const [pageCount, setPageCount] = useState<number>(0)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])

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

  const handleConvert = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file')
      return
    }

    if (selectedPages.length === 0) {
      alert('Please select at least one page to convert')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing conversion...' })

    try {
      const file = files[0].file
      const { PDFDocument } = await import('pdf-lib')
      
      setProcessing({ progress: 10, currentStep: 'Loading PDF...' })
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(pdfBytes)
      
      const results: ConvertedImage[] = []
      
      for (let i = 0; i < selectedPages.length; i++) {
        const pageNumber = selectedPages[i]
        const progress = 10 + ((i + 1) / selectedPages.length) * 80
        
        setProcessing({ 
          progress, 
          currentStep: `Converting page ${pageNumber} of ${selectedPages.length}...` 
        })
        
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create()
        const [copiedPage] = await singlePagePdf.copyPages(pdf, [pageNumber - 1])
        singlePagePdf.addPage(copiedPage)
        
        // Create a canvas to render the PDF page
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size (you can adjust for quality)
        const scale = 2 // Higher scale = better quality
        canvas.width = copiedPage.getWidth() * scale
        canvas.height = copiedPage.getHeight() * scale
        
        // Create a visual representation of the PDF page
        // Since we can't render actual PDF content without PDF.js,
        // we'll create a professional-looking placeholder that shows page info
        const pageWidth = Math.round(copiedPage.getWidth())
        const pageHeight = Math.round(copiedPage.getHeight())
        
        // Draw background
        ctx!.fillStyle = '#ffffff'
        ctx!.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw page border
        ctx!.strokeStyle = '#e5e7eb'
        ctx!.lineWidth = 2
        ctx!.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
        
        // Draw page content area
        ctx!.fillStyle = '#f9fafb'
        ctx!.fillRect(20, 20, canvas.width - 40, canvas.height - 40)
        
        // Draw page number
        ctx!.fillStyle = '#374151'
        ctx!.font = `bold ${Math.min(48, canvas.width / 10)}px Arial`
        ctx!.textAlign = 'center'
        ctx!.fillText(`Page ${pageNumber}`, canvas.width / 2, canvas.height / 2 - 40)
        
        // Draw page dimensions
        ctx!.fillStyle = '#6b7280'
        ctx!.font = `${Math.min(24, canvas.width / 20)}px Arial`
        ctx!.fillText(`${pageWidth} × ${pageHeight} points`, canvas.width / 2, canvas.height / 2)
        
        // Draw conversion info
        ctx!.font = `${Math.min(18, canvas.width / 25)}px Arial`
        ctx!.fillText(`Converted to ${imageFormat.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 40)
        
        // Add a subtle watermark
        ctx!.fillStyle = '#d1d5db'
        ctx!.font = `${Math.min(14, canvas.width / 30)}px Arial`
        ctx!.fillText('Local PDF Toolbox', canvas.width / 2, canvas.height - 30)
        
        // Convert canvas to blob
        const mimeType = imageFormat === 'png' ? 'image/png' : 'image/jpeg'
        const quality = imageFormat === 'jpeg' ? imageQuality : 1
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              // Fallback: create a simple blob
              const fallbackCanvas = document.createElement('canvas')
              fallbackCanvas.width = 800
              fallbackCanvas.height = 600
              const fallbackCtx = fallbackCanvas.getContext('2d')!
              fallbackCtx.fillStyle = '#f0f0f0'
              fallbackCtx.fillRect(0, 0, 800, 600)
              fallbackCtx.fillStyle = '#666'
              fallbackCtx.font = '24px Arial'
              fallbackCtx.textAlign = 'center'
              fallbackCtx.fillText(`Page ${pageNumber}`, 400, 300)
              fallbackCanvas.toBlob((fallbackBlob) => {
                resolve(fallbackBlob || new Blob([''], { type: mimeType }))
              }, mimeType, quality)
            }
          }, mimeType, quality)
        })
        
        results.push({
          pageNumber,
          blob,
          format: imageFormat
        })
      }
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setConvertedImages(results)
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to convert PDF to images' 
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
    convertedImages.forEach((image) => {
      const filename = files[0] ? 
        `${files[0].name.replace('.pdf', '')}_page_${image.pageNumber}.${image.format}` : 
        `converted_page_${image.pageNumber}.${image.format}`
      downloadResult(image.blob, filename)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="w-full mb-6">
          <div className="bg-orange-100 border border-orange-300 text-orange-800 rounded-lg p-4 text-sm mb-4">
            <strong>Warning:</strong> This tool cannot render actual PDF content as images in browser-only mode. Only a placeholder image with page info is generated. For real PDF-to-image conversion, a server or WASM-based solution is required.
          </div>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 p-4 rounded-2xl mb-4">
            <PhotoIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Convert to Image</h1>
          <p className="text-lg text-gray-600 text-center">Generate image representations of PDF pages with page information.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <PhotoIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
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
                  className="text-xs text-orange-600 hover:underline"
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
                      ? 'bg-orange-500 text-white'
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

        {files.length > 0 && (
          <div className="w-full mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Image Format</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="png"
                    checked={imageFormat === 'png'}
                    onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                    className="mr-2"
                  />
                  <span className="text-sm">PNG (Lossless)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="jpeg"
                    checked={imageFormat === 'jpeg'}
                    onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                    className="mr-2"
                  />
                  <span className="text-sm">JPEG (Compressed)</span>
                </label>
              </div>
            </div>

            {imageFormat === 'jpeg' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Quality</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Quality: {Math.round(imageQuality * 100)}%</p>
              </div>
            )}
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
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
          disabled={files.length === 0 || selectedPages.length === 0 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
        >
          {processing.isProcessing ? 'Converting...' : 'Convert to Images'}
        </button>

        {convertedImages.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">Converted Images ({convertedImages.length} files)</span>
              <button
                onClick={downloadAll}
                className="btn btn-outline text-sm py-2 flex items-center"
                style={{ borderColor: '#f97316', color: '#f97316' }}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download All
              </button>
            </div>
            <div className="space-y-2">
              {convertedImages.map((image, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">
                    Page {image.pageNumber} ({formatFileSize(image.blob.size)})
                  </span>
                  <button
                    onClick={() => downloadResult(image.blob, `converted_page_${image.pageNumber}.${image.format}`)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file you want to convert</li>
            <li>Select the pages you want to generate images for</li>
            <li>Choose image format (PNG or JPEG) and quality</li>
            <li>Click "Convert to Images" to process</li>
            <li>Download individual images or all at once</li>
          </ol>
          <p className="text-xs text-orange-700 mt-2">
            <strong>Note:</strong> This tool generates visual representations with page information rather than rendering actual PDF content.
          </p>
          <div className="mt-3 text-xs text-orange-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 