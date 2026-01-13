import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Message, MessageChannel } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, ChatCircle, Envelope, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AdminMessagesPage() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [messages, setMessages] = useKV<Message[]>('messages', [])
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<MessageChannel | 'ALL'>('ALL')

  const [formData, setFormData] = useState({
    patientId: '',
    channel: 'INTERNAL' as MessageChannel,
    subject: '',
    body: '',
  })

  const handleSendMessage = () => {
    if (!formData.patientId || !formData.body) {
      toast.error('Please select a patient and enter a message')
      return
    }

    const patient = patients?.find((p) => p.id === formData.patientId)
    if (!patient) return

    const newMessage: Message = {
      id: `message-${Date.now()}`,
      patientId: formData.patientId,
      senderId: user!.id,
      senderName: user!.name,
      recipientId: formData.patientId,
      recipientName: `${patient.firstName} ${patient.lastName}`,
      channel: formData.channel,
      direction: 'OUT',
      subject: formData.subject,
      body: formData.body,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setMessages((current) => [...(current || []), newMessage])
    toast.success('Message sent successfully')
    setDialogOpen(false)
    setFormData({
      patientId: '',
      channel: 'INTERNAL',
      subject: '',
      body: '',
    })
  }

  const filteredMessages = (messages || [])
    .filter((msg) => activeChannel === 'ALL' || msg.channel === activeChannel)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getChannelIcon = (channel: MessageChannel) => {
    switch (channel) {
      case 'INTERNAL':
        return <ChatCircle size={16} />
      case 'EMAIL':
        return <Envelope size={16} />
      case 'WHATSAPP':
        return <WhatsappLogo size={16} />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-2">Unified communication hub</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>Send a message to a patient</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                >
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
                <Label htmlFor="channel">Channel *</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value: MessageChannel) =>
                    setFormData({ ...formData, channel: value })
                  }
                >
                  <SelectTrigger id="channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL">Internal Chat</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.channel === 'EMAIL' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  rows={5}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>Send Message</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as MessageChannel | 'ALL')}>
        <TabsList>
          <TabsTrigger value="ALL">All Messages</TabsTrigger>
          <TabsTrigger value="INTERNAL" className="gap-2">
            <ChatCircle size={16} />
            Internal
          </TabsTrigger>
          <TabsTrigger value="EMAIL" className="gap-2">
            <Envelope size={16} />
            Email
          </TabsTrigger>
          <TabsTrigger value="WHATSAPP" className="gap-2">
            <WhatsappLogo size={16} />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeChannel} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Message History ({filteredMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getChannelIcon(message.channel)}
                            <span className="font-medium">
                              {message.direction === 'OUT' ? 'To' : 'From'}: {message.recipientName}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                message.direction === 'OUT'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-accent/10 text-accent'
                              }`}
                            >
                              {message.direction === 'OUT' ? 'Sent' : 'Received'}
                            </span>
                          </div>
                          {message.subject && (
                            <p className="font-medium mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{message.body}</p>
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
