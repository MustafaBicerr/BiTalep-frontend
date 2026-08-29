import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FileTypeIcon } from '@/components/molecules/FileTypeIcon'
import { ListSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useFiles, useUploadFile } from '@/hooks/useFiles'
import { useRequests } from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types/enums'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'
import { interactiveTextLink } from '@/utils/interactive'
import { isPersonnelMutable } from '@/utils/requestAccess'

export function FilesPage() {
  const { t, i18n } = useTranslation(['nav', 'common', 'requests'])
  const { data, isLoading } = useFiles()
  const upload = useUploadFile()
  const role = useAuthStore((s) => s.user?.role)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const requests = useRequests({ page: 1, pageSize: 50 }, { enabled: pickerOpen })
  const options = useMemo(() => {
    const rows = requests.data?.data ?? []
    if (role === UserRole.ADMIN) return rows
    return rows.filter((r) => isPersonnelMutable(r.status))
  }, [requests.data, role])

  const submitUpload = async () => {
    if (!selectedId || !file) {
      toast.error(t('common:toast.error.generic'))
      return
    }
    const selected = options.find((r) => r.id === selectedId)
    if (role !== UserRole.ADMIN && selected && !isPersonnelMutable(selected.status)) {
      toast.error(t(`requests:${selected.status === 'IN_REVIEW' ? 'lockInReview' : 'cannotEdit'}`))
      return
    }
    try {
      await upload.mutateAsync({ file, applicationId: selectedId })
      toast.success(t('common:toast.success.saved'))
      setPickerOpen(false)
      setFile(null)
      setSelectedId('')
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <ListSkeleton rows={6} cols={3} />
      </div>
    )
  }

  const files = data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{t('nav:myFiles')}</h1>
        <Button type="button" onClick={() => setPickerOpen((v) => !v)}>
          {t('common:empty.noFiles.action')}
        </Button>
      </div>

      {pickerOpen ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger aria-label={t('requests:title')}>
              <SelectValue placeholder={t('requests:title')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button type="button" disabled={upload.isPending} onClick={() => void submitUpload()}>
            {t('common:empty.noFiles.action')}
          </Button>
        </div>
      ) : null}

      {files.length === 0 ? (
        <EmptyState preset="noFiles" onAction={() => setPickerOpen(true)} />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <FileTypeIcon mimeType={f.mimeType} fileName={f.originalName} />
                <div>
                  <p className="text-sm font-medium">{f.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(f.fileSize / 1024).toFixed(1)} KB · {formatDateTime(f.uploadDate, i18n.language)}
                  </p>
                </div>
              </div>
              <Link className={cn('text-sm text-primary', interactiveTextLink)} to={`/requests/${f.applicationId}`}>
                #{f.applicationId}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
