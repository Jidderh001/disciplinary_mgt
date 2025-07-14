"use client"

import { useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import { LoginForm } from "@/components/login-form"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getUsers, type User } from "@/lib/data"

export default function DisciplinarySystem() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null) // For student view selection

  const handleLoginSuccess = (user: User) => {
    setLoggedInUser(user)
    if (user.role === "student") {
      setCurrentStudentId(user.id) // If a student logs in, set them as the current student
    } else {
      // If admin logs in, default to Alice Johnson for student view selection
      setCurrentStudentId(getUsers().find((u) => u.role === "student")?.id || null)
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setCurrentStudentId(null)
  }

  const studentUsers = getUsers().filter((user) => user.role === "student")

  if (!loggedInUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="mb-6 p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Logged in as:</span>
          <span className="font-bold">
            {loggedInUser.name} ({loggedInUser.role})
          </span>
        </div>
        {loggedInUser.role === "admin" && (
          <div className="flex items-center gap-2">
            <span className="font-medium">View as Student:</span>
            <Select value={currentStudentId || ""} onValueChange={setCurrentStudentId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Student" />
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
        )}
        <Button onClick={handleLogout} variant="outline" className="ml-auto bg-transparent">
          Logout
        </Button>
      </Card>

      {loggedInUser.role === "admin" ? (
        <AdminDashboard />
      ) : (
        currentStudentId && <StudentDashboard studentId={currentStudentId} />
      )}
    </div>
  )
}
