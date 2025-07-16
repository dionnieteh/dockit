"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
import { Upload, Trash2, Edit } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { addReceptor, deleteReceptor, getReceptors, updateReceptor } from "@/lib/receptors" // Adjust the import path as needed
import { formatDateTimeMY } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { TOAST } from "@/lib/toast-messages"

interface ReceptorFile {
  id: number
  name: string
  description: string
  filePath: number
  fileSize: number
  uploadedOn: string
}

interface ReceptorManagementProps {
  onFileCountChange?: () => void
}

export function ReceptorManagement({ onFileCountChange }: ReceptorManagementProps) {
  const [receptors, setReceptors] = useState<ReceptorFile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReceptor, setEditingReceptor] = useState<ReceptorFile | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { toast } = useToast()

  useEffect(() => {
    fetchReceptors()
  }, [])

  const fetchReceptors = async () => {
    try {
      const res = await getReceptors()

      if (res.error) {
        throw new Error(res.error);
      }

      const transformed: ReceptorFile[] = res.map((receptor: any) => ({
        id: receptor.id,
        name: receptor.name,
        description: receptor.description,
        filePath: receptor.filePath,
        fileSize: receptor.fileSize,
        uploadedOn: receptor.uploadedOn,
      }))
      setReceptors(transformed)
    } catch (err) {
      toast({
        title: "Receptor " + TOAST.GET_ERROR.title,
        description: TOAST.GET_ERROR.description + (err ? err : "Unknown error"),
        variant: TOAST.GET_ERROR.variant,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = [".pdbqt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        alert("Please select a PDBQT file")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUploadReceptor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) return

    const allowedTypes = ['.pdbqt']
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      alert('Only PDBQT files are allowed')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (selectedFile.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const fileContent = await selectedFile.text()
    if (!fileContent.includes('ATOM') && !fileContent.includes('HETATM')) {
      alert('File does not appear to be a valid PDB/PDBQT file')
      return
    }

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receptors')
        .upload(`receptors/${formatDateTimeMY(new Date)}_${sanitizedFileName}`, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'text/plain'
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const receptorData = {
        name: sanitizedFileName,
        description: description,
        fileSize: selectedFile.size,
        filePath: uploadData.path,
      }

      const response = await addReceptor(receptorData)

      if (response) {
        toast({
          title: "Receptor " + TOAST.FILE_CREATE_SUCCESS.title,
          description: TOAST.FILE_CREATE_SUCCESS.description,
          variant: TOAST.FILE_CREATE_SUCCESS.variant,
        })
        setShowAddDialog(false)
        setSelectedFile(null)
        fetchReceptors()
        onFileCountChange?.()
          ; (e.target as HTMLFormElement).reset()
      } else {
        await supabase.storage
          .from('receptors')
          .remove([uploadData.path])

        throw new Error("Failed to add receptor to database, removed file from supabase: " + response)
      }

    } catch (error) {
      console.error("Error uploading receptor:", error)
      toast({
        title: "Receptor " + TOAST.FILE_CREATE_ERROR.title,
        description: TOAST.FILE_CREATE_ERROR.description + (error ? error : "Unknown error"),
        variant: TOAST.FILE_CREATE_ERROR.variant,
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

    try {
      const res = await updateReceptor(editingReceptor.id, {
        name: updatedName,
        description: updatedDescription,
        filePath: editingReceptor.filePath,
        fileSize: editingReceptor.fileSize
      })

      if (res.error) {
        throw new Error(res.error)
      }
      setReceptors((prev) =>
        prev.map((r) =>
          r.id === editingReceptor.id
            ? { ...r, name: updatedName, description: updatedDescription }
            : r
        )
      )
      setEditingReceptor(null)
      toast({
        title: "Receptor " + TOAST.UPDATE_SUCCESS.title,
        description: TOAST.UPDATE_SUCCESS.description,
        variant: TOAST.UPDATE_SUCCESS.variant
      });
    } catch (error) {
      toast({
        title: "Receptor " + TOAST.UPDATE_ERROR.title,
        description: TOAST.UPDATE_ERROR.description + (error ? error : "Unknown error"),
        variant: TOAST.UPDATE_ERROR.variant
      });
    }
    setShowEditDialog(false)
  }

  const handleDeleteReceptor = async (receptorId: number) => {
    try {
      const res = await deleteReceptor(receptorId);

      if (res.error) {
        throw new Error(res.error);
      }

      setReceptors(receptors.filter((receptor) => receptor.id !== receptorId));
      onFileCountChange?.();
      toast({
        title: "Receptor " + TOAST.DELETE_SUCCESS.title,
        description: TOAST.DELETE_SUCCESS.description,
        variant: TOAST.DELETE_SUCCESS.variant
      });
    } catch (error) {
      toast({
        title: "Receptor " + TOAST.DELETE_ERROR.title,
        description: TOAST.DELETE_ERROR.description + (error ? error : "Unknown error"),
        variant: TOAST.DELETE_ERROR.variant
      });
    }
  };

  const filteredReceptors = useMemo(() => {
    if (!searchTerm) return receptors;
    const lowerSearch = searchTerm.toLowerCase();
    return receptors.filter((r) =>
      r.name.toLowerCase().includes(lowerSearch) ||
      r.description?.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, receptors]);

  if (loading) {
    return <div className="px-4">Loading receptors...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Receptor File Management</CardTitle>
            <CardDescription>Manage receptor files for docking jobs</CardDescription>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Input
            type="text"
            placeholder="Search by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Receptor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Receptor File</DialogTitle>
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
            {filteredReceptors.map((receptor) => (
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
