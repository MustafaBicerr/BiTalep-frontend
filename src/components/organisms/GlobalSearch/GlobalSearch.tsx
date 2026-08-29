import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types/enums'
import { useRequests } from '@/hooks/useRequests'
import { useUsers } from '@/hooks/useUsers'
import { useState } from 'react'

export function GlobalSearch() {
  const { t } = useTranslation(['common', 'nav'])
  const open = useUiStore((s) => s.globalSearchOpen)
  const setOpen = useUiStore((s) => s.setGlobalSearchOpen)
  const role = useAuthStore((s) => s.user?.role)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const enabled = q.trim().length >= 2

  const requestsQuery = useRequests({ keyword: enabled ? q : undefined, pageSize: 5 })
  const usersQuery = useUsers({ keyword: enabled ? q : undefined, pageSize: 5 })

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={t('common:search.placeholder')}
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {!enabled ? (
          <CommandGroup heading={t('common:search.pages')}>
            <CommandItem onSelect={() => go('/')}>{t('nav:dashboard')}</CommandItem>
            <CommandItem onSelect={() => go('/requests')}>{t('nav:myRequests')}</CommandItem>
            <CommandItem onSelect={() => go('/profile')}>{t('nav:profile')}</CommandItem>
          </CommandGroup>
        ) : (
          <>
            <CommandEmpty>{t('common:search.noResults')}</CommandEmpty>
            <CommandGroup heading={t('common:search.requests')}>
              {(requestsQuery.data?.data ?? []).map((r: { id: string; title: string }) => (
                <CommandItem key={r.id} onSelect={() => go(`/requests/${r.id}`)}>
                  {r.title}
                </CommandItem>
              ))}
            </CommandGroup>
            {role === UserRole.ADMIN ? (
              <CommandGroup heading={t('common:search.users')}>
                {(usersQuery.data?.data ?? []).map(
                  (u: { id: string; name: string; surname: string }) => (
                  <CommandItem
                    key={u.id}
                    onSelect={() => go(`/requests?applicantId=${u.id}`)}
                  >
                    {u.name} {u.surname}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
