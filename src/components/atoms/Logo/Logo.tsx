import { cn } from '@/utils/cn'

export type LogoVariant = 'full' | 'icon'

export interface LogoProps {
  variant?: LogoVariant
  size?: number
  className?: string
  alt?: string
}

const DEFAULT_SIZES: Record<LogoVariant, number> = {
  full: 140,
  icon: 32,
}

export function Logo({
  variant = 'full',
  size,
  className,
  alt = 'BiTalep',
}: LogoProps) {
  const resolvedSize = size ?? DEFAULT_SIZES[variant]
  const src = variant === 'icon' ? '/logo-icon.png' : '/logo-full.png'

  if (variant === 'full') {
    return (
      <img
        src={src}
        alt={alt}
        height={resolvedSize}
        className={cn('h-auto w-auto object-contain', className)}
        style={{ height: resolvedSize }}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={resolvedSize}
      height={resolvedSize}
      className={cn('object-contain', className)}
      style={{ width: resolvedSize, height: resolvedSize }}
    />
  )
}
