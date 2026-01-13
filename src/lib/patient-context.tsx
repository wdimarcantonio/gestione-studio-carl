import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient } from '@/lib/types'

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
  clearSelectedPatient: () => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useKV<Patient | null>('selected-patient', null)

  const clearSelectedPatient = () => {
    setSelectedPatient(null)
  }

  return (
    <PatientContext.Provider
      value={{
        selectedPatient: selectedPatient ?? null,
        setSelectedPatient,
        clearSelectedPatient,
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
