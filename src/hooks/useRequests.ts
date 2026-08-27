import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { requestService } from '@/services/requestService'
import type {
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export function useRequests(params?: RequestListParams) {
  return useQuery({
    queryKey: queryKeys.requests(params),
    queryFn: () => requestService.list(params),
    ...cacheTimes.requestList,
  })
}

export function useRequest(id: number) {
  return useQuery({
    queryKey: queryKeys.request(id),
    queryFn: () => requestService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
    ...cacheTimes.requestDetail,
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateApplicationRequest) => requestService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateApplicationRequest }) =>
      requestService.update(id, payload),
    onSuccess: (_r, vars) => {
      void qc.invalidateQueries({ queryKey: ['requests'] })
      void qc.invalidateQueries({ queryKey: queryKeys.request(vars.id) })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => requestService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => requestService.approve(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      requestService.reject(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
