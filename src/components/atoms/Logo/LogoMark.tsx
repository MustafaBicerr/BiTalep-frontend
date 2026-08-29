import { cn } from '@/utils/cn'
import type { LogoVariant } from './Logo'

export type LogoTone = 'brand' | 'onDark'

export interface LogoMarkProps {
  variant?: LogoVariant
  /** Icon edge length in px; the wordmark scales relative to it. */
  size?: number
  tone?: LogoTone
  className?: string
  label?: string
}

interface Palette {
  badgeFill: string
  badgeStroke: string
  sheet: string
  sheetStroke: string
  accentBar: string
  line: string
  check: string
  wordPrefix: string
  wordSuffix: string
}

const PALETTES: Record<LogoTone, Palette> = {
  brand: {
    badgeFill: '#e8f1fa',
    badgeStroke: '#3b82f6',
    sheet: '#ffffff',
    sheetStroke: '#cbd5e1',
    accentBar: '#2563eb',
    line: '#94a3b8',
    check: '#2563eb',
    wordPrefix: '#2563eb',
    wordSuffix: '#334155',
  },
  onDark: {
    badgeFill: 'rgba(255,255,255,0.06)',
    badgeStroke: '#5b9bd5',
    sheet: '#ffffff',
    sheetStroke: 'rgba(255,255,255,0.35)',
    accentBar: '#3b82f6',
    line: '#94a3b8',
    check: '#2dd4bf',
    wordPrefix: '#5eead4',
    wordSuffix: '#ffffff',
  },
}

const BADGE_PATH =
  'M43.58 19.81 Q46 24 43.58 28.19 L37.42 38.86 Q35 43.05 30.16 43.05 L17.84 43.05 Q13 43.05 10.58 38.86 L4.42 28.19 Q2 24 4.42 19.81 L10.58 9.14 Q13 4.95 17.84 4.95 L30.16 4.95 Q35 4.95 37.42 9.14 Z'

function LogoIcon({ size, palette, decorative, label }: { size: number; palette: Palette; decorative: boolean; label: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      <path d={BADGE_PATH} fill={palette.badgeFill} stroke={palette.badgeStroke} strokeWidth="1.6" />
      <rect x="14.5" y="11" width="19" height="25" rx="2.5" fill={palette.sheet} stroke={palette.sheetStroke} strokeWidth="0.8" />
      <rect x="18" y="15.4" width="12" height="2.2" rx="1.1" fill={palette.accentBar} />
      <rect x="18" y="19.6" width="10" height="1.5" rx="0.75" fill={palette.line} />
      <rect x="18" y="23.2" width="7.5" height="1.5" rx="0.75" fill={palette.line} />
      {/* Line widths taper so the check's ascending leg never crosses them. */}
      <path
        d="M15.5 27.5 L21 33 L36 14.5"
        fill="none"
        stroke={palette.check}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Vector logo with palettes for light and dark surfaces, so it needs no white plate.
 */
export function LogoMark({ variant = 'full', size = 32, tone = 'brand', className, label = 'BiTalep' }: LogoMarkProps) {
  const palette = PALETTES[tone]

  if (variant === 'icon') {
    return (
      <span className={cn('inline-flex items-center', className)}>
        <LogoIcon size={size} palette={palette} decorative={false} label={label} />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoIcon size={size} palette={palette} decorative label={label} />
      <span
        className="font-bold leading-none tracking-tight"
        style={{ fontSize: size * 0.68 }}
      >
        <span style={{ color: palette.wordPrefix }}>Bi</span>
        <span style={{ color: palette.wordSuffix }}>Talep</span>
      </span>
    </span>
  )
}
