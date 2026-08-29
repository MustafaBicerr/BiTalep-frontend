import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FileTypeIcon } from '@/components/molecules/FileTypeIcon'
import { ListSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Skeleton } from '@/components/ui/skeleton'
import { useFiles } from '@/hooks/useFiles'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'
import { interactiveTextLink } from '@/utils/interactive'

export function FilesPage() {
  const { t, i18n } = useTranslation(['nav', 'common'])
  const { data, isLoading } = useFiles()

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
      <h1 className="text-h1">{t('nav:myFiles')}</h1>
      {files.length === 0 ? (
        <EmptyState preset="noFiles" onAction={() => undefined} />
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
