export type User = {
  id: string
  name: string
  role: "admin" | "student"
  email: string
  password?: string
}

export type DisciplinaryAction = {
  id: string
  studentId: string // Link to User ID
  studentName: string // For display convenience
  date: string
  reason: string
  actionTaken: string
  status: "Pending" | "Resolved" | "Closed" | "Appealed"
}

export const mockUsers: User[] = [
  { id: "user-1", name: "Alice Johnson", role: "student", email: "alice@example.com", password: "password" },
  { id: "user-2", name: "Bob Smith", role: "student", email: "bob@example.com", password: "password" },
  { id: "user-3", name: "Charlie Brown", role: "student", email: "charlie@example.com", password: "password" },
  { id: "user-4", name: "Admin User", role: "admin", email: "admin@example.com", password: "password" },
]

// Using a simple in-memory array for demo purposes
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
  },
]

export const getDisciplinaryActions = () => currentDisciplinaryActions
export const addDisciplinaryAction = (action: Omit<DisciplinaryAction, "id">) => {
  const newAction = { ...action, id: `case-${Date.now()}` }
  currentDisciplinaryActions.push(newAction)
  return newAction
}
export const updateDisciplinaryAction = (updatedAction: DisciplinaryAction) => {
  currentDisciplinaryActions = currentDisciplinaryActions.map((action) =>
    action.id === updatedAction.id ? updatedAction : action,
  )
  return updatedAction
}
export const deleteDisciplinaryAction = (id: string) => {
  currentDisciplinaryActions = currentDisciplinaryActions.filter((action) => action.id !== id)
}

// Simple in-memory user management for demo
let currentUsers: User[] = [...mockUsers]

export const getUsers = () => currentUsers
export const getUserById = (id: string) => currentUsers.find((user) => user.id === id) // New helper function
export const addUser = (user: Omit<User, "id">) => {
  const newUser = { ...user, id: `user-${Date.now()}` }
  currentUsers.push(newUser)
  return newUser
}
export const updateUser = (updatedUser: User) => {
  currentUsers = currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
  return updatedUser
}
export const deleteUser = (id: string) => {
  currentUsers = currentUsers.filter((user) => user.id !== id)
  // Also remove any cases associated with the deleted student
  currentDisciplinaryActions = currentDisciplinaryActions.filter((action) => action.studentId !== id)
}

export const findUserByEmailAndPassword = (email: string, password: string): User | undefined => {
  return currentUsers.find((user) => user.email === email && user.password === password)
}
