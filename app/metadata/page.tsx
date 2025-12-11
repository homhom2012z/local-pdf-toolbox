'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  DocumentIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

interface PdfMetadata {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
  creationDate?: Date
  modificationDate?: Date
  pageCount?: number
  fileSize?: number
}

export default function MetadataEditorPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing } = usePdfStore()
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  })
  const [originalMetadata, setOriginalMetadata] = useState<PdfMetadata | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)

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
    multiple: false
  })

  // Load metadata when a file is selected
  useEffect(() => {
    if (files.length > 0) {
      loadMetadata()
    }
  }, [files])

  const loadMetadata = async () => {
    if (files.length === 0) return

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Loading PDF metadata...' })

    try {
      const file = files[0].file
      const { PDFDocument } = await import('pdf-lib')
      
      setProcessing({ progress: 25, currentStep: 'Reading PDF...' })
      const pdfBytes = await file.arrayBuffer()
      
      setProcessing({ progress: 50, currentStep: 'Extracting metadata...' })
      const pdf = await PDFDocument.load(pdfBytes)
      const info = pdf.getTitle()
      const author = pdf.getAuthor()
      const subject = pdf.getSubject()
      const keywords = pdf.getKeywords()
      const creator = pdf.getCreator()
      const producer = pdf.getProducer()
      const creationDate = pdf.getCreationDate()
      const modificationDate = pdf.getModificationDate()
      const pageCount = pdf.getPageCount()

      const extractedMetadata: PdfMetadata = {
        title: info || '',
        author: author || '',
        subject: subject || '',
        keywords: keywords || '',
        creator: creator || '',
        producer: producer || '',
        creationDate: creationDate ? new Date(creationDate) : undefined,
        modificationDate: modificationDate ? new Date(modificationDate) : undefined,
        pageCount,
        fileSize: file.size
      }

      setMetadata(extractedMetadata)
      setOriginalMetadata(extractedMetadata)
      setProcessing({ progress: 100, currentStep: 'Metadata loaded!' })
      
      setTimeout(() => {
        setProcessing({ isProcessing: false, progress: 0, currentStep: '' })
      }, 1500)

    } catch (error) {
      console.error('Error loading metadata:', error)
      setProcessing({ 
        isProcessing: false, 
        error: 'Failed to load PDF metadata. The file may be corrupted or password protected.' 
      })
    }
  }

  const handleSaveMetadata = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Updating PDF metadata...' })

    try {
      const file = files[0].file
      const { PDFDocument } = await import('pdf-lib')
      
      setProcessing({ progress: 25, currentStep: 'Loading PDF...' })
      const pdfBytes = await file.arrayBuffer()
      
      setProcessing({ progress: 50, currentStep: 'Modifying metadata...' })
      const pdf = await PDFDocument.load(pdfBytes)
      
      // Update metadata
      if (metadata.title) pdf.setTitle(metadata.title)
      if (metadata.author) pdf.setAuthor(metadata.author)
      if (metadata.subject) pdf.setSubject(metadata.subject)
      if (metadata.keywords) pdf.setKeywords(metadata.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0))
      if (metadata.creator) pdf.setCreator(metadata.creator)
      if (metadata.producer) pdf.setProducer(metadata.producer)
      
      setProcessing({ progress: 75, currentStep: 'Generating updated PDF...' })
      const updatedPdfBytes = await pdf.save()
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setResult(new Blob([updatedPdfBytes], { type: 'application/pdf' }))
      
      setTimeout(() => {
        setProcessing({ isProcessing: false, progress: 0, currentStep: '' })
      }, 2000)

    } catch (error) {
      console.error('Error saving metadata:', error)
      setProcessing({ 
        isProcessing: false, 
        error: 'Failed to update PDF metadata. Please try again.' 
      })
    }
  }

  const resetMetadata = () => {
    if (originalMetadata) {
      setMetadata(originalMetadata)
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

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set'
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500 p-4 rounded-2xl mb-4">
            <DocumentTextIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PDF Metadata Editor</h1>
          <p className="text-lg text-gray-600 text-center">View and edit metadata properties of your PDF files.</p>
        </div>

        {/* File Upload */}
        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <DocumentIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop PDF file here'}
            </p>
            <p className="text-sm text-gray-500 mb-2">or click to select file</p>
            <p className="text-xs text-gray-400">Maximum file size: 100MB</p>
          </div>
        </div>

        {/* Selected File Info */}
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

        {/* Metadata Editor */}
        {files.length > 0 && metadata && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Metadata</h3>
              <div className="flex space-x-2">
                <button
                  onClick={resetMetadata}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Reset to Original
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 flex items-center"
                >
                  <CogIcon className="h-3 w-3 mr-1" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DocumentIcon className="h-4 w-4 inline mr-1" />
                    Title
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Author
                  </label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Document author"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TagIcon className="h-4 w-4 inline mr-1" />
                    Subject
                  </label>
                  <input
                    type="text"
                    value={metadata.subject}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Document subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TagIcon className="h-4 w-4 inline mr-1" />
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={metadata.keywords}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </div>

              {/* Advanced Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CogIcon className="h-4 w-4 inline mr-1" />
                    Creator
                  </label>
                  <input
                    type="text"
                    value={metadata.creator}
                    onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Software that created the PDF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CogIcon className="h-4 w-4 inline mr-1" />
                    Producer
                  </label>
                  <input
                    type="text"
                    value={metadata.producer}
                    onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Software that produced the PDF"
                  />
                </div>

                {showAdvanced && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Creation Date
                      </label>
                      <input
                        type="text"
                        value={formatDate(metadata.creationDate)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Read-only (cannot be modified)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Modification Date
                      </label>
                      <input
                        type="text"
                        value={formatDate(metadata.modificationDate)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Read-only (cannot be modified)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DocumentIcon className="h-4 w-4 inline mr-1" />
                        Page Count
                      </label>
                      <input
                        type="text"
                        value={metadata.pageCount || 'Unknown'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DocumentIcon className="h-4 w-4 inline mr-1" />
                        File Size
                      </label>
                      <input
                        type="text"
                        value={metadata.fileSize ? formatFileSize(metadata.fileSize) : 'Unknown'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing Status */}
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

        {/* Error Display */}
        {processing.error && (
          <div className="w-full mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {processing.error}
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleSaveMetadata}
              disabled={processing.isProcessing}
              className="btn btn-primary flex-1 text-lg py-3 flex items-center justify-center"
              style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
            >
              {processing.isProcessing ? 'Updating...' : 'Update Metadata'}
            </button>
          </div>
        )}

        {/* Download Result */}
        {result && (
          <button
            onClick={() => downloadResult(result, 'updated_document.pdf')}
            className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
            style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Updated PDF
          </button>
        )}

        {/* Instructions */}
        <div className="w-full mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file to view its current metadata</li>
            <li>Edit the metadata fields you want to change</li>
            <li>Click "Update Metadata" to apply changes</li>
            <li>Download the updated PDF with new metadata</li>
          </ol>
          <div className="mt-3 text-xs text-blue-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 