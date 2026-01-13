import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Skeleton className="h-9 w-64 skeleton-shimmer" />
        <Skeleton className="h-5 w-96 mt-2 skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32 skeleton-shimmer" />
              <Skeleton className="h-5 w-5 rounded-full skeleton-shimmer" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16 mb-2 skeleton-shimmer" />
              <Skeleton className="h-4 w-28 skeleton-shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 skeleton-shimmer" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full skeleton-shimmer" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-56 skeleton-shimmer" />
            <Skeleton className="h-6 w-20 rounded-full skeleton-shimmer" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32 skeleton-shimmer" />
                  <Skeleton className="h-4 w-16 skeleton-shimmer" />
                </div>
                <Skeleton className="h-2 w-full rounded-full skeleton-shimmer" />
              </div>
              
              <div className="pt-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36 skeleton-shimmer" />
                    <Skeleton className="h-4 w-12 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 skeleton-shimmer" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 skeleton-shimmer" />
                  <Skeleton className="h-4 w-64 skeleton-shimmer" />
                </div>
                <Skeleton className="h-4 w-24 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
