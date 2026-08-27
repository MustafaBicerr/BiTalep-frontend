import { File, FileSpreadsheet, FileText, Image } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FileTypeIconProps {
  mimeType?: string
  fileName?: string
  className?: string
}

export function FileTypeIcon({ mimeType = '', fileName = '', className }: FileTypeIconProps) {
  const lower = `${mimeType} ${fileName}`.toLowerCase()
  let Icon = File
  if (lower.includes('pdf') || lower.includes('text') || lower.includes('doc')) Icon = FileText
  else if (lower.includes('image') || /\.(png|jpe?g|gif|webp)$/.test(lower)) Icon = Image
  else if (lower.includes('sheet') || lower.includes('excel') || /\.(xlsx?|csv)$/.test(lower))
    Icon = FileSpreadsheet

  return <Icon className={cn('h-5 w-5 text-muted-foreground', className)} aria-hidden />
}
