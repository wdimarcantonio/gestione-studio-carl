import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { Measurement } from '@/lib/types'

interface MeasurementsContextType {
  measurements: Measurement[]
  setMeasurements: (measurements: Measurement[] | ((prev: Measurement[]) => Measurement[])) => void
}

const MeasurementsContext = createContext<MeasurementsContextType | undefined>(undefined)

export function MeasurementsProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useKV<Measurement[]>('measurements', [])

  return (
    <MeasurementsContext.Provider
      value={{
        measurements: measurements ?? [],
        setMeasurements,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  )
}

export function useMeasurements() {
  const context = useContext(MeasurementsContext)
  if (context === undefined) {
    throw new Error('useMeasurements must be used within a MeasurementsProvider')
  }
  return context
}
