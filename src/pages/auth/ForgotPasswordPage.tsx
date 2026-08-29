import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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

export function ForgotPasswordPage() {
  const { t } = useTranslation(['common', 'forms'])
  const [pending, setPending] = useState(false)
  const schema = z.object({
    email: z.string().email(t('forms:validation.email')),
  })
  const form = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true)
    try {
      await authService.forgotPassword({ email: values.email })
      toast.success(t('common:auth.forgot.sent'))
    } catch {
      toast.success(t('common:auth.forgot.sent'))
    } finally {
      setPending(false)
    }
  })

  return (
    <AuthLayout>
      <div className="rounded-lg border border-border bg-background p-8 shadow-lg">
        <Logo variant="full" size={32} className="mb-6" />
        <h1 className="text-h1 text-foreground">{t('common:auth.forgot.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('common:auth.forgot.subtitle')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="email" label={t('common:auth.login.email')} required error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...form.register('email')} />
          </FormField>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner size={16} /> : null}
            {t('common:auth.forgot.submit')}
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
