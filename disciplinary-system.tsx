"use client"

import { useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/data"

export default function DisciplinarySystem() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  // Remove this line:
  // const [currentStudentId, setCurrentStudentId] = useState<string | null>(null) // For student view selection

  const handleLoginSuccess = (user: User) => {
    setLoggedInUser(user)
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    // Remove this line:
    // setCurrentStudentId(null)
  }

  if (!loggedInUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 w-full">
      <header className="w-full max-w-5xl flex justify-between items-center py-4 px-2 sm:px-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">Logged in as:</span>
          <span className="font-bold">
            {loggedInUser.name} ({loggedInUser.role})
          </span>
        </div>
        <Button onClick={handleLogout} variant="outline" className="bg-transparent">
          Logout
        </Button>
      </header>

      <main className="flex-1 w-full max-w-5xl mt-4">
        {loggedInUser.role === "admin" ? <AdminDashboard /> : <StudentDashboard studentId={loggedInUser.id} />}
      </main>
    </div>
  )
}
