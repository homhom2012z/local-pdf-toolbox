'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ScissorsIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { usePdfStore } from '@/store/pdf-store'
import { splitPdf, validatePdfFile, formatFileSize } from '@/lib/pdf-utils'

export default function SplitPdfPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing, setResult } = usePdfStore()
  const [splitMode, setSplitMode] = useState<'ranges' | 'count'>('ranges')
  const [pageRanges, setPageRanges] = useState<string>('')
  const [pagesPerFile, setPagesPerFile] = useState<number>(1)
  const [splitResults, setSplitResults] = useState<Blob[]>([])

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

  const handleSplit = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file to split')
      return
    }

    setProcessing({ isProcessing: true, progress: 0, currentStep: 'Preparing file...' })

    try {
      const file = files[0].file
      
      let options
      if (splitMode === 'ranges') {
        // Parse page ranges (e.g., "1-3,5,7-9")
        const ranges = pageRanges.split(',').map(range => {
          const [start, end] = range.trim().split('-').map(Number)
          return [start, end || start]
        }).filter(([start, end]) => start && end && start <= end)
        
        if (ranges.length === 0) {
          throw new Error('Please enter valid page ranges')
        }
        
        options = { pageRanges: ranges, splitByCount: false, pagesPerFile: 1 }
      } else {
        if (pagesPerFile < 1) {
          throw new Error('Pages per file must be at least 1')
        }
        options = { pageRanges: [], splitByCount: true, pagesPerFile }
      }
      
      setProcessing({ progress: 50, currentStep: 'Splitting PDF...' })
      const results = await splitPdf(file, options)
      
      setProcessing({ progress: 100, currentStep: 'Complete!' })
      setSplitResults(results)
      
    } catch (error) {
      setProcessing({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to split PDF' 
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
    splitResults.forEach((blob, index) => {
      const filename = files[0] ? 
        `${files[0].name.replace('.pdf', '')}_part_${index + 1}.pdf` : 
        `split_part_${index + 1}.pdf`
      downloadResult(blob, filename)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-500 p-4 rounded-2xl mb-4">
            <ScissorsIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Split PDF</h1>
          <p className="text-lg text-gray-600 text-center">Split your PDF into multiple files by page ranges or page count.</p>
        </div>

        <div {...getRootProps()} className={`file-upload-zone ${isDragActive ? 'dragover' : ''} w-full mb-6`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <ScissorsIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
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
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Split Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ranges"
                    checked={splitMode === 'ranges'}
                    onChange={(e) => setSplitMode(e.target.value as 'ranges')}
                    className="mr-2"
                  />
                  <span className="text-sm">Page Ranges</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="count"
                    checked={splitMode === 'count'}
                    onChange={(e) => setSplitMode(e.target.value as 'count')}
                    className="mr-2"
                  />
                  <span className="text-sm">Page Count</span>
                </label>
              </div>
            </div>

            {splitMode === 'ranges' ? (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Page Ranges</label>
                <input
                  type="text"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter page ranges separated by commas (e.g., 1-3, 5, 7-9)</p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Pages per File</label>
                <input
                  type="number"
                  value={pagesPerFile}
                  onChange={(e) => setPagesPerFile(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
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
          onClick={handleSplit}
          disabled={files.length === 0 || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
        >
          {processing.isProcessing ? 'Splitting...' : 'Split PDF'}
        </button>

        {splitResults.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">Split Results ({splitResults.length} files)</span>
              <button
                onClick={downloadAll}
                className="btn btn-outline text-sm py-2 flex items-center"
                style={{ borderColor: '#16a34a', color: '#16a34a' }}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download All
              </button>
            </div>
            <div className="space-y-2">
              {splitResults.map((blob, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">
                    Part {index + 1} ({formatFileSize(blob.size)})
                  </span>
                  <button
                    onClick={() => downloadResult(blob, `split_part_${index + 1}.pdf`)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full mt-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a PDF file you want to split</li>
            <li>Choose split mode: Page Ranges or Page Count</li>
            <li>For Page Ranges: Enter ranges like "1-3, 5, 7-9"</li>
            <li>For Page Count: Enter how many pages per file</li>
            <li>Click "Split PDF" to process</li>
            <li>Download individual parts or all at once</li>
          </ol>
          <div className="mt-3 text-xs text-green-700">
            <strong>Privacy Note:</strong> All processing happens locally in your browser. Your files are never uploaded to any server.
          </div>
        </div>
      </div>
    </div>
  )
} 