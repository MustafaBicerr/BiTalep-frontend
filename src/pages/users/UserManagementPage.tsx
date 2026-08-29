import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DepartmentBadge } from '@/components/molecules/DepartmentBadge'
import { RoleBadge } from '@/components/molecules/RoleBadge'
import { Pagination } from '@/components/molecules/Pagination'
import { EmptyState } from '@/components/molecules/EmptyState'
import { SearchInput } from '@/components/molecules/SearchInput'
import { CreatePersonnelDialog } from '@/components/organisms/CreatePersonnelDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUsers } from '@/hooks/useUsers'
import { DEPARTMENT_ORDER, Department, UserRole } from '@/types/enums'
import { formatDate } from '@/utils/formatDate'

export function UserManagementPage() {
  const { t, i18n } = useTranslation(['common'])
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<string>('all')
  const [department, setDepartment] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const params = useMemo(
    () => ({
      page,
      pageSize,
      keyword: keyword || undefined,
      role: role === 'all' ? undefined : (role as UserRole),
      department: department === 'all' ? undefined : (department as Department),
    }),
    [page, pageSize, keyword, role, department],
  )

  const { data, isLoading } = useUsers(params)

  const rows = data?.data ?? []
  const total = data?.meta?.totalItems ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{t('common:users.title')}</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          {t('common:users.add')}
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput
            value={keyword}
            onChange={(v) => {
              setKeyword(v)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common:users.role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:users.role')}</SelectItem>
            <SelectItem value={UserRole.ADMIN}>{t('common:role.admin')}</SelectItem>
            <SelectItem value={UserRole.PERSONEL}>{t('common:role.employee')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={department}
          onValueChange={(v) => {
            setDepartment(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder={t('common:department.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:department.all')}</SelectItem>
            {DEPARTMENT_ORDER.map((d) => (
              <SelectItem key={d} value={d}>
                {t(`common:department.${d}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && rows.length === 0 ? (
        <EmptyState preset="noUsers" onAction={() => setCreateOpen(true)} />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common:users.name')}</TableHead>
                  <TableHead>{t('common:users.email')}</TableHead>
                  <TableHead>{t('common:users.role')}</TableHead>
                  <TableHead>{t('common:users.department')}</TableHead>
                  <TableHead>{t('common:users.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id} interactive onClick={() => navigate(`/users/${u.id}`)}>
                    <TableCell>
                      {u.name} {u.surname}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <DepartmentBadge department={u.department} />
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

      <CreatePersonnelDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
