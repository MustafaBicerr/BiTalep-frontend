import { Mail } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormField } from '@/components/molecules/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InviteEmailPreviewDialog } from '@/components/organisms/InviteEmailPreviewDialog'
import { useCreateUser } from '@/hooks/useUser'
import { mockMailer } from '@/mock/engine/MockMailer'
import type { SentInvite } from '@/emails/personnelInvite'
import { ApiError } from '@/types/api.types'
import { DEPARTMENT_ORDER, Department, UserRole } from '@/types/enums'
import { cn } from '@/utils/cn'
import {
  buildPersonnelLookups,
  downloadPersonnelTemplate,
  parsePersonnelWorkbook,
  type PersonnelImportError,
} from '@/utils/personnelExcel'

type ImportStage = 'reading' | 'read' | 'processing' | 'processed' | 'done'

interface CreatePersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STAGE_PERCENT: Record<ImportStage, number> = {
  reading: 12,
  read: 28,
  processing: 55,
  processed: 88,
  done: 100,
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function CreatePersonnelDialog({ open, onOpenChange }: CreatePersonnelDialogProps) {
  const { t } = useTranslation(['common', 'forms'])
  const createUser = useCreateUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [stage, setStage] = useState<ImportStage>('reading')
  const [percent, setPercent] = useState(0)
  const [rowErrors, setRowErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<SentInvite | null>(null)

  const schema = z.object({
    name: z.string().min(1, t('forms:validation.required')),
    surname: z.string().min(1, t('forms:validation.required')),
    email: z.string().email(t('forms:validation.email')),
    role: z.nativeEnum(UserRole),
    department: z.nativeEnum(Department),
  })
  type Values = z.infer<typeof schema>

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      role: UserRole.PERSONEL,
      department: Department.OTHER,
    },
  })

  const close = (next: boolean, force = false) => {
    if (importing && !force) return
    onOpenChange(next)
    if (!next) {
      form.reset()
      setRowErrors([])
    }
  }

  const lookups = () =>
    buildPersonnelLookups({
      roleAdmin: t('common:role.admin'),
      roleEmployee: t('common:role.employee'),
      departments: Object.fromEntries(
        DEPARTMENT_ORDER.map((d) => [d, t(`common:department.${d}`)]),
      ) as Record<Department, string>,
    })

  const mapCreateError = (err: unknown, row?: number): string | null => {
    if (err instanceof ApiError && err.status === 409) {
      const message = t('common:users.import.emailTaken')
      return row != null ? t('common:users.import.rowError', { row, message }) : message
    }
    return null
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUser.mutateAsync(values)
      toast.success(t('common:users.invite.sent'))
      setPreview(mockMailer.getLastInvite() ?? null)
      close(false)
    } catch (err) {
      const taken = mapCreateError(err)
      if (taken) {
        form.setError('email', { message: taken })
        toast.error(taken)
        return
      }
      toast.error(t('common:toast.error.generic'))
    }
  })

  const downloadTemplate = async () => {
    await downloadPersonnelTemplate({
      filename: t('common:users.import.filename'),
      sheetData: t('common:users.import.sheetData'),
      sheetGuide: t('common:users.import.sheetGuide'),
      columns: [
        t('common:users.import.colName'),
        t('common:users.import.colSurname'),
        t('common:users.import.colEmail'),
        t('common:users.import.colRole'),
        t('common:users.import.colDepartment'),
      ],
      guideHeaders: [
        t('common:users.import.guideField'),
        t('common:users.import.guideCode'),
        t('common:users.import.guideLabel'),
      ],
      guideRows: [
        [t('common:users.role'), UserRole.PERSONEL, t('common:role.employee')],
        [t('common:users.role'), UserRole.ADMIN, t('common:role.admin')],
        ...DEPARTMENT_ORDER.map(
          (d) =>
            [t('common:users.department'), d, t(`common:department.${d}`)] as [
              string,
              string,
              string,
            ],
        ),
      ],
    })
  }

  const formatParseError = (error: PersonnelImportError) =>
    t('common:users.import.rowError', {
      row: error.row,
      message: t(`common:users.import.${error.code}`),
    })

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setImporting(true)
    setRowErrors([])
    setStage('reading')
    setPercent(STAGE_PERCENT.reading)
    try {
      await wait(280)
      const buffer = await file.arrayBuffer()
      setStage('read')
      setPercent(STAGE_PERCENT.read)
      await wait(280)

      const parsed = await parsePersonnelWorkbook(buffer, lookups())
      const messages = parsed.errors.map(formatParseError)

      if (parsed.rows.length === 0 && parsed.errors.length === 0) {
        toast.error(t('common:users.import.emptyFile'))
        return
      }

      setStage('processing')
      let created = 0
      for (let i = 0; i < parsed.rows.length; i += 1) {
        const row = parsed.rows[i]
        if (!row) continue
        setPercent(40 + Math.round(((i + 1) / parsed.rows.length) * 45))
        try {
          await createUser.mutateAsync({
            name: row.name,
            surname: row.surname,
            email: row.email,
            role: row.role,
            department: row.department,
          })
          created += 1
        } catch (err) {
              messages.push(
                mapCreateError(err, row.rowNumber) ??
                  t('common:users.import.rowError', {
                    row: row.rowNumber,
                    message: t('common:toast.error.generic'),
                  }),
              )
        }
      }

      setStage('processed')
      setPercent(STAGE_PERCENT.processed)
      await wait(280)
      setStage('done')
      setPercent(STAGE_PERCENT.done)
      await wait(420)

      setRowErrors(messages)
      if (created > 0) toast.success(t('common:users.invite.sentMany', { count: created }))
      if (messages.length > 0) toast.error(t('common:users.import.summaryFail', { count: messages.length }))
      if (created > 0 && messages.length === 0) close(false, true)
    } catch {
      toast.error(t('common:toast.error.generic'))
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex h-[85vh] w-full max-w-[960px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-4">
          <DialogTitle>{t('common:users.addTitle')}</DialogTitle>
          <DialogDescription>{t('common:users.addDescription')}</DialogDescription>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void downloadTemplate()}>
              {t('common:users.import.template')}
            </Button>
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              {t('common:users.import.upload')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              aria-label={t('common:users.import.upload')}
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </div>

          <form id="create-personnel-form" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
            <div
              className="sm:col-span-2 rounded-lg border border-primary/30 bg-primary-subtle px-4 py-3"
              role="note"
            >
              <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {t('common:users.invite.notice')}
              </p>
            </div>
            <FormField
              id="personnel-name"
              label={t('common:users.firstName')}
              required
              error={form.formState.errors.name?.message}
            >
              <Input {...form.register('name')} autoComplete="given-name" />
            </FormField>
            <FormField
              id="personnel-surname"
              label={t('common:users.lastName')}
              required
              error={form.formState.errors.surname?.message}
            >
              <Input {...form.register('surname')} autoComplete="family-name" />
            </FormField>
            <FormField
              id="personnel-email"
              label={t('common:users.email')}
              required
              error={form.formState.errors.email?.message}
              className="sm:col-span-2"
            >
              <Input type="email" autoComplete="email" {...form.register('email')} />
            </FormField>
            <FormField id="personnel-role" label={t('common:users.role')} required>
              <Select
                value={form.watch('role')}
                onValueChange={(value) => form.setValue('role', value as UserRole, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.PERSONEL}>{t('common:role.employee')}</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>{t('common:role.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="personnel-department" label={t('common:users.department')} required>
              <Select
                value={form.watch('department')}
                onValueChange={(value) =>
                  form.setValue('department', value as Department, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_ORDER.map((d) => (
                    <SelectItem key={d} value={d}>
                      {t(`common:department.${d}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </form>

          {rowErrors.length > 0 ? (
            <div className="mt-5 rounded-md border border-border bg-muted/40 p-3">
              <p className="mb-2 text-sm font-medium">{t('common:users.import.errorsTitle')}</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {rowErrors.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {importing ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/95 px-8"
              role="status"
              aria-busy="true"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-foreground">
                {t(`common:users.import.stage.${stage}`)}
              </p>
              <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full bg-primary transition-[width] duration-fast',
                    'bg-[length:200%_100%] animate-shimmer',
                    'bg-[linear-gradient(90deg,var(--color-primary)_0%,color-mix(in_srgb,var(--color-primary)_70%,white)_50%,var(--color-primary)_100%)]',
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs tabular-nums text-muted-foreground">
                {t('common:users.import.percent', { percent })}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => close(false)} disabled={importing}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="create-personnel-form" disabled={importing || createUser.isPending}>
            {t('common:users.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <InviteEmailPreviewDialog
      invite={preview}
      onOpenChange={(open) => {
        if (!open) setPreview(null)
      }}
    />
    </>
  )
}
