import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth-context'
import { Patient, Measurement, Message, Document } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartLine, ChatCircleText, Folder, TrendUp, TrendDown } from '@phosphor-icons/react'
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
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'

export function PatientDashboard() {
  const { user } = useAuth()
  const [patients] = useKV<Patient[]>('patients', [])
  const [measurements] = useKV<Measurement[]>('measurements', [])
  const [messages] = useKV<Message[]>('messages', [])
  const [documents] = useKV<Document[]>('documents', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const myPatient = (patients || []).find((p) => p.email === user?.email)
  const myMeasurements = (measurements || [])
    .filter((m) => m.patientId === myPatient?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const myMessages = (messages || []).filter((m) => m.patientId === myPatient?.id)
  const myDocuments = (documents || []).filter((d) => d.patientId === myPatient?.id)
  const unreadMessages = myMessages.filter((m) => !m.read && m.direction === 'IN').length

  const latestWeight = myMeasurements.length > 0 ? myMeasurements[myMeasurements.length - 1].weight : 0
  const previousWeight = myMeasurements.length > 1 ? myMeasurements[myMeasurements.length - 2].weight : latestWeight
  const weightChange = latestWeight - previousWeight
  const weightTrend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable'

  const chartData = myMeasurements.map((m) => ({
    date: new Date(m.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    fatMass: m.fatMass || 0,
    leanMass: m.leanMass || 0,
  }))

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Bentornat{myPatient && myPatient.gender === 'F' ? 'a' : 'o'}{myPatient ? `, ${myPatient.firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">Ecco una panoramica del tuo percorso di salute</p>
      </div>

      {!myPatient && (
        <Card className="border-accent bg-accent/5">
          <CardContent className="py-6">
            <p className="text-sm">
              Il tuo profilo paziente è in fase di configurazione. Contatta la tua dietista per l'accesso.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Misurazioni</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{myMeasurements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Totali registrate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
            <ChatCircleText size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Non letti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documenti</CardTitle>
            <Folder size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{myDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Disponibili</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Peso</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">
              {myMeasurements.length > 0
                ? `${myMeasurements[myMeasurements.length - 1].weight} kg`
                : '--'}
            </div>
            {myMeasurements.length > 1 && (
              <div className="flex items-center gap-2 mt-1">
                {weightTrend === 'up' && (
                  <>
                    <TrendUp size={16} className="text-accent" />
                    <p className="text-xs text-accent">+{Math.abs(weightChange).toFixed(1)} kg</p>
                  </>
                )}
                {weightTrend === 'down' && (
                  <>
                    <TrendDown size={16} className="text-primary" />
                    <p className="text-xs text-primary">-{Math.abs(weightChange).toFixed(1)} kg</p>
                  </>
                )}
                {weightTrend === 'stable' && (
                  <p className="text-xs text-muted-foreground">Nessun cambiamento</p>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {myMeasurements.length > 0
                ? new Date(myMeasurements[myMeasurements.length - 1].date).toLocaleDateString('it-IT')
                : 'Nessun dato'}
            </p>
          </CardContent>
        </Card>
      </div>

      {myMeasurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progressi Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                  name="Peso (kg)"
                  dot={{ fill: 'oklch(0.50 0.12 200)' }}
                />
                {chartData.some((d) => d.fatMass > 0) && (
                  <Line
                    type="monotone"
                    dataKey="fatMass"
                    stroke="oklch(0.68 0.18 25)"
                    strokeWidth={2}
                    name="Massa Grassa (kg)"
                    dot={{ fill: 'oklch(0.68 0.18 25)' }}
                  />
                )}
                {chartData.some((d) => d.leanMass > 0) && (
                  <Line
                    type="monotone"
                    dataKey="leanMass"
                    stroke="oklch(0.70 0.08 220)"
                    strokeWidth={2}
                    name="Massa Magra (kg)"
                    dot={{ fill: 'oklch(0.70 0.08 220)' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {myMeasurements.length === 0 && myPatient && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Nessuna misurazione registrata ancora. La tua dietista aggiungerà presto la prima misurazione.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
