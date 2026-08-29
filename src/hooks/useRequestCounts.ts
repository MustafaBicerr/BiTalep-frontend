import { useQueries } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { requestService } from '@/services/requestService'
import type { RequestListParams } from '@/types/request.types'

export type CountBuckets = Record<string, Omit<RequestListParams, 'page' | 'pageSize'>>

/**
 * Counts without transferring rows: one `pageSize: 1` list request per bucket,
 * where `meta.totalItems` is the answer. Cheaper and more honest than counting
 * the pages an infinite list happens to have loaded.
 */
export function useRequestCounts<T extends CountBuckets>(
  buckets: T,
  options?: { enabled?: boolean },
): Record<keyof T, number> {
  const keys = Object.keys(buckets) as Array<keyof T & string>

  const results = useQueries({
    queries: keys.map((key) => {
      const params = { ...buckets[key], page: 1, pageSize: 1 }
      return {
        queryKey: queryKeys.requests(params),
        queryFn: () => requestService.list(params),
        enabled: options?.enabled ?? true,
        ...cacheTimes.requestList,
      }
    }),
  })

  return keys.reduce(
    (acc, key, index) => {
      acc[key] = results[index]?.data?.meta?.totalItems ?? 0
      return acc
    },
    {} as Record<keyof T, number>,
  )
}
