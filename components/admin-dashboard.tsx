"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getDisciplinaryActions,
  addDisciplinaryAction,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  type DisciplinaryAction,
  type User,
} from "@/lib/data"
import { PencilIcon, TrashIcon } from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("cases")
  const [cases, setCases] = useState<DisciplinaryAction[]>(getDisciplinaryActions())
  const [users, setUsers] = useState<User[]>(getUsers())

  // State for adding/editing cases
  const [newCaseStudentId, setNewCaseStudentId] = useState("")
  const [newCaseReason, setNewCaseReason] = useState("")
  const [newCaseActionTaken, setNewCaseActionTaken] = useState("")
  const [newCaseStatus, setNewCaseStatus] = useState<DisciplinaryAction["status"]>("Pending")
  const [editingCase, setEditingCase] = useState<DisciplinaryAction | null>(null)

  // State for adding/editing users
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "student">("student")
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const studentUsers = users.filter((user) => user.role === "student")

  const handleAddOrUpdateCase = (e: React.FormEvent) => {
    e.preventDefault()
    const student = users.find((u) => u.id === newCaseStudentId)
    if (!student) return

    if (editingCase) {
      const updatedCase = {
        ...editingCase,
        studentId: newCaseStudentId,
        studentName: student.name,
        reason: newCaseReason,
        actionTaken: newCaseActionTaken,
        status: newCaseStatus,
      }
      updateDisciplinaryAction(updatedCase)
      setCases(getDisciplinaryActions())
      setEditingCase(null)
    } else {
      addDisciplinaryAction({
        studentId: newCaseStudentId,
        studentName: student.name,
        date: new Date().toISOString().split("T")[0],
        reason: newCaseReason,
        actionTaken: newCaseActionTaken,
        status: newCaseStatus,
      })
      setCases(getDisciplinaryActions())
    }
    setNewCaseStudentId("")
    setNewCaseReason("")
    setNewCaseActionTaken("")
    setNewCaseStatus("Pending")
  }

  const handleEditCase = (caseToEdit: DisciplinaryAction) => {
    setEditingCase(caseToEdit)
    setNewCaseStudentId(caseToEdit.studentId)
    setNewCaseReason(caseToEdit.reason)
    setNewCaseActionTaken(caseToEdit.actionTaken)
    setNewCaseStatus(caseToEdit.status)
  }

  const handleDeleteCase = (id: string) => {
    if (confirm("Are you sure you want to delete this case?")) {
      deleteDisciplinaryAction(id)
      setCases(getDisciplinaryActions())
    }
  }

  const handleAddOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
      }
      updateUser(updatedUser)
      setUsers(getUsers())
      setEditingUser(null)
    } else {
      addUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
      })
      setUsers(getUsers())
    }
    setNewUserName("")
    setNewUserEmail("")
    setNewUserRole("student")
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setNewUserName(userToEdit.name)
    setNewUserEmail(userToEdit.email)
    setNewUserRole(userToEdit.role)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user and all their associated cases?")) {
      deleteUser(id)
      setUsers(getUsers())
      setCases(getDisciplinaryActions()) // Update cases as well
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>Manage users and disciplinary cases.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cases">Case Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          <TabsContent value="cases" className="mt-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingCase ? "Edit Disciplinary Action" : "Record New Disciplinary Action"}
            </h3>
            <form onSubmit={handleAddOrUpdateCase} className="grid gap-4 mb-8 p-4 border rounded-md">
              <div className="grid gap-2">
                <Label htmlFor="case-student-id">Student</Label>
                <Select value={newCaseStudentId} onValueChange={setNewCaseStudentId} required>
                  <SelectTrigger id="case-student-id">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="case-reason">Reason</Label>
                <Textarea
                  id="case-reason"
                  placeholder="Describe the reason for the action"
                  value={newCaseReason}
                  onChange={(e) => setNewCaseReason(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="case-action-taken">Action Taken</Label>
                <Select value={newCaseActionTaken} onValueChange={setNewCaseActionTaken} required>
                  <SelectTrigger id="case-action-taken">
                    <SelectValue placeholder="Select action taken" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warning issued">Warning issued</SelectItem>
                    <SelectItem value="Detention assigned">Detention assigned</SelectItem>
                    <SelectItem value="Parent contacted">Parent contacted</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Expulsion">Expulsion</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="case-status">Status</Label>
                <Select value={newCaseStatus} onValueChange={setNewCaseStatus} required>
                  <SelectTrigger id="case-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Appealed">Appealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingCase ? "Update Action" : "Record Action"}
              </Button>
              {editingCase && (
                <Button variant="outline" onClick={() => setEditingCase(null)}>
                  Cancel Edit
                </Button>
              )}
            </form>

            <h3 className="text-lg font-semibold mb-4">All Disciplinary Cases</h3>
            {cases.length === 0 ? (
              <p className="text-center text-muted-foreground">No disciplinary cases recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Action Taken</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.studentName}</TableCell>
                        <TableCell>{c.date}</TableCell>
                        <TableCell>{c.reason}</TableCell>
                        <TableCell>{c.actionTaken}</TableCell>
                        <TableCell>{c.status}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCase(c)} aria-label="Edit case">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCase(c.id)}
                            aria-label="Delete case"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <h3 className="text-lg font-semibold mb-4">{editingUser ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleAddOrUpdateUser} className="grid gap-4 mb-8 p-4 border rounded-md">
              <div className="grid gap-2">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  placeholder="Enter user's name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter user's email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={newUserRole}
                  onValueChange={(value: "admin" | "student") => setNewUserRole(value)}
                  required
                >
                  <SelectTrigger id="user-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingUser ? "Update User" : "Add User"}
              </Button>
              {editingUser && (
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel Edit
                </Button>
              )}
            </form>

            <h3 className="text-lg font-semibold mb-4">All Users</h3>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            aria-label="Edit user"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            aria-label="Delete user"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">This is a demo. Data is not persisted.</p>
      </CardFooter>
    </Card>
  )
}
