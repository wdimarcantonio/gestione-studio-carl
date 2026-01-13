import { useEffect } from 'react'
import { useSelectedPatient, usePatients } from '@/lib/patient-context'
import { Patient } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PatientSelectorProps {
  className?: string
}

export function PatientSelector({ className }: PatientSelectorProps) {
  const { selectedPatient, setSelectedPatient, clearSelectedPatient } = useSelectedPatient()
  const { patients } = usePatients()

  const patientsList = patients || []

  useEffect(() => {
    if (selectedPatient && patientsList.length > 0) {
      const patientStillExists = patientsList.find(p => p.id === selectedPatient.id)
      if (!patientStillExists) {
        clearSelectedPatient()
      }
    }
  }, [patientsList, selectedPatient, clearSelectedPatient])

  const handleValueChange = (patientId: string) => {
    const patient = patientsList.find(p => p.id === patientId)
    if (patient) {
      setSelectedPatient(patient)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearSelectedPatient()
  }

  if (patientsList.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground', className)}>
        <User size={16} />
        <span>Nessun paziente disponibile</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={selectedPatient?.id || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-64 bg-card">
          <div className="flex items-center gap-2">
            <User size={16} />
            <SelectValue placeholder="Seleziona un paziente..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {patientsList.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPatient && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-10 w-10"
          title="Cancella selezione"
        >
          <X size={20} />
        </Button>
      )}
    </div>
  )
}
