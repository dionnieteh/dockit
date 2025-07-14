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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { UserPlus, Edit, Trash2, Shield, User } from "lucide-react"
import { getUsers, updateUser, addAdmin, deleteUser } from "@/lib/users"
import { capitalize } from "@/lib/utils"
import { useToast, ToastVariant } from "@/hooks/use-toast"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  institution: string
  purpose: string
}

interface UserManagementProps {
  onUserCountChange?: () => void
}

export function UserManagement({ onUserCountChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [successToast, setSuccessMsg] = useState<string | null>(null)
  const [errorToast, setErrorMsg] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (successToast) {
      toast({
        title: "Update Successful",
        description: successToast || "User information has been successfully updated.",
        variant: ToastVariant.SUCCESS,
      })
      setSuccessMsg(null)
    }
    if (errorToast) {
      toast({
        title: "Error Occured",
        description: errorToast || "An error occurred while processing your request.",
        variant: ToastVariant.ERROR,
      })
      setErrorMsg(null)
    }
  }, [successToast, errorToast, toast])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const params = await getUsers()
      const transformed: User[] = params.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        institution: user.institution,
        purpose: user.purpose,
      }))
      setUsers(transformed)
    } catch (err) {
      setErrorMsg(`Failed to fetch users: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id)
      setUsers(users.filter((user) => user.id !== id))
      setSuccessMsg("User deleted successfully.")
      // Trigger stats refresh
      onUserCountChange?.()
    } catch (err) {
      setErrorMsg(`Failed to delete user: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditDialog(true)
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const userData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      institution: formData.get("institution") as string,
      purpose: formData.get("purpose") as string,
    }

    try {
      await updateUser(editingUser.id, userData)
      setSuccessMsg("User information updated successfully.")
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...userData } : user)))
      setShowEditDialog(false)
      setEditingUser(null)
    } catch (err) {
      setErrorMsg(`Failed to update user: ${err}`)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: "Admin",
    }

    try {
      console.log('Submitting user data:', userData)
      const result = await addAdmin(userData)
      console.log('Add admin result:', result)
      setSuccessMsg("New admin added successfully.")
      setShowAddDialog(false)
      fetchUsers()
      // Trigger stats refresh
      onUserCountChange?.()
        ; (e.target as HTMLFormElement).reset()
    } catch (err) {
      console.error('Add admin error:', err)
      setErrorMsg(`Failed to add admin: ${err}`)
    }
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and administrators</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Create a new admin account</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAdmin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">Add User</Button>
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="destructive">
                    {user.role.toLowerCase() === "admin" ?
                      <Shield className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />
                    }
                    {capitalize(user.role)}</Badge>
                </TableCell>
                <TableCell>{user.institution}</TableCell>
                <TableCell>{user.purpose}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
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
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>

            {editingUser && (
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={editingUser.firstName}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={editingUser.lastName}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    {editingUser.role.toLowerCase() === "admin" ? (
                      <>
                        <Input id="role" name="role" value="Admin" disabled />
                        <input type="hidden" name="role" value="Admin" />
                      </>
                    ) : (
                      <Select name="role" defaultValue={editingUser.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="researcher">Research Scientist</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                          <SelectItem value="student">Graduate Student</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                {editingUser.role.toLowerCase() !== "admin" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        name="institution"
                        defaultValue={editingUser.institution}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Research Purpose</Label>
                      <Textarea
                        id="purpose"
                        name="purpose"
                        defaultValue={editingUser.purpose}
                        required
                      />
                    </div>
                  </>
                )}
                <DialogFooter className="mt-6">
                  <Button type="submit">Update User</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}