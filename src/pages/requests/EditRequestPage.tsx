import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormField } from '@/components/molecules/FormField'
import { FormPageSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Spinner } from '@/components/atoms/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUploadFile } from '@/hooks/useFiles'
import { useRequest, useUpdateRequest } from '@/hooks/useRequests'
import { FormType, RequestStatus } from '@/types/enums'
import { isPersonnelMutable, personnelLockKey } from '@/utils/requestAccess'

export function EditRequestPage() {
  const { id } = useParams()
  const requestId = id ?? ''
  const { t } = useTranslation(['requests', 'forms', 'common'])
  const navigate = useNavigate()
  const { data, isLoading } = useRequest(requestId)
  const update = useUpdateRequest()
  const upload = useUploadFile()
  const [files, setFiles] = useState<File[]>([])

  const schema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(1000),
    formType: z.nativeEnum(FormType),
  })
  type Values = z.infer<typeof schema>

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', formType: FormType.LEAVE },
  })

  useEffect(() => {
    if (!data) return
    if (!isPersonnelMutable(data.status)) {
      toast.error(t(`requests:${personnelLockKey(data.status)}`))
      navigate(`/requests/${requestId}`, { replace: true })
      return
    }
    form.reset({
      title: data.title,
      description: data.description,
      formType: data.formType,
    })
  }, [data, form, navigate, requestId, t])

  if (isLoading || !data) {
    return <FormPageSkeleton fields={3} />
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      for (const file of files) {
        await upload.mutateAsync({ file, applicationId: requestId })
      }
      await update.mutateAsync({ id: requestId, payload: values })
      toast.success(
        data.status === RequestStatus.NEEDS_UPDATE
          ? t('requests:resubmitted')
          : t('common:toast.success.saved'),
      )
      navigate(`/requests/${requestId}`)
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-h1">{t('requests:editTitle')}</h1>
      {data.status === RequestStatus.NEEDS_UPDATE ? (
        <p className="rounded-md border border-status-needsUpdate/30 bg-status-needsUpdate/10 px-4 py-3 text-sm">
          {t('requests:needsUpdateBanner')}
          {data.updateReason ? ` ${data.updateReason}` : ''}
        </p>
      ) : null}
      <form className="space-y-4 rounded-lg border border-border bg-card p-6" onSubmit={onSubmit}>
        <FormField id="title" label={t('requests:fields.title')} required>
          <Input {...form.register('title')} />
        </FormField>
        <FormField id="description" label={t('requests:fields.description')}>
          <Textarea rows={5} {...form.register('description')} />
        </FormField>
        <FormField id="formType" label={t('requests:fields.formType')} required>
          <Select
            value={form.watch('formType')}
            onValueChange={(v) => form.setValue('formType', v as FormType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FormType).map((ft) => (
                <SelectItem key={ft} value={ft}>
                  {t(`requests:formType.${ft}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="attachments" label={t('requests:fields.attachments')}>
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </FormField>
        <Button type="submit" disabled={update.isPending || upload.isPending}>
          {update.isPending || upload.isPending ? <Spinner size={16} /> : null}
          {t('common:actions.save')}
        </Button>
      </form>
    </div>
  )
}
