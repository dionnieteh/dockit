"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Upload, Trash2, Download, Edit } from "lucide-react"
import { supabase } from '@/lib/supabase' // Adjust the import path as needed
import { addReceptor, getReceptors, updateReceptor } from "@/lib/receptors" // Adjust the import path as needed
import { formatDateTimeMY } from "@/lib/utils"

interface ReceptorFile {
  id: number
  name: string
  description: string
  filePath: number
  fileSize: number
  uploadedOn: string
}

export function ReceptorManagement() {
  const [receptors, setReceptors] = useState<ReceptorFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingReceptor, setEditingReceptor] = useState<ReceptorFile | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)


  useEffect(() => {
    fetchReceptors()
  }, [])

  const fetchReceptors = async () => {
    try {
      const params = await getReceptors()
      const transformed: ReceptorFile[] = params.map((receptor: any) => ({
        id: receptor.id,
        name: receptor.name,
        description: receptor.description,
        filePath: receptor.filePath,
        fileSize: receptor.fileSize,
        uploadedOn: receptor.uploadedOn,
      }))
      setReceptors(transformed)
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
        .upload(`receptors/${formatDateTimeMY(new Date)}_${sanitizedFileName}`, selectedFile, {
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

      const response = await addReceptor(receptorData)

      if (response) {
        setShowAddDialog(false)
        setSelectedFile(null)
        fetchReceptors()
          ; (e.target as HTMLFormElement).reset()
      } else {
        // Clean up uploaded file if database save fails
        await supabase.storage
          .from('receptors')
          .remove([uploadData.path])

        alert("Failed to save receptor data: " + response)
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

  const handleEditReceptor = (receptor: ReceptorFile) => {
    setEditingReceptor(receptor)
    setShowEditDialog(true)
  }

  const handleUpdateReceptor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingReceptor) return

    const formData = new FormData(e.currentTarget)
    const updatedName = formData.get("name") as string
    const updatedDescription = formData.get("description") as string

    const response = await updateReceptor(editingReceptor.id, {
      name: updatedName,
      description: updatedDescription,
      filePath: editingReceptor.filePath, // Keep the same file path
      fileSize: editingReceptor.fileSize, // Keep the same file size
    })

    if (response.ok) {
      setReceptors((prev) =>
        prev.map((r) =>
          r.id === editingReceptor.id
            ? { ...r, name: updatedName, description: updatedDescription }
            : r
        )
      )
      setShowEditDialog(false)
      setEditingReceptor(null)
    } else {
      setShowEditDialog(false)
      alert("Failed to update receptor info.")
    }
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
              <TableHead>Uploaded On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receptors.map((receptor) => (
              <TableRow key={receptor.id}>
                <TableCell className="font-medium">{receptor.name}</TableCell>
                <TableCell className="max-w-xs truncate">{receptor.description}</TableCell>
                <TableCell>{formatFileSize(receptor.fileSize)}</TableCell>
                <TableCell>{formatDateTimeMY(new Date(receptor.uploadedOn))}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditReceptor(receptor)}>
                      <Edit className="h-4 w-4" />
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
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Receptor Info</DialogTitle>
              <DialogDescription>Update name or description of this receptor file</DialogDescription>
            </DialogHeader>

            {editingReceptor && (
              <form onSubmit={handleUpdateReceptor}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Receptor Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingReceptor.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingReceptor.description}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">Update Receptor</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
