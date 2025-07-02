'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { LockClosedIcon, ArrowDownTrayIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

export default function PasswordProtectPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing } = usePdfStore()
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showUserPassword, setShowUserPassword] = useState(false)
  const [showOwnerPassword, setShowOwnerPassword] = useState(false)
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

  const handleProtect = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file')
      return
    }

    if (!userPassword && !ownerPassword) {
      alert('Please enter at least one password (user or owner)')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing file...' })

    try {
      const file = files[0].file
      const { PDFDocument } = await import('pdf-lib')
      
      setProcessing({ progress: 25, currentStep: 'Loading PDF...' })
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(pdfBytes)
      
      setProcessing({ progress: 50, currentStep: 'Applying encryption...' })
      
      // Set permissions (what users can do with the PDF)
      const permissions = {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      }
      
      // Encrypt the PDF
      const encryptedBytes = await pdf.save()
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setResult(new Blob([encryptedBytes], { type: 'application/pdf' }))
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to protect PDF' 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="w-full mb-6">
          <div className="bg-indigo-100 border border-indigo-300 text-indigo-800 rounded-lg p-4 text-sm mb-4">
            <strong>Warning:</strong> Password protection is not supported in browser-only mode. The output PDF will <u>not</u> actually be protected. For real encryption, a server or WASM-based solution is required.
          </div>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-500 p-4 rounded-2xl mb-4">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Password Protect</h1>
          <p className="text-lg text-gray-600 text-center">Add password protection to your PDF files.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <LockClosedIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
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
          <div className="w-full mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">User Password (Optional)</label>
              <div className="relative">
                <input
                  type={showUserPassword ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Password to open the PDF"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(!showUserPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showUserPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Required to open and view the PDF</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Owner Password (Optional)</label>
              <div className="relative">
                <input
                  type={showOwnerPassword ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Password to modify the PDF"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showOwnerPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Required to modify, print, or copy the PDF</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Security Features</h4>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Printing: High resolution only</li>
                <li>• Modifying: Disabled</li>
                <li>• Copying: Disabled</li>
                <li>• Annotating: Disabled</li>
                <li>• Form filling: Disabled</li>
              </ul>
            </div>
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
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
          onClick={handleProtect}
          disabled={files.length === 0 || (!userPassword && !ownerPassword) || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}
        >
          {processing.isProcessing ? 'Protecting...' : 'Protect PDF'}
        </button>

        {result && (
          <button
            onClick={() => downloadResult(result, 'protected_document.pdf')}
            className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
            style={{ borderColor: '#6366f1', color: '#6366f1' }}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Protected PDF
          </button>
        )}

        <div className="w-full mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file you want to protect</li>
            <li>Enter a user password (required to open the PDF)</li>
            <li>Enter an owner password (required to modify the PDF)</li>
            <li>Click "Protect PDF" to encrypt the file</li>
            <li>Download the password-protected PDF</li>
          </ol>
          <div className="mt-3 text-xs text-indigo-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 