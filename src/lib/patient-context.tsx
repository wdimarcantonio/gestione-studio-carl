import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { Patient } from '@/lib/types'

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
  clearSelectedPatient: () => void
  patients: Patient[]
  setPatients: (patients: Patient[] | ((prev: Patient[]) => Patient[])) => void
  isLoading: boolean
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatientState] = useState<Patient | null>(null)
  const [patients, setPatientsState] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedPatient, storedPatients] = await Promise.all([
          window.spark.kv.get<Patient>('selected-patient'),
          window.spark.kv.get<Patient[]>('patients')
        ])
        setSelectedPatientState(storedPatient || null)
        setPatientsState(storedPatients || [])
      } catch (error) {
        console.error('Error loading patient data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const setSelectedPatient = async (patient: Patient | null) => {
    await window.spark.kv.set('selected-patient', patient)
    setSelectedPatientState(patient)
  }

  const clearSelectedPatient = async () => {
    await window.spark.kv.delete('selected-patient')
    setSelectedPatientState(null)
  }

  const setPatients = async (patientsOrUpdater: Patient[] | ((prev: Patient[]) => Patient[])) => {
    const newPatients = typeof patientsOrUpdater === 'function' 
      ? patientsOrUpdater(patients) 
      : patientsOrUpdater
    await window.spark.kv.set('patients', newPatients)
    setPatientsState(newPatients)
  }

  return (
    <PatientContext.Provider
      value={{
        selectedPatient,
        setSelectedPatient,
        clearSelectedPatient,
        patients,
        setPatients,
        isLoading,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function useSelectedPatient() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('useSelectedPatient must be used within a PatientProvider')
  }
  return context
}

export function usePatients() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider')
  }
  return {
    patients: context.patients,
    setPatients: context.setPatients,
  }
}
