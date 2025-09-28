import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function TournamentCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full bg-gray-700" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 bg-gray-700" />
            <Skeleton className="h-4 w-16 bg-gray-700" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 bg-gray-700" />
            <Skeleton className="h-4 w-12 bg-gray-700" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20 bg-gray-700" />
            <Skeleton className="h-4 w-24 bg-gray-700" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 bg-gray-700" />
            <Skeleton className="h-4 w-14 bg-gray-700" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full bg-gray-700" />
      </CardFooter>
    </Card>
  )
}

export function TournamentListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <TournamentCardSkeleton key={i} />
      ))}
    </div>
  )
}