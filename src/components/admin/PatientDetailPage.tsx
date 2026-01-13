import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKV } from '@github/spark/hooks'
import { Message, Document } from '@/lib/types'
import { usePatients } from '@/lib/patient-context'
import { useMeasurements } from '@/lib/measurements-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, ChartLine, ChatCircleText, Folder } from '@phosphor-icons/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { PatientDetailSkeleton } from '@/components/skeletons/PatientDetailSkeleton'

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { patients } = usePatients()
  const { measurements } = useMeasurements()
  const [messages] = useKV<Message[]>('messages', [])
  const [documents] = useKV<Document[]>('documents', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  const patient = (patients || []).find((p) => p.id === patientId)
  const patientMeasurements = (measurements || [])
    .filter((m) => m.patientId === patientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const patientMessages = (messages || []).filter((m) => m.patientId === patientId)
  const patientDocuments = (documents || []).filter((d) => d.patientId === patientId)

  const chartData = patientMeasurements.map((m) => ({
    date: new Date(m.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    fatMass: m.fatMass || 0,
    leanMass: m.leanMass || 0,
    waterPercentage: m.waterPercentage || 0,
  }))

  if (isLoading) {
    return <PatientDetailSkeleton />
  }

  if (!patient) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate('/admin/patients')}>
          <ArrowLeft size={20} className="mr-2" />
          Torna ai Pazienti
        </Button>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Paziente non trovato</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/patients')}>
          <ArrowLeft size={20} className="mr-2" />
          Indietro
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="flex gap-3 mt-2">
            <Badge variant="outline">{patient.gender}</Badge>
            {patient.dateOfBirth && (
              <Badge variant="outline">{calculateAge(patient.dateOfBirth)} anni</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Misurazioni</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{patientMeasurements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Totali registrate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
            <ChatCircleText size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{patientMessages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Totali scambiati</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documenti</CardTitle>
            <Folder size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{patientDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Shared files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Weight</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">
              {patientMeasurements.length > 0
                ? `${patientMeasurements[patientMeasurements.length - 1].weight} kg`
                : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patientMeasurements.length > 0
                ? new Date(patientMeasurements[patientMeasurements.length - 1].date).toLocaleDateString()
                : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <User size={16} />
            Information
          </TabsTrigger>
          <TabsTrigger value="measurements" className="gap-2">
            <ChartLine size={16} />
            Measurements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                {patient.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {patient.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
                {patient.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{patient.city}</p>
                  </div>
                )}
                {patient.postalCode && (
                  <div>
                    <p className="text-sm text-muted-foreground">Postal Code</p>
                    <p className="font-medium">{patient.postalCode}</p>
                  </div>
                )}
                {patient.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{patient.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          {patientMeasurements.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Weight & Body Composition Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                    <XAxis dataKey="date" stroke="oklch(0.50 0 0)" />
                    <YAxis stroke="oklch(0.50 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.90 0 0)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="oklch(0.50 0.12 200)"
                      strokeWidth={2}
                      name="Weight (kg)"
                      dot={{ fill: 'oklch(0.50 0.12 200)' }}
                    />
                    {chartData.some((d) => d.fatMass > 0) && (
                      <Line
                        type="monotone"
                        dataKey="fatMass"
                        stroke="oklch(0.68 0.18 25)"
                        strokeWidth={2}
                        name="Fat Mass (kg)"
                        dot={{ fill: 'oklch(0.68 0.18 25)' }}
                      />
                    )}
                    {chartData.some((d) => d.leanMass > 0) && (
                      <Line
                        type="monotone"
                        dataKey="leanMass"
                        stroke="oklch(0.70 0.08 220)"
                        strokeWidth={2}
                        name="Lean Mass (kg)"
                        dot={{ fill: 'oklch(0.70 0.08 220)' }}
                      />
                    )}
                    {chartData.some((d) => d.waterPercentage > 0) && (
                      <Line
                        type="monotone"
                        dataKey="waterPercentage"
                        stroke="oklch(0.60 0.15 240)"
                        strokeWidth={2}
                        name="Water %"
                        dot={{ fill: 'oklch(0.60 0.15 240)' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6">
                  <h3 className="font-medium mb-4">Measurement History</h3>
                  <div className="space-y-3">
                    {patientMeasurements
                      .slice()
                      .reverse()
                      .map((measurement) => (
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
                                <p className="font-medium font-mono">
                                  {measurement.waterPercentage}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No measurements recorded yet for this patient.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
