"use client"

import type React from "react"

import { useState } from "react"
import {
  addDisciplinaryAction,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getDisciplinaryActions,
  addOrUpdateUser,
  deleteUser,
  getUsers,
  type DisciplinaryAction,
  type User,
} from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

type AdminDashboardProps = {}

export function AdminDashboard({}: AdminDashboardProps) {
  // Case Management State
  const [studentId, setStudentId] = useState("")
  const [actionTaken, setActionTaken] = useState("")
  const [reason, setReason] = useState("")
  const [caseStatus, setCaseStatus] = useState<DisciplinaryAction["status"]>("Pending")
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null)

  // User Management State
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("") // This will be for new password input
  const [userRole, setUserRole] = useState<User["role"]>("student")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // State for users and disciplinary actions to trigger re-renders
  const [allUsers, setAllUsers] = useState<User[]>(getUsers())
  const [allDisciplinaryActions, setAllDisciplinaryActions] = useState<DisciplinaryAction[]>(getDisciplinaryActions())

  const studentUsers = allUsers.filter((user) => user.role === "student")

  const handleRecordAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !actionTaken || !reason) return

    if (editingCaseId) {
      updateDisciplinaryAction({
        id: editingCaseId,
        studentId,
        studentName: allUsers.find((u) => u.id === studentId)?.name ?? "Unknown",
        date: new Date().toISOString().split("T")[0],
        actionTaken,
        reason,
        status: caseStatus,
      })
      setEditingCaseId(null)
    } else {
      addDisciplinaryAction({
        studentId,
        studentName: allUsers.find((u) => u.id === studentId)?.name ?? "Unknown",
        date: new Date().toISOString().split("T")[0],
        actionTaken,
        reason,
        status: caseStatus,
      })
    }
    setStudentId("")
    setActionTaken("")
    setReason("")
    setCaseStatus("Pending")
    setAllDisciplinaryActions(getDisciplinaryActions()) // Update state to re-render
  }

  const handleEditCase = (caseToEdit: DisciplinaryAction) => {
    setEditingCaseId(caseToEdit.id)
    setStudentId(caseToEdit.studentId)
    setActionTaken(caseToEdit.actionTaken)
    setReason(caseToEdit.reason)
    setCaseStatus(caseToEdit.status)
  }

  const handleDeleteCase = (id: string) => {
    deleteDisciplinaryAction(id)
    setAllDisciplinaryActions(getDisciplinaryActions()) // Update state to re-render
  }

  const handleAddOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !userEmail) return // Password is now optional for updates

    const userData: Omit<User, "id"> & { id?: string } = {
      id: editingUserId || undefined,
      name: userName,
      email: userEmail,
      role: userRole,
      password: userPassword, // Initialize with current password state
    }

    // If editing an existing user and no new password is provided, retain the old one
    if (editingUserId && !userPassword) {
      const existingUser = allUsers.find((u) => u.id === editingUserId)
      if (existingUser) {
        userData.password = existingUser.password
      }
    } else if (!userPassword && !editingUserId) {
      // If adding a new user and no password, prevent submission
      alert("Password is required for new users.")
      return
    }

    addOrUpdateUser(userData)
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    setUserRole("student")
    setEditingUserId(null)
    setAllUsers(getUsers()) // Update state to re-render
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUserId(userToEdit.id)
    setUserName(userToEdit.name)
    setUserEmail(userToEdit.email)
    setUserPassword("") // Clear password field when editing for security
    setUserRole(userToEdit.role)
  }

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
    setAllUsers(getUsers()) // Update state to re-render
    setAllDisciplinaryActions(getDisciplinaryActions()) // Also update disciplinary actions as they might be linked
  }

  const handleCancelEditUser = () => {
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    setUserRole("student")
    setEditingUserId(null)
  }

  const handleCancelEditCase = () => {
    setStudentId("")
    setActionTaken("")
    setReason("")
    setCaseStatus("Pending")
    setEditingCaseId(null)
  }

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="case-management" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="case-management">Case Management</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
          </TabsList>
          <TabsContent value="case-management" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingCaseId ? "Edit Disciplinary Action" : "Record New Disciplinary Action"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordAction} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="studentId">Student</Label>
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger id="studentId">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} (ID: {user.id.substring(0, 4)}...)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="actionTaken">Action Taken</Label>
                    <Input
                      id="actionTaken"
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="e.g., Warning, Suspension"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason / Description</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Detailed description of the incident"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="caseStatus">Status</Label>
                    <Select
                      value={caseStatus}
                      onValueChange={(value: DisciplinaryAction["status"]) => setCaseStatus(value)}
                    >
                      <SelectTrigger id="caseStatus">
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
                  <div className="flex gap-2">
                    <Button type="submit">{editingCaseId ? "Update Action" : "Record Action"}</Button>
                    {editingCaseId && (
                      <Button type="button" variant="outline" onClick={handleCancelEditCase}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>All Disciplinary Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Action Taken</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDisciplinaryActions.map((action) => {
                      const student = allUsers.find((user) => user.id === action.studentId)
                      return (
                        <TableRow key={action.id}>
                          <TableCell>{student ? student.name : "Unknown"}</TableCell>
                          <TableCell>{action.actionTaken}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{action.reason}</TableCell>
                          <TableCell>{format(new Date(action.date), "PPP")}</TableCell>
                          <TableCell>{action.status}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleEditCase(action)} className="mr-2">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCase(action.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-management" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingUserId ? "Edit User" : "Add New User"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddOrUpdateUser} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="userName">Name</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="User's Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userPassword">Password</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder={editingUserId ? "Leave blank to keep current password" : "Password"}
                      required={!editingUserId} // Password is required only for new users
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userRole">Role</Label>
                    <Select value={userRole} onValueChange={(value: User["role"]) => setUserRole(value)}>
                      <SelectTrigger id="userRole">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingUserId ? "Update User" : "Add User"}</Button>
                    {editingUserId && (
                      <Button type="button" variant="outline" onClick={handleCancelEditUser}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
