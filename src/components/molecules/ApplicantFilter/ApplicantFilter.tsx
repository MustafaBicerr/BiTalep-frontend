import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUsers } from '@/hooks/useUsers'
import { queryKeys } from '@/lib/queryClient'
import { userService } from '@/services/userService'
import { cn } from '@/utils/cn'

interface ApplicantFilterProps {
  value?: string
  onChange: (id: string | undefined) => void
  className?: string
}

export function ApplicantFilter({ value, onChange, className }: ApplicantFilterProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(id)
  }, [query])

  const { data } = useUsers({
    keyword: debounced.length >= 2 ? debounced : undefined,
    pageSize: 8,
    page: 1,
  })

  const selectedQuery = useQuery({
    queryKey: queryKeys.user(value ?? ''),
    queryFn: () => userService.getUser(value!),
    enabled: value != null,
    staleTime: 60_000,
  })

  const options = debounced.length >= 2 ? (data?.data ?? []) : []
  const selectedLabel = selectedQuery.data
    ? `${selectedQuery.data.name} ${selectedQuery.data.surname}`
    : value != null
      ? `#${value}`
      : null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-[220px] justify-between font-normal"
          >
            <span className="truncate">
              {selectedLabel ?? t('filter.applicant')}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t('filter.applicantSearch')}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {debounced.length < 2 ? (
                <CommandEmpty>{t('search.minChars')}</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>{t('search.noResults')}</CommandEmpty>
                  <CommandGroup>
                    {options.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={`${u.name} ${u.surname} ${u.email}`}
                        onSelect={() => {
                          onChange(u.id)
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === u.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="truncate">
                          {u.name} {u.surname}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value != null ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label={t('filter.remove', { label: t('filter.applicant') })}
          onClick={() => onChange(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
