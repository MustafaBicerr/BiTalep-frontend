import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Logo } from '@/components/atoms/Logo'
import { Spinner } from '@/components/atoms/Spinner'
import { FormField } from '@/components/molecules/FormField'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/authService'
import { cn } from '@/utils/cn'
import { interactiveTextLink } from '@/utils/interactive'
import { useState } from 'react'

export function ResetPasswordPage() {
  const { t } = useTranslation(['common', 'forms'])
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pending, setPending] = useState(false)

  const schema = z
    .object({
      password: z.string().min(8, t('forms:validation.minLength', { min: 8 })),
      confirmPassword: z.string().min(1),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('forms:validation.passwordMatch'),
      path: ['confirmPassword'],
    })

  const form = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      toast.error(t('common:toast.error.generic'))
      return
    }
    setPending(true)
    try {
      await authService.resetPassword({ token, password: values.password })
      toast.success(t('common:auth.reset.success'))
      navigate('/login', { replace: true })
    } catch {
      toast.error(t('common:toast.error.generic'))
    } finally {
      setPending(false)
    }
  })

  return (
    <AuthLayout>
      <div className="rounded-lg border border-border bg-background p-8 shadow-lg">
        <Logo variant="full" size={32} className="mb-6" />
        <h1 className="text-h1 text-foreground">{t('common:auth.reset.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('common:auth.reset.subtitle')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner size={16} /> : null}
            {t('common:auth.reset.submit')}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className={cn('text-primary', interactiveTextLink)}>
            {t('common:auth.register.loginLink')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
