import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { Measurement } from '@/lib/types'

interface MeasurementsContextType {
  measurements: Measurement[]
  setMeasurements: (measurements: Measurement[] | ((prev: Measurement[]) => Measurement[])) => void
  isLoading: boolean
}

const MeasurementsContext = createContext<MeasurementsContextType | undefined>(undefined)

export function MeasurementsProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurementsState] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMeasurements = await window.spark.kv.get<Measurement[]>('measurements')
        setMeasurementsState(storedMeasurements || [])
      } catch (error) {
        console.error('Error loading measurements:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const setMeasurements = async (measurementsOrUpdater: Measurement[] | ((prev: Measurement[]) => Measurement[])) => {
    const newMeasurements = typeof measurementsOrUpdater === 'function' 
      ? measurementsOrUpdater(measurements) 
      : measurementsOrUpdater
    await window.spark.kv.set('measurements', newMeasurements)
    setMeasurementsState(newMeasurements)
  }

  return (
    <MeasurementsContext.Provider
      value={{
        measurements,
        setMeasurements,
        isLoading,
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
