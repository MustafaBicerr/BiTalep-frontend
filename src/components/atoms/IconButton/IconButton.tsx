import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function IconButton({ className, children, variant = 'ghost', ...props }: IconButtonProps) {
  return (
    <Button type="button" variant={variant} size="icon" className={cn(className)} {...props}>
      {children}
    </Button>
  )
}
