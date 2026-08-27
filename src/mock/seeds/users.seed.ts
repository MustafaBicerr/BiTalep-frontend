import { UserRole } from '@/types/enums'
import type { UserEntity } from '@/types/user.types'

const PASSWORD = 'Test1234!'

/** Seed users — exact roster from mock_store_rules.md */
export const usersSeed: UserEntity[] = [
  {
    id: 1,
    name: 'Ahmet',
    surname: 'Yılmaz',
    email: 'admin@bitalep.com',
    password: PASSWORD,
    role: UserRole.ADMIN,
    createdDate: '2025-01-10T09:00:00.000Z',
  },
  {
    id: 2,
    name: 'Ayşe',
    surname: 'Demir',
    email: 'admin2@bitalep.com',
    password: PASSWORD,
    role: UserRole.ADMIN,
    createdDate: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 3,
    name: 'Mehmet',
    surname: 'Kaya',
    email: 'mehmet@bitalep.com',
    password: PASSWORD,
    role: UserRole.PERSONEL,
    createdDate: '2025-02-01T08:30:00.000Z',
  },
  {
    id: 4,
    name: 'Fatma',
    surname: 'Öztürk',
    email: 'fatma@bitalep.com',
    password: PASSWORD,
    role: UserRole.PERSONEL,
    createdDate: '2025-02-05T11:00:00.000Z',
  },
  {
    id: 5,
    name: 'Ali',
    surname: 'Çelik',
    email: 'ali@bitalep.com',
    password: PASSWORD,
    role: UserRole.PERSONEL,
    createdDate: '2025-02-10T14:00:00.000Z',
  },
  {
    id: 6,
    name: 'Zeynep',
    surname: 'Arslan',
    email: 'zeynep@bitalep.com',
    password: PASSWORD,
    role: UserRole.PERSONEL,
    createdDate: '2025-03-01T09:15:00.000Z',
  },
  {
    id: 7,
    name: 'Can',
    surname: 'Şahin',
    email: 'can@bitalep.com',
    password: PASSWORD,
    role: UserRole.PERSONEL,
    createdDate: '2025-03-15T16:45:00.000Z',
  },
]
