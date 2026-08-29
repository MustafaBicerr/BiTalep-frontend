import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormField } from '@/components/molecules/FormField'
import { RoleBadge } from '@/components/molecules/RoleBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile, useUpdateProfile } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatDate'
import { FormPageSkeleton } from '@/components/molecules/SkeletonTemplates'

export function ProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'common'])
  const { data, isLoading } = useProfile()
  const update = useUpdateProfile()

  const form = useForm({
    values: {
      name: data?.name ?? '',
      surname: data?.surname ?? '',
    },
  })

  if (isLoading || !data) {
    return <FormPageSkeleton fields={2} />
  }

  return (
    <div className="mx-auto w-full max-w-3xl shrink-0 space-y-6">
      <h1 className="text-h1">{t('profile:title')}</h1>
      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-xl font-bold text-primary">
          {`${data.name[0] ?? ''}${data.surname[0] ?? ''}`.toUpperCase()}
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await update.mutateAsync(values)
              toast.success(t('profile:updated'))
            } catch {
              toast.error(t('common:toast.error.generic'))
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="name" label={t('profile:firstName')} required>
              <Input {...form.register('name', { required: true })} />
            </FormField>
            <FormField id="surname" label={t('profile:lastName')} required>
              <Input {...form.register('surname', { required: true })} />
            </FormField>
          </div>
          <FormField id="email" label={t('profile:email')}>
            <Input value={data.email} readOnly disabled />
          </FormField>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('profile:role')}</span>
            <RoleBadge role={data.role} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('profile:createdAt')}: {formatDate(data.createdDate, i18n.language)}
          </p>
          <Button type="submit" disabled={update.isPending}>
            {t('profile:save')}
          </Button>
        </form>
      </div>
    </div>
  )
}
