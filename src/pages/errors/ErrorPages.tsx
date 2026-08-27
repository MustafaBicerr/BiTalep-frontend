import { FileQuestion, ServerCrash, ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function ErrorPageShell({
  icon: Icon,
  codeKey,
}: {
  icon: typeof ShieldOff
  codeKey: '403' | '404' | '500'
}) {
  const { t } = useTranslation('errors')
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[480px] text-center">
        <Icon className="mx-auto h-16 w-16 text-muted-foreground" aria-hidden />
        <p className="mt-6 text-h1 text-primary">{t(`${codeKey}.code`)}</p>
        <h1 className="mt-2 text-h2 text-foreground">{t(`${codeKey}.title`)}</h1>
        <p className="mt-3 text-base text-muted-foreground">{t(`${codeKey}.description`)}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">{t(`${codeKey}.primary`)}</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {t(`${codeKey}.secondary`)}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ForbiddenPage() {
  return <ErrorPageShell icon={ShieldOff} codeKey="403" />
}

export function NotFoundPage() {
  return <ErrorPageShell icon={FileQuestion} codeKey="404" />
}

export function ServerErrorPage() {
  return <ErrorPageShell icon={ServerCrash} codeKey="500" />
}
