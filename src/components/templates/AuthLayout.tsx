import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn('relative flex min-h-screen items-center justify-center overflow-hidden p-4', className)}>
      <div className="pointer-events-none absolute inset-0 bg-background" aria-hidden>
        <div
          className="absolute -left-[10%] -top-[20%] h-[70%] w-[60%] bg-primary-subtle opacity-90"
          style={{ clipPath: 'polygon(0 0, 100% 10%, 85% 100%, 0 80%)' }}
        />
        <div
          className="absolute -right-[5%] top-[10%] h-[55%] w-[45%] bg-muted opacity-80"
          style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 85%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[20%] h-[45%] w-[70%] bg-primary/10 opacity-70"
          style={{ clipPath: 'polygon(10% 20%, 100% 0, 90% 100%, 0 100%)' }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="auth-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M0 120 L280 40 L520 180 L800 60" fill="none" stroke="url(#auth-line)" strokeWidth="1.5" />
          <path d="M40 400 L300 280 L560 420 L900 240" fill="none" stroke="url(#auth-line)" strokeWidth="1.5" />
          <path d="M100 600 L400 520 L700 640 L1100 480" fill="none" stroke="url(#auth-line)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-[440px]">{children}</div>
    </div>
  )
}
