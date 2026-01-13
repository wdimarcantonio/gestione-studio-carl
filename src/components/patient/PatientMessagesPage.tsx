import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth-context'
import { Patient, Message, MessageChannel } from '@/lib/types'
import { Button } from '@/components/ui/button'
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
import { Plus, ChatCircle, Envelope, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function PatientMessagesPage() {
  const { user } = useAuth()
  const [patients] = useKV<Patient[]>('patients', [])
  const [messages, setMessages] = useKV<Message[]>('messages', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<MessageChannel | 'ALL'>('ALL')
  const [messageBody, setMessageBody] = useState('')

  const myPatient = (patients || []).find((p) => p.email === user?.email)
  const myMessages = (messages || [])
    .filter((msg) => msg.patientId === myPatient?.id)
    .filter((msg) => activeChannel === 'ALL' || msg.channel === activeChannel)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleSendMessage = () => {
    if (!messageBody.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!myPatient) {
      toast.error('Patient profile not found')
      return
    }

    const newMessage: Message = {
      id: `message-${Date.now()}`,
      patientId: myPatient.id,
      senderId: user!.id,
      senderName: `${myPatient.firstName} ${myPatient.lastName}`,
      recipientId: 'admin',
      recipientName: 'Your Dietitian',
      channel: 'INTERNAL',
      direction: 'OUT',
      body: messageBody,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setMessages((current) => [...(current || []), newMessage])
    toast.success('Message sent successfully')
    setDialogOpen(false)
    setMessageBody('')
  }

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
          <p className="text-muted-foreground mt-2">Communicate with your dietitian</p>
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
              <DialogTitle>Send Message to Dietitian</DialogTitle>
              <DialogDescription>Send an internal message to your dietitian</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                rows={5}
                placeholder="Type your message here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
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
              <CardTitle>Message History ({myMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {myMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No messages yet. Send your first message to your dietitian!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.direction === 'OUT'
                          ? 'bg-primary/10 ml-12'
                          : 'bg-muted/50 mr-12'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getChannelIcon(message.channel)}
                            <span className="font-medium">
                              {message.direction === 'OUT' ? 'You' : message.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {message.subject && (
                            <p className="font-medium mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm">{message.body}</p>
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
