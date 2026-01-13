import { Card, CardContent, CardHeader } from '@/components/ui/card'


export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      </div
      <div className="grid grid-cols-1 md
          <Card key={i}>
            

              <Skeleton className="h-9 w-16 mb-2 skeleton-shimmer" />
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
          </

          <CardHeader className="flex flex-row items-center j
            <S
          <CardContent
              <div>
                  <Skel
                </div>
              </div>
              <div class
               

              
            </div>
        </Card>

        <CardHeader>
        </CardHeader>
          <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 rounded
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64 ske
                <Skele
            ))}
        </CardConten
    </div>
}




















                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
