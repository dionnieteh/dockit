"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedFileTypes?: string[]
  multiple?: boolean
}

export function FileUpload({ onFilesChange, acceptedFileTypes = [".mol2", ".pdb"], multiple = true }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

      if (acceptedFileTypes.includes(fileExtension)) {
        validFiles.push(file)
      }
    }

    return validFiles
  }

  const MAX_FILES = 50

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files)
      if (validFiles.length > 0) {
        let newFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]]
        if (newFiles.length > MAX_FILES) {
          newFiles = newFiles.slice(0, MAX_FILES)
        }
        setSelectedFiles(newFiles)
        onFilesChange(newFiles)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files)
      if (validFiles.length > 0) {
        let newFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]]
        if (newFiles.length > MAX_FILES) {
          newFiles = newFiles.slice(0, MAX_FILES)
        }
        setSelectedFiles(newFiles)
        onFilesChange(newFiles)
      }
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
    onFilesChange(newFiles)
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(",")}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Drag and drop your files</h3>
          <p className="text-sm text-muted-foreground">or click to browse files</p>
          <p className="text-xs text-muted-foreground">Accepted file types: {acceptedFileTypes.join(", ")}</p>
          <Button type="button" variant="outline" size="sm" onClick={handleButtonClick} className="mt-2">
            Select Files
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <div className="max-h-40 overflow-y-auto rounded-md border">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between border-b p-2 last:border-0"
              >
                <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-6 w-6">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
