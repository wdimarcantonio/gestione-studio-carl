export type UserRole = 'ADMIN' | 'PATIENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'OTHER'
  address?: string
  city?: string
  postalCode?: string
  notes?: string
  createdAt: string
  userId: string
}

export interface Measurement {
  id: string
  patientId: string
  date: string
  weight: number
  fatMass?: number
  leanMass?: number
  waterPercentage?: number
  notes?: string
  createdAt: string
}

export type MessageChannel = 'INTERNAL' | 'EMAIL' | 'WHATSAPP'
export type MessageDirection = 'IN' | 'OUT'

export interface Message {
  id: string
  patientId: string
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  channel: MessageChannel
  direction: MessageDirection
  subject?: string
  body: string
  timestamp: string
  read: boolean
}

export interface Document {
  id: string
  patientId: string
  name: string
  category: string
  description?: string
  uploadDate: string
  size: number
  contentType: string
  dataUrl: string
}

export interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  type: string
  notes?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}
