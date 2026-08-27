import { Search, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const { t } = useTranslation('common')
  const [local, setLocal] = React.useState(value)

  React.useEffect(() => {
    setLocal(value)
  }, [value])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      if (local !== value) onChange(local)
    }, debounceMs)
    return () => window.clearTimeout(id)
  }, [local, debounceMs, onChange, value])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? t('search.placeholder')}
        className="pl-9 pr-9"
      />
      {local ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setLocal('')
            onChange('')
          }}
          aria-label={t('search.clear')}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
