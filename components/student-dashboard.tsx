"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { getDisciplinaryActions, getUserById, addAppeal, updateDisciplinaryAction, getAppeals } from "@/app/actions" // Import getAppeals
import type { DisciplinaryAction, User, Appeal } from "@/types/data"
import { format } from "date-fns"

interface StudentDashboardProps {
  studentId: string
}

export function StudentDashboard({ studentId }: StudentDashboardProps) {
  const [student, setStudent] = useState<User | null>(null)
  const [studentActions, setStudentActions] = useState<DisciplinaryAction[]>([])
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([]) // New state for all appeals

  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false)
  const [selectedActionForAppeal, setSelectedActionForAppeal] = useState<DisciplinaryAction | null>(null)
  const [appealReason, setAppealReason] = useState("")
  const [evidenceLink, setEvidenceLink] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const fetchedStudent = await getUserById(studentId)
      setStudent(fetchedStudent || null)

      const allActions = await getDisciplinaryActions()
      setStudentActions(allActions.filter((action) => action.studentId === studentId))

      setAllAppeals(await getAppeals()) // Fetch all appeals
    }
    fetchData()
  }, [studentId])

  const handleAppealClick = (action: DisciplinaryAction) => {
    setSelectedActionForAppeal(action)
    setAppealReason("")
    setEvidenceLink("")
    setIsAppealDialogOpen(true)
  }

  const handleSubmitAppeal = async () => {
    if (!selectedActionForAppeal || !appealReason.trim()) {
      alert("Appeal reason cannot be empty.")
      return
    }

    const newAppeal = await addAppeal({
      disciplinaryActionId: selectedActionForAppeal.id,
      studentId: selectedActionForAppeal.studentId,
      appealReason: appealReason.trim(),
      evidenceLink: evidenceLink.trim() || undefined,
      appealDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    })

    // Update the disciplinary action status to "Appealed" and link the appeal
    await updateDisciplinaryAction({
      ...selectedActionForAppeal,
      status: "Appealed",
      appealId: newAppeal.id,
    })

    setIsAppealDialogOpen(false)
    setSelectedActionForAppeal(null)
    setAppealReason("")
    setEvidenceLink("")

    // Re-fetch data to update the UI
    const allActions = await getDisciplinaryActions()
    setStudentActions(allActions.filter((action) => action.studentId === studentId))
  }

  if (!student) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Error: Student not found.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Could not retrieve student information for ID: {studentId}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Student Dashboard</CardTitle>
        <CardDescription>
          Your disciplinary records for {student.name} (ID: {student.id})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentActions.length === 0 ? (
          <p className="text-center text-muted-foreground">No disciplinary records found for {student.name}.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Action Taken</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentActions.map((action) => {
                const appeal = action.appealId ? allAppeals.find((a) => a.id === action.appealId) : null
                const displayStatus = appeal ? `Appealed (${appeal.status})` : action.status

                return (
                  <TableRow key={action.id}>
                    {[
                      <TableCell key="date">{format(new Date(action.date), "PPP")}</TableCell>,
                      <TableCell key="reason">{action.reason}</TableCell>,
                      <TableCell key="taken">{action.actionTaken}</TableCell>,
                      <TableCell key="status">{displayStatus}</TableCell>,
                      <TableCell key="actions" className="text-right">
                        {action.status !== "Appealed" && action.status !== "Resolved" && (
                          <Button variant="outline" size="sm" onClick={() => handleAppealClick(action)}>
                            Appeal
                          </Button>
                        )}
                        {action.status === "Appealed" && appeal?.status === "Pending" && (
                          <span className="text-muted-foreground text-sm">Appeal Pending</span>
                        )}
                        {action.status === "Appealed" && appeal?.status === "Approved" && (
                          <span className="text-green-600 text-sm font-medium">Appeal Approved</span>
                        )}
                        {action.status === "Appealed" && appeal?.status === "Rejected" && (
                          <span className="text-red-600 text-sm font-medium">Appeal Rejected</span>
                        )}
                      </TableCell>,
                    ]}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Appeal Disciplinary Action</DialogTitle>
            <DialogDescription>
              Submit your reason for appealing the disciplinary action for case ID:{" "}
              {selectedActionForAppeal?.id.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="appealReason">Reason for Appeal</Label>
              <Textarea
                id="appealReason"
                placeholder="Explain why you are appealing this action..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="evidenceLink">Evidence Link (Optional)</Label>
              <Input
                id="evidenceLink"
                type="url"
                placeholder="e.g., https://my-drive.com/evidence.pdf"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmitAppeal}>
              Submit Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
