import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { fileService } from '@/services/fileService'

export function useFiles(applicationId?: string) {
  return useQuery({
    queryKey: queryKeys.files(applicationId),
    queryFn: () =>
      applicationId != null
        ? fileService.getFilesByRequest(applicationId)
        : fileService.list(),
    enabled: applicationId == null || Boolean(applicationId),
    staleTime: 60_000,
  })
}

export function useUploadFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, applicationId }: { file: File; applicationId: string }) =>
      fileService.upload(file, applicationId),
    onSuccess: (_r, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.files(vars.applicationId) })
      void qc.invalidateQueries({ queryKey: queryKeys.request(vars.applicationId) })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fileService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['files'] })
      void qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
