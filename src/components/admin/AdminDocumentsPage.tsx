import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Document } from '@/lib/types'
import { useSelectedPatient } from '@/lib/patient-context'
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
import { Plus, FilePdf, FileText, File, Download } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AdminDocumentsPage() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const { selectedPatient } = useSelectedPatient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    category: 'Diet Plan',
    description: '',
  })

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patientId: selectedPatient.id }))
    }
  }, [selectedPatient])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    if (!formData.patientId) {
      toast.error('Please select a patient first')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const newDocument: Document = {
        id: `document-${Date.now()}`,
        patientId: formData.patientId,
        name: formData.name || file.name,
        category: formData.category,
        description: formData.description,
        uploadDate: new Date().toISOString(),
        size: file.size,
        contentType: file.type,
        dataUrl: reader.result as string,
      }

      setDocuments((current) => [...(current || []), newDocument])
      toast.success('Document uploaded successfully')
      setDialogOpen(false)
      setFormData({
        patientId: '',
        name: '',
        category: 'Diet Plan',
        description: '',
      })
    }
    reader.readAsDataURL(file)
  }

  const groupedDocuments = (documents || []).reduce((acc, doc) => {
    if (!acc[doc.patientId]) {
      acc[doc.patientId] = []
    }
    acc[doc.patientId].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const patientsToShow = selectedPatient 
    ? (patients || []).filter(p => p.id === selectedPatient.id)
    : (patients || [])

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return <FilePdf size={20} className="text-destructive" />
    if (contentType.includes('text')) return <FileText size={20} className="text-primary" />
    return <File size={20} className="text-muted-foreground" />
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.dataUrl
    link.download = doc.name
    link.click()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">Manage patient documents and files</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a document for a patient</DialogDescription>
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
                <Label htmlFor="name">Document Name</Label>
                <Input
                  id="name"
                  placeholder="Leave empty to use filename"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diet Plan">Diet Plan</SelectItem>
                    <SelectItem value="Lab Results">Lab Results</SelectItem>
                    <SelectItem value="Medical Report">Medical Report</SelectItem>
                    <SelectItem value="Educational Material">Educational Material</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {patientsToShow.map((patient) => {
          const patientDocuments = groupedDocuments[patient.id] || []

          if (patientDocuments.length === 0) return null

          return (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>
                  {patient.firstName} {patient.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(doc.contentType)}
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{doc.category}</span>
                            <span>{(doc.size / 1024).toFixed(0)} KB</span>
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {Object.keys(groupedDocuments).length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No documents uploaded yet. Upload your first document to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
