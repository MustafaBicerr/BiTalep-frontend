import type { CreateUserRequest } from '@/types/user.types'
import { DEPARTMENT_ORDER, Department, UserRole } from '@/types/enums'

export type PersonnelImportErrorCode =
  | 'missingFields'
  | 'invalidRole'
  | 'invalidDepartment'
  | 'emailInvalid'

export interface PersonnelImportError {
  row: number
  code: PersonnelImportErrorCode
}

export interface PersonnelParseResult {
  rows: Array<CreateUserRequest & { rowNumber: number }>
  errors: PersonnelImportError[]
}

export interface PersonnelTemplateLabels {
  filename: string
  sheetData: string
  sheetGuide: string
  columns: [string, string, string, string, string]
  guideHeaders: [string, string, string]
  guideRows: Array<[string, string, string]>
}

const HEADER_FILL = '1B365D'
const HEADER_FONT = 'FFFFFF'

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function buildPersonnelLookups(input: {
  roleAdmin: string
  roleEmployee: string
  departments: Record<Department, string>
}): {
  roleOf: (raw: string) => UserRole | null
  departmentOf: (raw: string) => Department | null
  headerOf: (raw: string) => 'name' | 'surname' | 'email' | 'role' | 'department' | null
} {
  const roleMap = new Map<string, UserRole>([
    ['personel', UserRole.PERSONEL],
    ['employee', UserRole.PERSONEL],
    [UserRole.PERSONEL.toLowerCase(), UserRole.PERSONEL],
    [normalize(input.roleEmployee), UserRole.PERSONEL],
    ['admin', UserRole.ADMIN],
    ['yönetici', UserRole.ADMIN],
    ['yonetici', UserRole.ADMIN],
    [UserRole.ADMIN.toLowerCase(), UserRole.ADMIN],
    [normalize(input.roleAdmin), UserRole.ADMIN],
  ])

  const deptMap = new Map<string, Department>()
  for (const dept of DEPARTMENT_ORDER) {
    deptMap.set(dept.toLowerCase(), dept)
    deptMap.set(normalize(input.departments[dept]), dept)
  }

  const headerMap = new Map<string, 'name' | 'surname' | 'email' | 'role' | 'department'>([
    ['ad', 'name'],
    ['name', 'name'],
    ['first name', 'name'],
    ['firstname', 'name'],
    ['soyad', 'surname'],
    ['surname', 'surname'],
    ['last name', 'surname'],
    ['lastname', 'surname'],
    ['e-posta', 'email'],
    ['eposta', 'email'],
    ['email', 'email'],
    ['e-mail', 'email'],
    ['rol', 'role'],
    ['role', 'role'],
    ['departman', 'department'],
    ['department', 'department'],
  ])

  return {
    roleOf: (raw) => roleMap.get(normalize(raw)) ?? null,
    departmentOf: (raw) => deptMap.get(normalize(raw)) ?? null,
    headerOf: (raw) => headerMap.get(normalize(raw)) ?? null,
  }
}

export async function parsePersonnelWorkbook(
  buffer: ArrayBuffer,
  lookups: ReturnType<typeof buildPersonnelLookups>,
): Promise<PersonnelParseResult> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { rows: [], errors: [] }
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { rows: [], errors: [] }

  const matrix = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  const headerRow = matrix[0] ?? []
  const colIndex: Partial<Record<'name' | 'surname' | 'email' | 'role' | 'department', number>> = {}
  headerRow.forEach((cell, index) => {
    const key = lookups.headerOf(String(cell ?? ''))
    if (key && colIndex[key] == null) colIndex[key] = index
  })

  const rows: PersonnelParseResult['rows'] = []
  const errors: PersonnelImportError[] = []

  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] ?? []
    const rowNumber = i + 1
    const name = String(line[colIndex.name ?? 0] ?? '').trim()
    const surname = String(line[colIndex.surname ?? 1] ?? '').trim()
    const email = String(line[colIndex.email ?? 2] ?? '').trim()
    const roleRaw = String(line[colIndex.role ?? 3] ?? '').trim()
    const deptRaw = String(line[colIndex.department ?? 4] ?? '').trim()

    if (!name && !surname && !email && !roleRaw && !deptRaw) continue

    if (!name || !surname || !email || !roleRaw || !deptRaw) {
      errors.push({ row: rowNumber, code: 'missingFields' })
      continue
    }
    if (!isEmail(email)) {
      errors.push({ row: rowNumber, code: 'emailInvalid' })
      continue
    }
    const role = lookups.roleOf(roleRaw)
    if (!role) {
      errors.push({ row: rowNumber, code: 'invalidRole' })
      continue
    }
    const department = lookups.departmentOf(deptRaw)
    if (!department) {
      errors.push({ row: rowNumber, code: 'invalidDepartment' })
      continue
    }

    rows.push({ rowNumber, name, surname, email, role, department })
  }

  return { rows, errors }
}

type CellStyle = {
  fill: { patternType: 'solid'; fgColor: { rgb: string } }
  font: { bold: boolean; color: { rgb: string }; sz: number }
  alignment: { horizontal: 'center' | 'left'; vertical: 'center' }
}

type SheetLib = typeof import('xlsx')

async function loadWriter(): Promise<SheetLib> {
  try {
    const mod = (await import('xlsx-js-style')) as unknown as { default?: SheetLib } & SheetLib
    return (mod.default ?? mod) as SheetLib
  } catch {
    return import('xlsx')
  }
}

function paintHeader(sheet: import('xlsx').WorkSheet, colCount: number, style: CellStyle) {
  for (let index = 0; index < colCount; index += 1) {
    const addr = `${String.fromCharCode(65 + index)}1`
    const cell = sheet[addr] as { s?: CellStyle } | undefined
    if (cell) cell.s = style
  }
}

export async function downloadPersonnelTemplate(labels: PersonnelTemplateLabels): Promise<void> {
  const XLSX = await loadWriter()
  const headerStyle: CellStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: HEADER_FILL } },
    font: { bold: true, color: { rgb: HEADER_FONT }, sz: 12 },
    alignment: { horizontal: 'center', vertical: 'center' },
  }
  const guideHeaderStyle: CellStyle = {
    ...headerStyle,
    alignment: { horizontal: 'left', vertical: 'center' },
  }

  const dataSheet = XLSX.utils.aoa_to_sheet([labels.columns])
  paintHeader(dataSheet, labels.columns.length, headerStyle)
  dataSheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 32 }, { wch: 16 }, { wch: 24 }]
  dataSheet['!rows'] = [{ hpt: 22 }]

  const guideSheet = XLSX.utils.aoa_to_sheet([labels.guideHeaders, ...labels.guideRows])
  paintHeader(guideSheet, labels.guideHeaders.length, guideHeaderStyle)
  guideSheet['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 28 }]
  guideSheet['!rows'] = [{ hpt: 22 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, dataSheet, labels.sheetData)
  XLSX.utils.book_append_sheet(workbook, guideSheet, labels.sheetGuide)
  XLSX.writeFile(workbook, labels.filename)
}
