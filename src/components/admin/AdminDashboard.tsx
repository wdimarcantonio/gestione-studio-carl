import { useKV } from '@github/spark/hooks'
import { Patient, Measurement, Message } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsersThree, ChartLine, ChatCircleText, CalendarBlank, TrendUp } from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function AdminDashboard() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [measurements] = useKV<Measurement[]>('measurements', [])
  const [messages] = useKV<Message[]>('messages', [])

  const recentPatients = patients?.slice(-5).reverse() || []
  const todayMeasurements = measurements?.filter(
    (m) => new Date(m.date).toDateString() === new Date().toDateString()
  ).length || 0
  const unreadMessages = messages?.filter((m) => !m.read && m.direction === 'IN').length || 0

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const measurementsChartData = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
    count: (measurements || []).filter((m) => m.date === date).length,
  }))

  const thisWeekMeasurements = (measurements || []).filter((m) => {
    const measurementDate = new Date(m.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return measurementDate >= weekAgo
  }).length

  const patientsWithRecentActivity = (patients || []).filter((patient) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const hasRecentMeasurement = (measurements || []).some(
      (m) => m.patientId === patient.id && new Date(m.date) >= weekAgo
    )
    const hasRecentMessage = (messages || []).some(
      (m) => m.patientId === patient.id && new Date(m.timestamp) >= weekAgo
    )
    
    return hasRecentMeasurement || hasRecentMessage
  }).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pannello</h1>
        <p className="text-muted-foreground mt-2">Bentornata! Ecco una panoramica del tuo studio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pazienti Totali</CardTitle>
            <UsersThree size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Attivi nel sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Misurazioni di Oggi</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{todayMeasurements}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrate oggi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi Non Letti</CardTitle>
            <ChatCircleText size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">In attesa di risposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questa Settimana</CardTitle>
            <TrendUp size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{thisWeekMeasurements}</div>
            <p className="text-xs text-muted-foreground mt-1">Misurazioni registrate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attività Settimanale</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={measurementsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                <XAxis dataKey="date" stroke="oklch(0.50 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0 0)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.90 0 0)',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.50 0.12 200)"
                  radius={[8, 8, 0, 0]}
                  name="Misurazioni"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attività Pazienti (Ultimi 7 Giorni)</CardTitle>
            <Badge variant="outline">{patientsWithRecentActivity} attivi</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pazienti Attivi</span>
                  <span className="text-sm text-muted-foreground">
                    {patientsWithRecentActivity} / {patients?.length || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        patients?.length
                          ? (patientsWithRecentActivity / patients.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pazienti Totali</span>
                  <span className="font-medium font-mono">{patients?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Misurazioni Totali</span>
                  <span className="font-medium font-mono">{measurements?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Messaggi Totali</span>
                  <span className="font-medium font-mono">{messages?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pazienti Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun paziente ancora. Aggiungi il tuo primo paziente per iniziare.</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
