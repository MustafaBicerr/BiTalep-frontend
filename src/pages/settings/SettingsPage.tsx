import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export function SettingsGeneralPage() {
  const { t } = useTranslation(['settings', 'common'])

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h2 className="text-h3">{t('settings:general')}</h2>
      <div className="space-y-2">
        <Label>{t('settings:language')}</Label>
        <LanguageSwitcher />
      </div>
      <Button type="button" onClick={() => toast.success(t('settings:saved'))}>
        {t('common:actions.save')}
      </Button>
    </div>
  )
}

export function SettingsNotificationsPage() {
  const { t } = useTranslation(['settings', 'common'])
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(true)
  const [status, setStatus] = useState(true)

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h2 className="text-h3">{t('settings:notifications')}</h2>
      <div className="flex items-center justify-between">
        <Label>{t('settings:emailNotifications')}</Label>
        <Switch checked={email} onCheckedChange={setEmail} />
      </div>
      <div className="flex items-center justify-between">
        <Label>{t('settings:pushNotifications')}</Label>
        <Switch checked={push} onCheckedChange={setPush} />
      </div>
      <div className="flex items-center justify-between">
        <Label>{t('settings:statusChangeNotification')}</Label>
        <Switch checked={status} onCheckedChange={setStatus} />
      </div>
      <Button type="button" onClick={() => toast.success(t('settings:saved'))}>
        {t('common:actions.save')}
      </Button>
    </div>
  )
}

export function SettingsSecurityPage() {
  const { t } = useTranslation(['settings', 'common'])
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-h3">{t('settings:security')}</h2>
      <div className="space-y-2">
        <Label>{t('settings:currentPassword')}</Label>
        <Input type="password" />
      </div>
      <div className="space-y-2">
        <Label>{t('settings:newPassword')}</Label>
        <Input type="password" />
      </div>
      <div className="space-y-2">
        <Label>{t('settings:confirmPassword')}</Label>
        <Input type="password" />
      </div>
      <Button type="button" onClick={() => toast.success(t('settings:saved'))}>
        {t('settings:changePassword')}
      </Button>
    </div>
  )
}

export function SettingsAppearancePage() {
  const { t } = useTranslation(['settings', 'common'])
  const [density, setDensity] = useState('compact')

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h2 className="text-h3">{t('settings:appearance')}</h2>
      <div className="space-y-2">
        <Label>{t('settings:density')}</Label>
        <Select value={density} onValueChange={setDensity}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">{t('settings:densityCompact')}</SelectItem>
            <SelectItem value="comfortable">{t('settings:densityComfortable')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="button" onClick={() => toast.success(t('settings:saved'))}>
        {t('common:actions.save')}
      </Button>
    </div>
  )
}
