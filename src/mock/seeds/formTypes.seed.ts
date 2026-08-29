import { FormType } from '@/types/enums'
import type { FormTypeEntity } from '@/types/request.types'
import { formTypeId } from '@/lib/ids'

export const formTypesSeed: FormTypeEntity[] = [
  { id: formTypeId(1), code: FormType.LEAVE, name: 'İzin' },
  { id: formTypeId(2), code: FormType.TRAINING, name: 'Eğitim' },
  { id: formTypeId(3), code: FormType.ADVANCE, name: 'Avans' },
  { id: formTypeId(4), code: FormType.MATERIAL, name: 'Malzeme' },
  { id: formTypeId(5), code: FormType.TASK, name: 'Görev' },
]
