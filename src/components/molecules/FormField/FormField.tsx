import * as React from 'react'
import { Label } from '@/components/ui/label'
import { RequiredBadge } from '@/components/atoms/RequiredBadge'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  description?: string
  className?: string
  children: React.ReactElement
}

export function FormField({
  id,
  label,
  required,
  error,
  description,
  className,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`
  const descId = `${id}-desc`
  const describedBy = [error ? errorId : null, description ? descId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required ? <RequiredBadge /> : null}
      </Label>
      {React.cloneElement(children, {
        id,
        'aria-invalid': !!error || undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {description ? (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
