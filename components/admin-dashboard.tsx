"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  addDisciplinaryAction,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getDisciplinaryActions,
  addOrUpdateUser,
  deleteUser,
  getUsers,
  getAppeals,
  updateAppeal,
} from "@/app/actions" // Import from actions
import type { DisciplinaryAction, User, Appeal } from "@/types/data" // Import types
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
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
  const [userPassword, setUserPassword] = useState("")
  const [userRole, setUserRole] = useState<User["role"]>("student")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // Appeal Management State
  const [isAppealDetailsDialogOpen, setIsAppealDetailsDialogOpen] = useState(false)
  const [selectedAppealDetails, setSelectedAppealDetails] = useState<Appeal | null>(null)

  // State for users and disciplinary actions to trigger re-renders
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allDisciplinaryActions, setAllDisciplinaryActions] = useState<DisciplinaryAction[]>([])
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([])

  // Fetch data on component mount and whenever data might have changed
  useEffect(() => {
    const fetchData = async () => {
      setAllUsers(await getUsers())
      setAllDisciplinaryActions(await getDisciplinaryActions())
      setAllAppeals(await getAppeals())
    }
    fetchData()
  }, []) // Empty dependency array means this runs once on mount

  const studentUsers = allUsers.filter((user) => user.role === "student")

  const handleRecordAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !actionTaken || !reason) return

    if (editingCaseId) {
      await updateDisciplinaryAction({
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
      await addDisciplinaryAction({
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
    setAllDisciplinaryActions(await getDisciplinaryActions()) // Update state to re-render
  }

  const handleEditCase = (caseToEdit: DisciplinaryAction) => {
    setEditingCaseId(caseToEdit.id)
    setStudentId(caseToEdit.studentId)
    setActionTaken(caseToEdit.actionTaken)
    setReason(caseToEdit.reason)
    setCaseStatus(caseToEdit.status)
  }

  const handleDeleteCase = async (id: string) => {
    await deleteDisciplinaryAction(id)
    setAllDisciplinaryActions(await getDisciplinaryActions()) // Update state to re-render
    setAllAppeals(await getAppeals()) // Update appeals as well, since they might be linked
  }

  const handleAddOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !userEmail) return

    const userData: Omit<User, "id"> & { id?: string } = {
      id: editingUserId || undefined,
      name: userName,
      email: userEmail,
      role: userRole,
      password: userPassword,
    }

    if (editingUserId && !userPassword) {
      const existingUser = allUsers.find((u) => u.id === editingUserId)
      if (existingUser) {
        userData.password = existingUser.password
      }
    } else if (!userPassword && !editingUserId) {
      alert("Password is required for new users.")
      return
    }

    await addOrUpdateUser(userData)
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    setUserRole("student")
    setEditingUserId(null)
    setAllUsers(await getUsers()) // Update state to re-render
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUserId(userToEdit.id)
    setUserName(userToEdit.name)
    setUserEmail(userToEdit.email)
    setUserPassword("")
    setUserRole(userToEdit.role)
  }

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id)
    setAllUsers(await getUsers())
    setAllDisciplinaryActions(await getDisciplinaryActions())
    setAllAppeals(await getAppeals())
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

  const handleViewAppealDetails = (appeal: Appeal) => {
    setSelectedAppealDetails(appeal)
    setIsAppealDetailsDialogOpen(true)
  }

  const handleUpdateAppealStatus = async (status: Appeal["status"]) => {
    if (selectedAppealDetails) {
      await updateAppeal({ ...selectedAppealDetails, status })
      setAllAppeals(await getAppeals()) // Re-fetch appeals to update the list
      setIsAppealDetailsDialogOpen(false)
    }
  }

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="case-management" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="case-management">Case Management</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="appeal-management">Appeal Management</TabsTrigger>
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
                      required={!editingUserId}
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

          {/* New Appeal Management Tab Content */}
          <TabsContent value="appeal-management" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Appeals</CardTitle>
              </CardHeader>
              <CardContent>
                {allAppeals.length === 0 ? (
                  <p className="text-center text-muted-foreground">No appeals submitted yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Appeal ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Case Reason</TableHead>
                        <TableHead>Appeal Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAppeals.map((appeal) => {
                        const student = allUsers.find((user) => user.id === appeal.studentId)
                        const disciplinaryCase = allDisciplinaryActions.find(
                          (action) => action.id === appeal.disciplinaryActionId,
                        )
                        return (
                          <TableRow key={appeal.id}>
                            <TableCell className="font-mono text-xs">{appeal.id.substring(0, 8)}...</TableCell>
                            <TableCell>{student ? student.name : "Unknown"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {disciplinaryCase?.reason || "N/A"}
                            </TableCell>
                            <TableCell>{format(new Date(appeal.appealDate), "PPP")}</TableCell>
                            <TableCell>{appeal.status}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleViewAppealDetails(appeal)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Appeal Details Dialog for Admin */}
      <Dialog open={isAppealDetailsDialogOpen} onOpenChange={setIsAppealDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appeal Details</DialogTitle>
            <DialogDescription>Review the details of this appeal.</DialogDescription>
          </DialogHeader>
          {selectedAppealDetails && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Appeal ID:</Label>
                <span className="col-span-2 font-mono text-xs">{selectedAppealDetails.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Case ID:</Label>
                <span className="col-span-2 font-mono text-xs">{selectedAppealDetails.disciplinaryActionId}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Student:</Label>
                <span className="col-span-2">
                  {allUsers.find((u) => u.id === selectedAppealDetails.studentId)?.name || "Unknown"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-right pt-2">Appeal Reason:</Label>
                <p className="col-span-2 break-words">{selectedAppealDetails.appealReason}</p>
              </div>
              {selectedAppealDetails.evidenceLink && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-right">Evidence:</Label>
                  <a
                    href={selectedAppealDetails.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 text-blue-600 hover:underline truncate"
                  >
                    {selectedAppealDetails.evidenceLink}
                  </a>
                </div>
              )}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Appeal Date:</Label>
                <span className="col-span-2">{format(new Date(selectedAppealDetails.appealDate), "PPP")}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">Status:</Label>
                <span className="col-span-2 font-medium">{selectedAppealDetails.status}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleUpdateAppealStatus("Approved")}
              disabled={selectedAppealDetails?.status === "Approved"}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateAppealStatus("Rejected")}
              disabled={selectedAppealDetails?.status === "Rejected"}
            >
              Reject
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
