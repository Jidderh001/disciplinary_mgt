"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDisciplinaryActions, getUserById } from "@/lib/data" // Import getUserById

interface StudentDashboardProps {
  studentId: string
}

export function StudentDashboard({ studentId }: StudentDashboardProps) {
  const studentActions = getDisciplinaryActions().filter((action) => action.studentId === studentId)
  const student = getUserById(studentId) // Get student details

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>{action.date}</TableCell>
                  <TableCell>{action.reason}</TableCell>
                  <TableCell>{action.actionTaken}</TableCell>
                  <TableCell>{action.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
