import { Department, UserRole } from '@/types/enums'
import type { UserEntity } from '@/types/user.types'
import { DEMO_TENANT_ID, userId } from '@/lib/ids'

const PASSWORD = 'Test1234!'

interface RosterRow {
  id: number
  name: string
  surname: string
  email: string
  department: Department
  createdDate: string
  role?: UserRole
}

/**
 * Seed users — core demo accounts (id 1-28 preserved) plus roster growth to 45
 * so department filters and infinite lists have realistic depth.
 */
const ROSTER: RosterRow[] = [
  { id: 1, name: 'Ahmet', surname: 'Yılmaz', email: 'admin@bitalep.com', department: Department.HR, createdDate: '2025-01-10T09:00:00.000Z', role: UserRole.ADMIN },
  { id: 2, name: 'Ayşe', surname: 'Demir', email: 'admin2@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-01-12T10:00:00.000Z', role: UserRole.ADMIN },
  { id: 3, name: 'Mehmet', surname: 'Kaya', email: 'mehmet@bitalep.com', department: Department.IT, createdDate: '2025-02-01T08:30:00.000Z' },
  { id: 4, name: 'Fatma', surname: 'Öztürk', email: 'fatma@bitalep.com', department: Department.HR, createdDate: '2025-02-05T11:00:00.000Z' },
  { id: 5, name: 'Ali', surname: 'Çelik', email: 'ali@bitalep.com', department: Department.FINANCE, createdDate: '2025-02-10T14:00:00.000Z' },
  { id: 6, name: 'Zeynep', surname: 'Arslan', email: 'zeynep@bitalep.com', department: Department.IT, createdDate: '2025-03-01T09:15:00.000Z' },
  { id: 7, name: 'Can', surname: 'Şahin', email: 'can@bitalep.com', department: Department.SALES, createdDate: '2025-03-15T16:45:00.000Z' },
  { id: 8, name: 'Elif', surname: 'Koç', email: 'elif@bitalep.com', department: Department.MARKETING, createdDate: '2025-03-20T09:00:00.000Z' },
  { id: 9, name: 'Burak', surname: 'Aydın', email: 'burak@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-03-22T10:30:00.000Z' },
  { id: 10, name: 'Selin', surname: 'Yıldız', email: 'selin@bitalep.com', department: Department.IT, createdDate: '2025-03-25T11:00:00.000Z' },
  { id: 11, name: 'Emre', surname: 'Polat', email: 'emre@bitalep.com', department: Department.FINANCE, createdDate: '2025-04-01T08:00:00.000Z' },
  { id: 12, name: 'Deniz', surname: 'Kurt', email: 'deniz@bitalep.com', department: Department.SALES, createdDate: '2025-04-03T13:20:00.000Z' },
  { id: 13, name: 'Gül', surname: 'Erdoğan', email: 'gul@bitalep.com', department: Department.HR, createdDate: '2025-04-05T09:45:00.000Z' },
  { id: 14, name: 'Hakan', surname: 'Acar', email: 'hakan@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-04-08T15:00:00.000Z' },
  { id: 15, name: 'İrem', surname: 'Doğan', email: 'irem@bitalep.com', department: Department.MARKETING, createdDate: '2025-04-10T10:10:00.000Z' },
  { id: 16, name: 'Murat', surname: 'Şen', email: 'murat@bitalep.com', department: Department.IT, createdDate: '2025-04-12T12:00:00.000Z' },
  { id: 17, name: 'Nazlı', surname: 'Güneş', email: 'nazli@bitalep.com', department: Department.FINANCE, createdDate: '2025-04-15T08:30:00.000Z' },
  { id: 18, name: 'Onur', surname: 'Yalçın', email: 'onur@bitalep.com', department: Department.SALES, createdDate: '2025-04-18T14:40:00.000Z' },
  { id: 19, name: 'Pınar', surname: 'Bulut', email: 'pinar@bitalep.com', department: Department.HR, createdDate: '2025-04-20T09:00:00.000Z' },
  { id: 20, name: 'Serkan', surname: 'Taş', email: 'serkan@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-04-22T11:25:00.000Z' },
  { id: 21, name: 'Tuğçe', surname: 'Kılıç', email: 'tugce@bitalep.com', department: Department.MARKETING, createdDate: '2025-04-25T16:00:00.000Z' },
  { id: 22, name: 'Umut', surname: 'Özkan', email: 'umut@bitalep.com', department: Department.IT, createdDate: '2025-05-01T08:15:00.000Z' },
  { id: 23, name: 'Yasemin', surname: 'Aksoy', email: 'yasemin@bitalep.com', department: Department.FINANCE, createdDate: '2025-05-03T10:50:00.000Z' },
  { id: 24, name: 'Berk', surname: 'Çetin', email: 'berk@bitalep.com', department: Department.SALES, createdDate: '2025-05-05T13:00:00.000Z' },
  { id: 25, name: 'Ceren', surname: 'Kaplan', email: 'ceren@bitalep.com', department: Department.HR, createdDate: '2025-05-08T09:30:00.000Z' },
  { id: 26, name: 'Ege', surname: 'Sarı', email: 'ege@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-05-10T11:00:00.000Z' },
  { id: 27, name: 'Melis', surname: 'Avcı', email: 'melis@bitalep.com', department: Department.MARKETING, createdDate: '2025-05-12T14:20:00.000Z' },
  { id: 28, name: 'Oğuz', surname: 'Tekin', email: 'oguz@bitalep.com', department: Department.OTHER, createdDate: '2025-05-15T08:45:00.000Z' },
  { id: 29, name: 'Sinem', surname: 'Balcı', email: 'sinem@bitalep.com', department: Department.IT, createdDate: '2025-05-18T09:10:00.000Z' },
  { id: 30, name: 'Kerem', surname: 'Ergin', email: 'kerem@bitalep.com', department: Department.FINANCE, createdDate: '2025-05-20T10:00:00.000Z' },
  { id: 31, name: 'Bahar', surname: 'Duman', email: 'bahar@bitalep.com', department: Department.SALES, createdDate: '2025-05-22T11:35:00.000Z' },
  { id: 32, name: 'Tolga', surname: 'Karaca', email: 'tolga@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-05-25T08:20:00.000Z' },
  { id: 33, name: 'Esra', surname: 'Turan', email: 'esra@bitalep.com', department: Department.HR, createdDate: '2025-05-28T13:45:00.000Z' },
  { id: 34, name: 'Volkan', surname: 'Demirci', email: 'volkan@bitalep.com', department: Department.IT, createdDate: '2025-06-01T09:00:00.000Z' },
  { id: 35, name: 'Aslı', surname: 'Uçar', email: 'asli@bitalep.com', department: Department.MARKETING, createdDate: '2025-06-03T10:30:00.000Z' },
  { id: 36, name: 'Fırat', surname: 'Solmaz', email: 'firat@bitalep.com', department: Department.SALES, createdDate: '2025-06-05T14:00:00.000Z' },
  { id: 37, name: 'Damla', surname: 'Öz', email: 'damla@bitalep.com', department: Department.FINANCE, createdDate: '2025-06-08T08:40:00.000Z' },
  { id: 38, name: 'Kaan', surname: 'Bozkurt', email: 'kaan@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-06-10T11:15:00.000Z' },
  { id: 39, name: 'Şeyma', surname: 'Ateş', email: 'seyma@bitalep.com', department: Department.HR, createdDate: '2025-06-12T09:55:00.000Z' },
  { id: 40, name: 'Yiğit', surname: 'Korkmaz', email: 'yigit@bitalep.com', department: Department.IT, createdDate: '2025-06-15T13:10:00.000Z' },
  { id: 41, name: 'Buse', surname: 'Yavuz', email: 'buse@bitalep.com', department: Department.MARKETING, createdDate: '2025-06-18T10:05:00.000Z' },
  { id: 42, name: 'Barış', surname: 'Ünal', email: 'baris@bitalep.com', department: Department.SALES, createdDate: '2025-06-20T15:30:00.000Z' },
  { id: 43, name: 'Ferhat', surname: 'Güler', email: 'ferhat@bitalep.com', department: Department.OPERATIONS, createdDate: '2025-06-23T08:25:00.000Z' },
  { id: 44, name: 'Hande', surname: 'Coşkun', email: 'hande@bitalep.com', department: Department.OTHER, createdDate: '2025-06-25T12:45:00.000Z' },
  { id: 45, name: 'Sercan', surname: 'Tunç', email: 'sercan@bitalep.com', department: Department.FINANCE, createdDate: '2025-06-27T09:20:00.000Z' },
]

export const usersSeed: UserEntity[] = ROSTER.map((row) => ({
  id: userId(row.id),
  name: row.name,
  surname: row.surname,
  email: row.email,
  password: PASSWORD,
  role: row.role ?? UserRole.PERSONEL,
  department: row.department,
  tenantId: DEMO_TENANT_ID,
  createdDate: row.createdDate,
}))

/** Employee numeric seed keys (non-admin) — request generator still uses them. */
export const employeeSeedNs: number[] = ROSTER.filter((row) => (row.role ?? UserRole.PERSONEL) === UserRole.PERSONEL).map(
  (row) => row.id,
)
export const employeeUserIds: string[] = usersSeed
  .filter((u) => u.role === UserRole.PERSONEL)
  .map((u) => u.id)
