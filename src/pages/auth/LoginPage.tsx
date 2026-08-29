import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Logo } from '@/components/atoms/Logo'
import { Spinner } from '@/components/atoms/Spinner'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { interactiveIcon, interactiveTextLink } from '@/utils/interactive'

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const isMock = import.meta.env.VITE_API_MODE === 'mock'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync({ email: values.email, password: values.password })
      const returnUrl = params.get('returnUrl') || '/'
      navigate(returnUrl, { replace: true })
    } catch {
      toast.error(t('toast.error.unauthorized'))
    }
  })

  return (
    <AuthLayout>
      <div className="rounded-lg border border-border bg-background p-8 shadow-lg">
        <Logo variant="full" size={32} className="mb-6" />
        <h1 className="text-h1 text-foreground">{t('auth.login.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.login.subtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.login.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="pl-9"
                placeholder={t('auth.login.emailPlaceholder')}
                {...form.register('email')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.login.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="pl-9 pr-10"
                placeholder={t('auth.login.passwordPlaceholder')}
                {...form.register('password')}
              />
              <button
                type="button"
                className={cn('absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground', interactiveIcon)}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end">
          <Link to="/forgot-password" className={cn('text-xs text-primary', interactiveTextLink)}>
            {t('auth.login.forgotPassword')}
          </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? <Spinner size={16} /> : null}
            {t('auth.login.submit')}
          </Button>

          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id="remember"
              checked={form.watch('rememberMe')}
              onCheckedChange={(v) => form.setValue('rememberMe', v === true)}
            />
            <Label htmlFor="remember" className="font-normal">
              {t('auth.login.rememberMe')}
            </Label>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className={cn('text-primary', interactiveTextLink)}>
            {t('auth.login.registerLink')}
          </Link>
        </p>

        {isMock ? (
          <div className="mt-6 rounded-md border border-border bg-muted p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">{t('demo.title')}</p>
            <p>
              {t('demo.admin')}: admin@bitalep.com
            </p>
            <p>
              {t('demo.employee')}: mehmet@bitalep.com
            </p>
            <p>
              {t('demo.password')}: Test1234!
            </p>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  )
}
