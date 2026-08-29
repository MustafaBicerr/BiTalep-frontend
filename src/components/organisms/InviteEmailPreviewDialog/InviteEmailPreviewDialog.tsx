import { Copy, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SentInvite } from '@/emails/personnelInvite'

interface InviteEmailPreviewDialogProps {
  invite: SentInvite | null
  onOpenChange: (open: boolean) => void
}

export function InviteEmailPreviewDialog({ invite, onOpenChange }: InviteEmailPreviewDialogProps) {
  const { t } = useTranslation('common')

  const copyPassword = async () => {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.password)
      toast.success(t('users.invite.copied'))
    } catch {
      toast.error(t('toast.error.generic'))
    }
  }

  return (
    <Dialog open={invite != null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[640px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            {t('users.invite.previewTitle')}
          </DialogTitle>
          <DialogDescription>{t('users.invite.previewDescription', { email: invite?.to ?? '' })}</DialogDescription>
        </DialogHeader>

        {invite ? (
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-4">
            <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <div className="flex justify-center bg-secondary px-8 py-7">
                <img src={invite.logoUrl} alt={t('appName')} className="h-10 w-auto object-contain" />
              </div>
              <div className="space-y-4 px-8 py-8">
                <p className="text-xl font-bold text-secondary">{invite.copy.greeting}</p>
                <p className="text-sm leading-relaxed text-foreground/80">{invite.copy.intro}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                  {invite.copy.passwordLabel}
                </p>
                <div className="rounded-xl border border-primary/20 bg-primary-subtle px-5 py-5 text-center">
                  <p className="font-mono text-xl font-bold tracking-wide text-secondary">{invite.password}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void copyPassword()}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    {t('users.invite.copyPassword')}
                  </Button>
                </div>
                <div className="flex justify-center pt-1">
                  <Button asChild>
                    <a href={invite.loginUrl}>{invite.copy.cta}</a>
                  </Button>
                </div>
                <p className="text-sm leading-relaxed">
                  <strong className="text-secondary">{invite.copy.warningTitle}</strong> {invite.copy.warning}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{invite.copy.recommend}</p>
              </div>
              <p className="border-t border-border px-8 py-5 text-xs text-muted-foreground">{invite.copy.footer}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
