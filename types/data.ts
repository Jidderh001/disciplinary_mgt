export type User = {
  id: string
  name: string
  role: "admin" | "student"
  email: string
  password: string
}

export type DisciplinaryAction = {
  id: string
  studentId: string // Link to User ID
  studentName: string // For display convenience
  date: string
  reason: string
  actionTaken: string
  status: "Pending" | "Resolved" | "Closed" | "Appealed"
  appealId?: string // Link to an appeal if one exists
}

export type Appeal = {
  id: string
  disciplinaryActionId: string
  studentId: string
  appealReason: string
  evidenceLink?: string
  appealDate: string
  status: "Pending" | "Approved" | "Rejected"
}
