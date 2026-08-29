import { useQuery } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { companyService } from '@/services/companyService'

export function useCompany() {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: () => companyService.getCurrent(),
    ...cacheTimes.userProfile,
  })
}
