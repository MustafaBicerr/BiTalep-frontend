import { FormType } from '@/types/enums'
import type { FormTypeEntity } from '@/types/request.types'

export const formTypesSeed: FormTypeEntity[] = [
  { id: 1, code: FormType.LEAVE, name: 'İzin' },
  { id: 2, code: FormType.TRAINING, name: 'Eğitim' },
  { id: 3, code: FormType.ADVANCE, name: 'Avans' },
  { id: 4, code: FormType.MATERIAL, name: 'Malzeme' },
  { id: 5, code: FormType.TASK, name: 'Görev' },
]
