import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RoleBadge } from '@/components/molecules/RoleBadge'
import { Pagination } from '@/components/molecules/Pagination'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUsers } from '@/hooks/useUsers'
import { formatDate } from '@/utils/formatDate'

export function UserManagementPage() {
  const { t, i18n } = useTranslation(['common', 'admin'])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useUsers({ page, pageSize })

  const rows = data?.data ?? []
  const total = data?.meta?.totalItems ?? 0

  return (
    <div className="space-y-4">
      <h1 className="text-h1">{t('common:users.title')}</h1>
      {!isLoading && rows.length === 0 ? (
        <EmptyState preset="noUsers" />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common:users.name')}</TableHead>
                  <TableHead>{t('common:users.email')}</TableHead>
                  <TableHead>{t('common:users.role')}</TableHead>
                  <TableHead>{t('common:users.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      {u.name} {u.surname}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>{formatDate(u.createdDate, i18n.language)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s)
              setPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}
