import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient } from '@/lib/types'

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
  clearSelectedPatient: () => void
  patients: Patient[]
  setPatients: (patients: Patient[] | ((prev: Patient[]) => Patient[])) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useKV<Patient | null>('selected-patient', null)
  const [patients, setPatients] = useKV<Patient[]>('patients', [])

  const clearSelectedPatient = () => {
    setSelectedPatient(null)
  }

  return (
    <PatientContext.Provider
      value={{
        selectedPatient: selectedPatient ?? null,
        setSelectedPatient,
        clearSelectedPatient,
        patients: patients ?? [],
        setPatients,
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
