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
import { UserPlus, Edit, Trash2, Shield } from "lucide-react"

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  institution: string
  researchPurpose: string
  isAdmin: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId))
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleMakeAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: "POST",
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error("Error making user admin:", error)
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
      researchPurpose: formData.get("researchPurpose") as string,
    }

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        setShowEditDialog(false)
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      institution: formData.get("institution") as string,
      researchPurpose: formData.get("researchPurpose") as string,
      isAdmin: formData.get("isAdmin") === "true",
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        setShowAddDialog(false)
        fetchUsers()
        // Reset form
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error("Error adding user:", error)
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
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
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
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="researcher">Research Scientist</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                        <SelectItem value="student">Graduate Student</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input id="institution" name="institution" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researchPurpose">Research Purpose</Label>
                    <Textarea id="researchPurpose" name="researchPurpose" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isAdmin">User Type</Label>
                    <Select name="isAdmin">
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Regular User</SelectItem>
                        <SelectItem value="true">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
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
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.institution}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="destructive">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!user.isAdmin && (
                      <Button variant="outline" size="sm" onClick={() => handleMakeAdmin(user.id)}>
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
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

        {/* Edit User Dialog */}
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
                      <Input id="firstName" name="firstName" defaultValue={editingUser.firstName} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" defaultValue={editingUser.lastName} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue={editingUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="researcher">Research Scientist</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                        <SelectItem value="student">Graduate Student</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input id="institution" name="institution" defaultValue={editingUser.institution} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researchPurpose">Research Purpose</Label>
                    <Textarea
                      id="researchPurpose"
                      name="researchPurpose"
                      defaultValue={editingUser.researchPurpose}
                      required
                    />
                  </div>
                </div>
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
