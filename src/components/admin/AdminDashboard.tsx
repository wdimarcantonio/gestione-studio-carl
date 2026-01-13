import { useKV } from '@github/spark/hooks'
import { Patient, Measurement, Message } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersThree, ChartLine, ChatCircleText, CalendarBlank } from '@phosphor-icons/react'

export function AdminDashboard() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [measurements] = useKV<Measurement[]>('measurements', [])
  const [messages] = useKV<Message[]>('messages', [])

  const recentPatients = patients?.slice(-5).reverse() || []
  const todayMeasurements = measurements?.filter(
    (m) => new Date(m.date).toDateString() === new Date().toDateString()
  ).length || 0
  const unreadMessages = messages?.filter((m) => !m.read && m.direction === 'IN').length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your practice overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UsersThree size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Measurements</CardTitle>
            <ChartLine size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{todayMeasurements}</div>
            <p className="text-xs text-muted-foreground mt-1">Logged today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <ChatCircleText size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarBlank size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono">0</div>
            <p className="text-xs text-muted-foreground mt-1">Appointments scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patients yet. Add your first patient to get started.</p>
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
