import type { AttachmentEntity } from '@/types/file.types'
import { DEMO_TENANT_ID, attachmentId, requestId } from '@/lib/ids'
import { createRng } from './rng'

type DraftAttachment = Omit<AttachmentEntity, 'id' | 'applicationId' | 'tenantId'> & {
  id: number
  applicationId: number
}

function toEntity(draft: DraftAttachment): AttachmentEntity {
  return {
    ...draft,
    id: attachmentId(draft.id),
    applicationId: requestId(draft.applicationId),
    tenantId: DEMO_TENANT_ID,
  }
}

const CURATED: DraftAttachment[] = [
  {
    id: 1,
    fileName: 'izin-belgesi-1.pdf',
    originalName: 'İzin Belgesi.pdf',
    filePath: '/mock-files/izin-belgesi-1.pdf',
    fileSize: 245_760,
    mimeType: 'application/pdf',
    uploadDate: '2026-08-20T10:00:00.000Z',
    applicationId: 1,
  },
  {
    id: 2,
    fileName: 'egitim-programi.docx',
    originalName: 'Eğitim Programı.docx',
    filePath: '/mock-files/egitim-programi.docx',
    fileSize: 512_000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadDate: '2026-08-21T11:30:00.000Z',
    applicationId: 2,
  },
  {
    id: 3,
    fileName: 'fatura-avans.pdf',
    originalName: 'Fatura.pdf',
    filePath: '/mock-files/fatura-avans.pdf',
    fileSize: 180_224,
    mimeType: 'application/pdf',
    uploadDate: '2026-08-22T09:15:00.000Z',
    applicationId: 3,
  },
  {
    id: 4,
    fileName: 'malzeme-liste.xlsx',
    originalName: 'Malzeme Listesi.xlsx',
    filePath: '/mock-files/malzeme-liste.xlsx',
    fileSize: 96_000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadDate: '2026-08-23T14:00:00.000Z',
    applicationId: 4,
  },
  {
    id: 5,
    fileName: 'gorev-plan.png',
    originalName: 'Görev Planı.png',
    filePath: '/mock-files/gorev-plan.png',
    fileSize: 1_024_000,
    mimeType: 'image/png',
    uploadDate: '2026-08-24T08:45:00.000Z',
    applicationId: 5,
  },
  {
    id: 6,
    fileName: 'doktor-raporu.pdf',
    originalName: 'Doktor Raporu.pdf',
    filePath: '/mock-files/doktor-raporu.pdf',
    fileSize: 320_000,
    mimeType: 'application/pdf',
    uploadDate: '2026-08-25T16:20:00.000Z',
    applicationId: 6,
  },
  {
    id: 7,
    fileName: 'sertifika.jpg',
    originalName: 'Sertifika.jpg',
    filePath: '/mock-files/sertifika.jpg',
    fileSize: 780_000,
    mimeType: 'image/jpeg',
    uploadDate: '2026-08-10T12:00:00.000Z',
    applicationId: 8,
  },
  {
    id: 8,
    fileName: 'monitor-teklif.pdf',
    originalName: 'Monitör Teklifi.pdf',
    filePath: '/mock-files/monitor-teklif.pdf',
    fileSize: 410_000,
    mimeType: 'application/pdf',
    uploadDate: '2026-08-05T10:30:00.000Z',
    applicationId: 9,
  },
]

const FILE_TEMPLATES: ReadonlyArray<{ name: string; slug: string; mimeType: string; size: number }> = [
  { name: 'Talep Formu.pdf', slug: 'talep-formu', mimeType: 'application/pdf', size: 214_000 },
  { name: 'Onay Yazısı.pdf', slug: 'onay-yazisi', mimeType: 'application/pdf', size: 168_000 },
  { name: 'Teklif.xlsx', slug: 'teklif', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 88_000 },
  { name: 'Açıklama.docx', slug: 'aciklama', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 132_000 },
  { name: 'Ekran Görüntüsü.png', slug: 'ekran-goruntusu', mimeType: 'image/png', size: 640_000 },
]

/**
 * Spreads attachments across generated requests so the "has attachment"
 * filters have meaningful data. Deterministic: fixed LCG seed, no Math.random.
 */
function generatedAttachments(): DraftAttachment[] {
  const rng = createRng(77_431)
  const items: DraftAttachment[] = []
  let id = CURATED.length

  for (let requestId = 16; requestId <= 220; requestId += 1) {
    // Roughly one in four requests carries a file.
    if (rng.next() > 0.26) continue
    const template = rng.pick(FILE_TEMPLATES)
    id += 1
    const uploadDay = new Date()
    uploadDay.setHours(rng.int(9, 17), 0, 0, 0)
    uploadDay.setDate(uploadDay.getDate() - rng.int(0, 110))
    items.push({
      id,
      fileName: `${template.slug}-${requestId}.${template.name.split('.').pop()}`,
      originalName: template.name,
      filePath: `/mock-files/${template.slug}-${requestId}`,
      fileSize: template.size + rng.int(0, 40_000),
      mimeType: template.mimeType,
      uploadDate: uploadDay.toISOString(),
      applicationId: requestId,
    })
  }

  return items
}

export const attachmentsSeed: AttachmentEntity[] = [...CURATED, ...generatedAttachments()].map(toEntity)
