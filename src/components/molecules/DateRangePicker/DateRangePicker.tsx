import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

interface DateRangePickerProps {
  from?: string
  to?: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  className?: string
}

export function DateRangePicker({
  from = '',
  to = '',
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  const { t } = useTranslation('common')

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex flex-col gap-1">
        <Label htmlFor="date-from" className="text-xs">
          {t('filter.dateFrom')}
        </Label>
        <Input
          id="date-from"
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-10 w-[160px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="date-to" className="text-xs">
          {t('filter.dateTo')}
        </Label>
        <Input
          id="date-to"
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-10 w-[160px]"
        />
      </div>
    </div>
  )
}
