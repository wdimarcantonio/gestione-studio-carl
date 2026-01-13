import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth-context'
import { Patient, Measurement, Message, Document } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartLine, ChatCircleText, Folder, CalendarBlank } from '@phosphor-icons/react'
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

export function PatientDashboard() {
  const { user } = useAuth()
  const [patients] = useKV<Patient[]>('patients', [])
  const [measurements] = useKV<Measurement[]>('measurements', [])
  const [messages] = useKV<Message[]>('messages', [])
  const [documents] = useKV<Document[]>('documents', [])

  const myPatient = (patients || []).find((p) => p.email === user?.email)
  const myMeasurements = (measurements || [])
    .filter((m) => m.patientId === myPatient?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const myMessages = (messages || []).filter((m) => m.patientId === myPatient?.id)
  const myDocuments = (documents || []).filter((d) => d.patientId === myPatient?.id)
  const unreadMessages = myMessages.filter((m) => !m.read && m.direction === 'IN').length

  const chartData = myMeasurements.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    fatMass: m.fatMass || 0,
    leanMass: m.leanMass || 0,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{myPatient ? `, ${myPatient.firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">Here's your health journey overview</p>
      </div>

      {!myPatient && (
        <Card className="border-accent bg-accent/5">
          <CardContent className="py-6">
            <p className="text-sm">
              Your patient profile is being set up. Please contact your dietitian for access.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Measurements</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{myMeasurements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <ChatCircleText size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Folder size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{myDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Weight</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">
              {myMeasurements.length > 0
                ? `${myMeasurements[myMeasurements.length - 1].weight} kg`
                : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {myMeasurements.length > 0
                ? new Date(myMeasurements[myMeasurements.length - 1].date).toLocaleDateString()
                : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {myMeasurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
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
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {myMeasurements.length === 0 && myPatient && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No measurements recorded yet. Your dietitian will add your first measurement soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
