import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth-context'
import { Patient, Document } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilePdf, FileText, File, Download } from '@phosphor-icons/react'
import { DocumentsSkeleton } from '@/components/skeletons/DocumentsSkeleton'

export function PatientDocumentsPage() {
  const { user } = useAuth()
  const [patients] = useKV<Patient[]>('patients', [])
  const [documents] = useKV<Document[]>('documents', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  const myPatient = (patients || []).find((p) => p.email === user?.email)
  const myDocuments = (documents || [])
    .filter((d) => d.patientId === myPatient?.id)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

  const groupedByCategory = myDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return <FilePdf size={24} className="text-destructive" />
    if (contentType.includes('text')) return <FileText size={24} className="text-primary" />
    return <File size={24} className="text-muted-foreground" />
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.dataUrl
    link.download = doc.name
    link.click()
  }

  if (isLoading) {
    return <DocumentsSkeleton />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Documenti</h1>
        <p className="text-muted-foreground mt-2">Accedi ai tuoi piani alimentari e documenti medici</p>
      </div>

      {myDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Nessun documento disponibile ancora. La tua dietista condividerà qui i documenti con te.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {getFileIcon(doc.contentType)}
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{(doc.size / 1024).toFixed(0)} KB</span>
                            <span>
                              Caricato il {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download size={16} />
                        Scarica
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
