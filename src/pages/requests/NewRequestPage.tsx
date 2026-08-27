import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormField } from '@/components/molecules/FormField'
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
import { useCreateRequest } from '@/hooks/useRequests'
import { FormType } from '@/types/enums'

export function NewRequestPage() {
  const { t } = useTranslation(['requests', 'forms', 'common'])
  const navigate = useNavigate()
  const create = useCreateRequest()

  const schema = z.object({
    title: z.string().min(1, t('forms:validation.required')).max(100),
    description: z.string().max(1000),
    formType: z.nativeEnum(FormType),
  })

  type Values = z.infer<typeof schema>

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', formType: FormType.LEAVE },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values)
      toast.success(t('common:toast.success.created'))
      navigate('/requests')
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  })

  const description = form.watch('description') ?? ''

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-h1">{t('requests:newTitle')}</h1>
      <form className="space-y-4 rounded-lg border border-border bg-card p-6" onSubmit={onSubmit}>
        <FormField id="title" label={t('requests:fields.title')} required error={form.formState.errors.title?.message}>
          <Input {...form.register('title')} placeholder={t('requests:placeholders.title')} />
        </FormField>
        <FormField
          id="description"
          label={t('requests:fields.description')}
          error={form.formState.errors.description?.message}
          description={t('requests:charCount', { count: description.length, max: 1000 })}
        >
          <Textarea rows={5} {...form.register('description')} placeholder={t('requests:placeholders.description')} />
        </FormField>
        <FormField id="formType" label={t('requests:fields.formType')} required>
          <Select
            value={form.watch('formType')}
            onValueChange={(v) => form.setValue('formType', v as FormType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('requests:placeholders.formType')} />
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
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Spinner size={16} /> : null}
          {t('common:actions.submit')}
        </Button>
      </form>
    </div>
  )
}
