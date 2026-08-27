import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FileTypeIcon } from '@/components/molecules/FileTypeIcon'
import { Spinner } from '@/components/atoms/Spinner'
import { useFiles } from '@/hooks/useFiles'
import { formatDateTime } from '@/utils/formatDate'

export function FilesPage() {
  const { t, i18n } = useTranslation(['nav', 'common'])
  const { data, isLoading } = useFiles()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
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
              <Link className="text-sm text-primary hover:underline" to={`/requests/${f.applicationId}`}>
                #{f.applicationId}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
