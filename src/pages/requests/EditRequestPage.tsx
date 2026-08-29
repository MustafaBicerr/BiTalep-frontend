import { useEffect } from 'react'
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
import { useRequest, useUpdateRequest } from '@/hooks/useRequests'
import { FormType, RequestStatus } from '@/types/enums'

export function EditRequestPage() {
  const { id } = useParams()
  const requestId = id ?? ''
  const { t } = useTranslation(['requests', 'forms', 'common'])
  const navigate = useNavigate()
  const { data, isLoading } = useRequest(requestId)
  const update = useUpdateRequest()

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
    if (data.status !== RequestStatus.NEW) {
      toast.error(t('requests:cannotEdit'))
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
      await update.mutateAsync({ id: requestId, payload: values })
      toast.success(t('common:toast.success.saved'))
      navigate(`/requests/${requestId}`)
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-h1">{t('requests:editTitle')}</h1>
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
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? <Spinner size={16} /> : null}
          {t('common:actions.save')}
        </Button>
      </form>
    </div>
  )
}
