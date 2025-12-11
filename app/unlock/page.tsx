"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  LockOpenIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { usePdfStore } from "@/store/pdf-store";
import { validatePdfFile, formatFileSize } from "@/lib/pdf-utils";

export default function UnlockPdfPage() {
  const { files, addFile, removeFile, clearFiles, processing, setProcessing } =
    usePdfStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const validation = validatePdfFile(file);
        if (validation.isValid) {
          addFile(file);
        } else {
          alert(validation.error);
        }
      });
    },
    [addFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleUnlock = async () => {
    if (files.length === 0) {
      alert("Please select a PDF file");
      return;
    }

    if (!password) {
      alert("Please enter the password");
      return;
    }

    setProcessing({
      isProcessing: true,
      progress: 0,
      currentStep: "Uploading file...",
    });

    try {
      const file = files[0].file;
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("password", password);

      setProcessing({ progress: 25, currentStep: "Unlocking PDF..." });
      const response = await fetch("/api/unlock", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setProcessing({ progress: 75, currentStep: "Receiving unlocked PDF..." });
      const blob = await response.blob();
      setProcessing({ progress: 100, currentStep: "Complete!" });
      setResult(blob);
    } catch (error: any) {
      console.log("Unlock PDF, error", error);
      setProcessing({
        isProcessing: false,
        error: error.message || "Failed to unlock PDF. Please check the password or try another file.",
      });
    } finally {
      setTimeout(() => {
        setProcessing({ isProcessing: false, progress: 0, currentStep: "" });
      }, 2000);
    }
  };

  const downloadResult = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-500 p-4 rounded-2xl mb-4">
            <LockOpenIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Unlock PDF
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Remove password protection from your PDF files.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`file-upload-zone ${isDragActive ? "dragover" : ""} w-full mb-6`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <LockOpenIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {isDragActive
                ? "Drop PDF file here"
                : "Drag & drop PDF file here"}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              or click to select file
            </p>
            <p className="text-xs text-gray-400">Maximum file size: 100MB</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-gray-800">
                Selected File
              </span>
              <button
                onClick={clearFiles}
                className="text-xs text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-700">{files[0].name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(files[0].size)}
              </p>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="w-full mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the password that protects this PDF
            </p>
          </div>
        )}

        {processing.isProcessing && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
              <span className="text-sm text-gray-700">
                {processing.currentStep} ({processing.progress}%)
              </span>
            </div>
            <div className="progress-bar h-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${processing.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {processing.error && (
          <div className="w-full mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {processing.error}
          </div>
        )}

        <button
          onClick={handleUnlock}
          disabled={files.length === 0 || !password || processing.isProcessing}
          className="btn btn-primary w-full text-lg py-3 mb-4"
          style={{ backgroundColor: "#eab308", borderColor: "#eab308" }}
        >
          {processing.isProcessing ? "Unlocking..." : "Unlock PDF"}
        </button>

        {result && (
          <button
            onClick={() => downloadResult(result, "unlocked_document.pdf")}
            className="btn btn-outline w-full text-lg py-3 mb-4 flex items-center justify-center"
            style={{ borderColor: "#eab308", color: "#eab308" }}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Unlocked PDF
          </button>
        )}

        <div className="w-full mt-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-900">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload a password-protected PDF file</li>
            <li>Enter the password that protects the PDF</li>
            <li>Click "Unlock PDF" to remove protection</li>
            <li>Download the unlocked PDF file</li>
          </ol>
          <div className="mt-3 text-xs text-yellow-700">
            <strong>Privacy Note:</strong> Unlocking runs through the built-in qpdf integration on this device or deployment, and temporary files are deleted right after processing.
          </div>
        </div>
      </div>
    </div>
  );
}
