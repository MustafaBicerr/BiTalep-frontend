import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Logo } from '@/components/atoms/Logo'
import { Spinner } from '@/components/atoms/Spinner'
import { FormField } from '@/components/molecules/FormField'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegister } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { interactiveTextLink } from '@/utils/interactive'

export function RegisterPage() {
  const { t } = useTranslation(['common', 'forms'])
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const schema = z
    .object({
      name: z.string().min(1, t('forms:validation.required')),
      surname: z.string().min(1, t('forms:validation.required')),
      companyName: z.string().min(1, t('forms:validation.required')).max(200),
      email: z.string().email(t('forms:validation.email')),
      password: z.string().min(8, t('forms:validation.minLength', { min: 8 })),
      confirmPassword: z.string().min(1),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('forms:validation.passwordMatch'),
      path: ['confirmPassword'],
    })

  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', surname: '', companyName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        surname: values.surname,
        companyName: values.companyName,
        email: values.email,
        password: values.password,
      })
      toast.success(t('common:toast.success.created'))
      navigate('/', { replace: true })
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  })

  return (
    <AuthLayout>
      <div className="rounded-lg border border-border bg-background p-8 shadow-lg">
        <Logo variant="full" size={32} className="mb-6" />
        <h1 className="text-h1 text-foreground">{t('common:auth.register.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('common:auth.register.subtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="name" label={t('common:auth.register.firstName')} required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField id="surname" label={t('common:auth.register.lastName')} required error={form.formState.errors.surname?.message}>
            <Input {...form.register('surname')} />
          </FormField>
          <FormField id="companyName" label={t('common:auth.register.companyName')} required error={form.formState.errors.companyName?.message}>
            <Input autoComplete="organization" {...form.register('companyName')} />
          </FormField>
          <FormField id="email" label={t('common:auth.register.email')} required error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...form.register('email')} />
          </FormField>
          <FormField id="password" label={t('common:auth.register.password')} required error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...form.register('password')} />
          </FormField>
          <FormField
            id="confirmPassword"
            label={t('common:auth.register.confirmPassword')}
            required
            error={form.formState.errors.confirmPassword?.message}
          >
            <Input type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? <Spinner size={16} /> : null}
            {t('common:auth.register.submit')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('common:auth.register.hasAccount')}{' '}
          <Link to="/login" className={cn('text-primary', interactiveTextLink)}>
            {t('common:auth.register.loginLink')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
