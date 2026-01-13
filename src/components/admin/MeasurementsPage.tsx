import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Measurement } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function MeasurementsPage() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [measurements, setMeasurements] = useKV<Measurement[]>('measurements', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    fatMass: '',
    leanMass: '',
    waterPercentage: '',
    notes: '',
  })

  const handleAddMeasurement = () => {
    if (!selectedPatientId || !formData.date || !formData.weight) {
      toast.error('Please select a patient and enter weight')
      return
    }

    const newMeasurement: Measurement = {
      id: `measurement-${Date.now()}`,
      patientId: selectedPatientId,
      date: formData.date,
      weight: parseFloat(formData.weight),
      fatMass: formData.fatMass ? parseFloat(formData.fatMass) : undefined,
      leanMass: formData.leanMass ? parseFloat(formData.leanMass) : undefined,
      waterPercentage: formData.waterPercentage ? parseFloat(formData.waterPercentage) : undefined,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }

    setMeasurements((current) => [...(current || []), newMeasurement])
    toast.success('Measurement added successfully')
    setDialogOpen(false)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      fatMass: '',
      leanMass: '',
      waterPercentage: '',
      notes: '',
    })
  }

  const groupedMeasurements = (measurements || []).reduce((acc, measurement) => {
    if (!acc[measurement.patientId]) {
      acc[measurement.patientId] = []
    }
    acc[measurement.patientId].push(measurement)
    return acc
  }, {} as Record<string, Measurement[]>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Measurements</h1>
          <p className="text-muted-foreground mt-2">Track patient body composition over time</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Measurement</DialogTitle>
              <DialogDescription>Record patient body composition data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {(patients || []).map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatMass">Fat Mass (kg)</Label>
                <Input
                  id="fatMass"
                  type="number"
                  step="0.1"
                  value={formData.fatMass}
                  onChange={(e) => setFormData({ ...formData, fatMass: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leanMass">Lean Mass (kg)</Label>
                <Input
                  id="leanMass"
                  type="number"
                  step="0.1"
                  value={formData.leanMass}
                  onChange={(e) => setFormData({ ...formData, leanMass: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterPercentage">Water %</Label>
                <Input
                  id="waterPercentage"
                  type="number"
                  step="0.1"
                  value={formData.waterPercentage}
                  onChange={(e) => setFormData({ ...formData, waterPercentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMeasurement}>Add Measurement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {(patients || []).map((patient) => {
          const patientMeasurements = (groupedMeasurements[patient.id] || []).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )

          if (patientMeasurements.length === 0) return null

          return (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>
                  {patient.firstName} {patient.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientMeasurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(measurement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-medium font-mono">{measurement.weight} kg</p>
                        </div>
                        {measurement.fatMass && (
                          <div>
                            <p className="text-sm text-muted-foreground">Fat Mass</p>
                            <p className="font-medium font-mono">{measurement.fatMass} kg</p>
                          </div>
                        )}
                        {measurement.leanMass && (
                          <div>
                            <p className="text-sm text-muted-foreground">Lean Mass</p>
                            <p className="font-medium font-mono">{measurement.leanMass} kg</p>
                          </div>
                        )}
                        {measurement.waterPercentage && (
                          <div>
                            <p className="text-sm text-muted-foreground">Water</p>
                            <p className="font-medium font-mono">{measurement.waterPercentage}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {Object.keys(groupedMeasurements).length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No measurements recorded yet. Add your first measurement to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
