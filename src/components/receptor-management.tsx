"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Upload, Trash2, Download } from "lucide-react"
// import { createClient } from '@/utils/supabase/client'
import { createClient } from '@supabase/supabase-js'

interface ReceptorFile {
  id: number
  name: string
  description: string
  filePath: number
  fileSize: number
}

export function ReceptorManagement() {
  const [receptors, setReceptors] = useState<ReceptorFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchReceptors()
  }, [])

  const fetchReceptors = async () => {
    try {
      const response = await fetch("/api/admin/receptors")
      if (response.ok) {
        const data = await response.json()
        setReceptors(data.receptors)
      }
    } catch (error) {
      console.error("Error fetching receptors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [".pdbqt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        alert("Please select a PDB or PDBQT file")
        return
      }

      setSelectedFile(file)
    }
  }


const handleUploadReceptor = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!selectedFile) return

  // 1. File type validation - PDBQT only
  const allowedTypes = ['.pdbqt']
  const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
  
  if (!allowedTypes.includes(fileExtension)) {
    alert('Only PDBQT files are allowed')
    return
  }

  // 2. File size limit (e.g., 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (selectedFile.size > maxSize) {
    alert('File size must be less than 10MB')
    return
  }

  // 3. File name sanitization
  const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')

  const formData = new FormData(e.currentTarget)
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // 4. Content validation (basic)
  const fileContent = await selectedFile.text()
  if (!fileContent.includes('ATOM') && !fileContent.includes('HETATM')) {
    alert('File does not appear to be a valid PDB/PDBQT file')
    return
  }

  try {
    // Upload with restrictions
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receptors')
      .upload(`receptors/${Date.now()}_${sanitizedFileName}`, selectedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'text/plain' // Force content type
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      alert("Failed to upload file: " + uploadError.message)
      return
    }

    // Save metadata
    const receptorData = {
      name: sanitizedFileName,
      description: description,
      fileSize: selectedFile.size, // Store size in bytes
      filePath: uploadData.path,
      // uploadedOn: new Date().toISOString()
    }

    const response = await fetch("/api/admin/receptors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receptorData),
    })

    if (response.ok) {
      setShowAddDialog(false)
      setSelectedFile(null)
      fetchReceptors()
      ;(e.target as HTMLFormElement).reset()
    } else {
      // Clean up uploaded file if database save fails
      await supabase.storage
        .from('receptors')
        .remove([uploadData.path])
      
      const errorData = await response.json()
      alert("Failed to save receptor data: " + errorData.message)
    }

  } catch (error) {
    console.error("Error uploading receptor:", error)
    alert("An error occurred while uploading the receptor")
  }
}

  const handleDeleteReceptor = async (receptorId: number) => {
    try {
      const response = await fetch(`/api/admin/receptors/${receptorId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setReceptors(receptors.filter((receptor) => receptor.id !== receptorId))
      }
    } catch (error) {
      console.error("Error deleting receptor:", error)
    }
  }

  const handleToggleActive = async (receptorId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/receptors/${receptorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchReceptors()
      }
    } catch (error) {
      console.error("Error updating receptor:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return <div>Loading receptors...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Receptor File Management</CardTitle>
            <CardDescription>Manage receptor files available for docking jobs</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Receptor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Receptor File</DialogTitle>
                <DialogDescription>Add a new receptor file to the library</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadReceptor}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Receptor Name</Label>
                    <Input id="name" name="name" placeholder="e.g., Dengue NS3 Protease" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of the receptor structure"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Receptor File (PDB/PDBQT)</Label>
                    <Input id="file" type="file" accept=".pdb,.pdbqt" onChange={handleFileChange} required />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={!selectedFile}>
                    Upload Receptor
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receptors.map((receptor) => (
              <TableRow key={receptor.id}>
                <TableCell className="font-medium">{receptor.name}</TableCell>
                <TableCell className="max-w-xs truncate">{receptor.description}</TableCell>
                <TableCell>{formatFileSize(receptor.fileSize)}</TableCell>
                <TableCell>{receptor.uploadedBy}</TableCell>
                <TableCell>
                  <Badge
                    variant={receptor.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(receptor.id, receptor.isActive)}
                  >
                    {receptor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Receptor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this receptor file? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReceptor(receptor.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
