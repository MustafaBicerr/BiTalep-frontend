import i18n from '@/lib/i18n'

export interface PersonnelInviteCopy {
  subject: string
  preheader: string
  greeting: string
  intro: string
  passwordLabel: string
  copyHint: string
  warningTitle: string
  warning: string
  recommend: string
  cta: string
  footer: string
}

export interface PersonnelInvitePayload {
  name: string
  surname: string
  to: string
  password: string
  loginUrl: string
  logoUrl: string
  copy: PersonnelInviteCopy
}

export interface SentInvite extends PersonnelInvitePayload {
  html: string
  sentAt: string
}

export function getPersonnelInviteCopy(fullName: string): PersonnelInviteCopy {
  return {
    subject: i18n.t('common:users.invite.subject'),
    preheader: i18n.t('common:users.invite.preheader'),
    greeting: i18n.t('common:users.invite.greeting', { name: fullName }),
    intro: i18n.t('common:users.invite.intro'),
    passwordLabel: i18n.t('common:users.invite.passwordLabel'),
    copyHint: i18n.t('common:users.invite.copyHint'),
    warningTitle: i18n.t('common:users.invite.warningTitle'),
    warning: i18n.t('common:users.invite.warning'),
    recommend: i18n.t('common:users.invite.recommend'),
    cta: i18n.t('common:users.invite.cta'),
    footer: i18n.t('common:users.invite.footer'),
  }
}

export function buildPersonnelInviteHtml(payload: PersonnelInvitePayload): string {
  const c = payload.copy
  const navy = '#1e3a5f'
  const teal = '#0d9488'
  const muted = '#64748b'
  const cardBg = '#f0fdfa'
  const border = '#ccfbf1'

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(c.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:${navy};padding:28px 32px;text-align:center;">
              <img src="${escapeHtml(payload.logoUrl)}" alt="BiTalep" height="40" style="height:40px;width:auto;display:inline-block;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              <p style="margin:0 0 12px;font-size:20px;line-height:1.4;font-weight:700;color:${navy};">${escapeHtml(c.greeting)}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(c.intro)}</p>
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${teal};">${escapeHtml(c.passwordLabel)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cardBg};border:1px solid ${border};border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0;font-size:22px;line-height:1.4;font-weight:700;letter-spacing:0.04em;color:${navy};font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${escapeHtml(payload.password)}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:${muted};">${escapeHtml(c.copyHint)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(payload.loginUrl)}" style="display:inline-block;background:${teal};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">${escapeHtml(c.cta)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:14px;line-height:1.6;"><strong style="color:${navy};">${escapeHtml(c.warningTitle)}</strong> ${escapeHtml(c.warning)}</p>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(c.recommend)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;font-size:12px;line-height:1.5;color:${muted};border-top:1px solid #e2e8f0;">
              ${escapeHtml(c.footer)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
