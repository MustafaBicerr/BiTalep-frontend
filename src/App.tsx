import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/queryClient'
import i18n from '@/lib/i18n'
import { AppRouter } from '@/routes'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
