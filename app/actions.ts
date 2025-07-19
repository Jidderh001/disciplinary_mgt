"use server"

import { revalidatePath } from "next/cache"
import type { User, DisciplinaryAction, Appeal } from "@/types/data"

// Using a simple in-memory array for demo purposes.
// In a real application, this would be replaced with a database.
let currentUsers: User[] = [
  { id: "user-1", name: "Alice Johnson", role: "student", email: "alice@example.com", password: "password" },
  { id: "user-2", name: "Bob Smith", role: "student", email: "bob@example.com", password: "password" },
  { id: "user-3", name: "Charlie Brown", role: "student", email: "charlie@example.com", password: "password" },
  { id: "user-4", name: "Admin User", role: "admin", email: "admin@example.com", password: "password" },
]

let currentDisciplinaryActions: DisciplinaryAction[] = [
  {
    id: "case-1",
    studentId: "user-1",
    studentName: "Alice Johnson",
    date: "2023-10-26",
    reason: "Late submission of assignment",
    actionTaken: "Warning issued",
    status: "Resolved",
  },
  {
    id: "case-2",
    studentId: "user-2",
    studentName: "Bob Smith",
    date: "2023-11-01",
    reason: "Disruptive behavior in class",
    actionTaken: "Detention assigned",
    status: "Pending",
  },
  {
    id: "case-3",
    studentId: "user-1",
    studentName: "Alice Johnson",
    date: "2023-11-15",
    reason: "Unexcused absence",
    actionTaken: "Parent contacted",
    status: "Closed",
  },
  {
    id: "case-4",
    studentId: "user-3",
    studentName: "Charlie Brown",
    date: "2023-12-05",
    reason: "Plagiarism on essay",
    actionTaken: "Zero grade for assignment",
    status: "Appealed",
    appealId: "appeal-1", // Link to an existing appeal
  },
]

let currentAppeals: Appeal[] = [
  {
    id: "appeal-1",
    disciplinaryActionId: "case-4",
    studentId: "user-3",
    appealReason:
      "I believe there was a misunderstanding regarding the source citation. I used a different style guide.",
    evidenceLink: "https://example.com/evidence-charlie.pdf",
    appealDate: "2023-12-06",
    status: "Pending",
  },
]

// User Management Actions
export async function getUsers(): Promise<User[]> {
  return currentUsers
}

export async function getUserById(id: string): Promise<User | undefined> {
  return currentUsers.find((user) => user.id === id)
}

export async function findUserByEmailAndPassword(
  email: string,
  password: string,
  role: "admin" | "student", // Added role parameter
): Promise<User | undefined> {
  return currentUsers.find((user) => user.email === email && user.password === password && user.role === role)
}

export async function addOrUpdateUser(user: Omit<User, "id"> & { id?: string }): Promise<User> {
  if (user.id) {
    const existing = currentUsers.find((u) => u.id === user.id)
    if (existing) {
      Object.assign(existing, user)
      revalidatePath("/") // Revalidate path after data change
      return existing
    }
  }
  const newUser = { ...user, id: `user-${Date.now()}` }
  currentUsers.push(newUser)
  revalidatePath("/") // Revalidate path after data change
  return newUser
}

export async function deleteUser(id: string): Promise<void> {
  currentUsers = currentUsers.filter((user) => user.id !== id)
  currentDisciplinaryActions = currentDisciplinaryActions.filter((action) => action.studentId !== id)
  currentAppeals = currentAppeals.filter((appeal) => appeal.studentId !== id)
  revalidatePath("/") // Revalidate path after data change
}

// Disciplinary Action Management Actions
export async function getDisciplinaryActions(): Promise<DisciplinaryAction[]> {
  return currentDisciplinaryActions
}

export async function addDisciplinaryAction(action: Omit<DisciplinaryAction, "id">): Promise<DisciplinaryAction> {
  const newAction = { ...action, id: `case-${Date.now()}` }
  currentDisciplinaryActions.push(newAction)
  revalidatePath("/") // Revalidate path after data change
  return newAction
}

export async function updateDisciplinaryAction(updatedAction: DisciplinaryAction): Promise<DisciplinaryAction> {
  currentDisciplinaryActions = currentDisciplinaryActions.map((action) =>
    action.id === updatedAction.id ? updatedAction : action,
  )
  revalidatePath("/") // Revalidate path after data change
  return updatedAction
}

export async function deleteDisciplinaryAction(id: string): Promise<void> {
  currentDisciplinaryActions = currentDisciplinaryActions.filter((action) => action.id !== id)
  currentAppeals = currentAppeals.filter((appeal) => appeal.disciplinaryActionId !== id)
  revalidatePath("/") // Revalidate path after data change
}

// Appeal Management Actions
export async function getAppeals(): Promise<Appeal[]> {
  return currentAppeals
}

export async function addAppeal(appeal: Omit<Appeal, "id">): Promise<Appeal> {
  const newAppeal = { ...appeal, id: `appeal-${Date.now()}` }
  currentAppeals.push(newAppeal)
  revalidatePath("/") // Revalidate path after data change
  return newAppeal
}

export async function updateAppeal(updatedAppeal: Appeal): Promise<Appeal> {
  currentAppeals = currentAppeals.map((appeal) => (appeal.id === updatedAppeal.id ? updatedAppeal : appeal))
  revalidatePath("/") // Revalidate path after data change
  return updatedAppeal
}
