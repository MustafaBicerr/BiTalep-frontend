import { FormType, RequestStatus } from '@/types/enums'
import type { RequestEntity } from '@/types/request.types'

function daysAgo(days: number, hour = 10): string {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * 15 requests — NEW3 / IN_REVIEW4 / APPROVED4 / REJECTED2 / CANCELLED2
 * Date mix: 3 today, 5 this week, 7 older. All form types covered.
 */
export function createRequestsSeed(): RequestEntity[] {
  const today0 = daysAgo(0, 9)
  const today1 = daysAgo(0, 11)
  const today2 = daysAgo(0, 14)

  const week1 = daysAgo(1, 10)
  const week2 = daysAgo(2, 15)
  const week3 = daysAgo(3, 9)
  const week4 = daysAgo(4, 13)
  const week5 = daysAgo(5, 11)

  const old1 = daysAgo(14, 10)
  const old2 = daysAgo(21, 9)
  const old3 = daysAgo(28, 14)
  const old4 = daysAgo(35, 11)
  const old5 = daysAgo(40, 16)
  const old6 = daysAgo(45, 10)
  const old7 = daysAgo(50, 8)

  return [
    {
      id: 1,
      title: 'Yıllık izin talebi',
      description: 'Aile ziyareti için 5 günlük yıllık izin talep ediyorum.',
      formType: FormType.LEAVE,
      status: RequestStatus.NEW,
      applicantId: 3,
      createdDate: today0,
      updatedDate: today0,
      timeline: [{ status: RequestStatus.NEW, date: today0, description: 'Talep oluşturuldu' }],
    },
    {
      id: 2,
      title: 'React eğitimi katılımı',
      description: 'Şirket içi React ileri seviye eğitimine katılım talebi.',
      formType: FormType.TRAINING,
      status: RequestStatus.NEW,
      applicantId: 4,
      createdDate: today1,
      updatedDate: today1,
      timeline: [{ status: RequestStatus.NEW, date: today1, description: 'Talep oluşturuldu' }],
    },
    {
      id: 3,
      title: 'Acil avans talebi',
      description: 'Beklenmeyen sağlık giderleri için avans talebi.',
      formType: FormType.ADVANCE,
      status: RequestStatus.NEW,
      applicantId: 5,
      createdDate: today2,
      updatedDate: today2,
      timeline: [{ status: RequestStatus.NEW, date: today2, description: 'Talep oluşturuldu' }],
    },
    {
      id: 4,
      title: 'Ofis malzemesi siparişi',
      description: 'Klavye, mouse ve defter seti talebi.',
      formType: FormType.MATERIAL,
      status: RequestStatus.IN_REVIEW,
      applicantId: 6,
      createdDate: week1,
      updatedDate: week1,
      timeline: [
        { status: RequestStatus.NEW, date: week1, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(1, 12),
          description: 'İncelemeye alındı',
        },
      ],
    },
    {
      id: 5,
      title: 'Proje görev ataması',
      description: 'Q3 raporlama görevine atanma talebi.',
      formType: FormType.TASK,
      status: RequestStatus.IN_REVIEW,
      applicantId: 7,
      createdDate: week2,
      updatedDate: week2,
      timeline: [
        { status: RequestStatus.NEW, date: week2, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(2, 16),
          description: 'İncelemeye alındı',
        },
      ],
    },
    {
      id: 6,
      title: 'Hastalık izni',
      description: 'Doktor raporu ile 3 günlük hastalık izni.',
      formType: FormType.LEAVE,
      status: RequestStatus.IN_REVIEW,
      applicantId: 3,
      createdDate: week3,
      updatedDate: week3,
      timeline: [
        { status: RequestStatus.NEW, date: week3, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(3, 11),
          description: 'İncelemeye alındı',
        },
      ],
    },
    {
      id: 7,
      title: 'Güvenlik eğitimi',
      description: 'Bilgi güvenliği farkındalık eğitimi kaydı.',
      formType: FormType.TRAINING,
      status: RequestStatus.IN_REVIEW,
      applicantId: 4,
      createdDate: week4,
      updatedDate: week4,
      timeline: [
        { status: RequestStatus.NEW, date: week4, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(4, 14),
          description: 'İncelemeye alındı',
        },
      ],
    },
    {
      id: 8,
      title: 'Maaş avansı',
      description: 'Ay ortası maaş avansı talebi.',
      formType: FormType.ADVANCE,
      status: RequestStatus.APPROVED,
      applicantId: 5,
      createdDate: week5,
      updatedDate: daysAgo(4, 17),
      timeline: [
        { status: RequestStatus.NEW, date: week5, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(5, 12),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.APPROVED,
          date: daysAgo(4, 17),
          description: 'Talep onaylandı',
        },
      ],
    },
    {
      id: 9,
      title: 'Monitor talebi',
      description: 'İkinci monitör için malzeme talebi.',
      formType: FormType.MATERIAL,
      status: RequestStatus.APPROVED,
      applicantId: 6,
      createdDate: old1,
      updatedDate: daysAgo(12, 10),
      timeline: [
        { status: RequestStatus.NEW, date: old1, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(13, 9),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.APPROVED,
          date: daysAgo(12, 10),
          description: 'Talep onaylandı',
        },
      ],
    },
    {
      id: 10,
      title: 'Dokümantasyon görevi',
      description: 'API dokümantasyonu güncelleme görevi.',
      formType: FormType.TASK,
      status: RequestStatus.APPROVED,
      applicantId: 7,
      createdDate: old2,
      updatedDate: daysAgo(18, 11),
      timeline: [
        { status: RequestStatus.NEW, date: old2, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(20, 10),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.APPROVED,
          date: daysAgo(18, 11),
          description: 'Talep onaylandı',
        },
      ],
    },
    {
      id: 11,
      title: 'Evlilik izni',
      description: 'Evlilik nedeniyle 3 günlük izin talebi.',
      formType: FormType.LEAVE,
      status: RequestStatus.APPROVED,
      applicantId: 3,
      createdDate: old3,
      updatedDate: daysAgo(25, 15),
      timeline: [
        { status: RequestStatus.NEW, date: old3, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(27, 10),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.APPROVED,
          date: daysAgo(25, 15),
          description: 'Talep onaylandı',
        },
      ],
    },
    {
      id: 12,
      title: 'Docker workshop',
      description: 'Harici Docker workshop katılım ücreti talebi.',
      formType: FormType.TRAINING,
      status: RequestStatus.REJECTED,
      applicantId: 4,
      createdDate: old4,
      updatedDate: daysAgo(32, 12),
      timeline: [
        { status: RequestStatus.NEW, date: old4, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(34, 9),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.REJECTED,
          date: daysAgo(32, 12),
          description: 'Bütçe yetersizliği nedeniyle reddedildi',
        },
      ],
    },
    {
      id: 13,
      title: 'Ekipman avansı',
      description: 'Kişisel laptop onarımı için avans.',
      formType: FormType.ADVANCE,
      status: RequestStatus.REJECTED,
      applicantId: 5,
      createdDate: old5,
      updatedDate: daysAgo(38, 14),
      timeline: [
        { status: RequestStatus.NEW, date: old5, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.IN_REVIEW,
          date: daysAgo(39, 10),
          description: 'İncelemeye alındı',
        },
        {
          status: RequestStatus.REJECTED,
          date: daysAgo(38, 14),
          description: 'Politika kapsamı dışında',
        },
      ],
    },
    {
      id: 14,
      title: 'Yazıcı toner',
      description: 'Kat yazıcısı için toner kartuşu.',
      formType: FormType.MATERIAL,
      status: RequestStatus.CANCELLED,
      applicantId: 6,
      createdDate: old6,
      updatedDate: daysAgo(44, 9),
      timeline: [
        { status: RequestStatus.NEW, date: old6, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.CANCELLED,
          date: daysAgo(44, 9),
          description: 'Başvuran tarafından iptal edildi',
        },
      ],
    },
    {
      id: 15,
      title: 'Sprint görev iptali',
      description: 'Yanlışlıkla oluşturulan görev talebi iptal edildi.',
      formType: FormType.TASK,
      status: RequestStatus.CANCELLED,
      applicantId: 7,
      createdDate: old7,
      updatedDate: daysAgo(49, 10),
      timeline: [
        { status: RequestStatus.NEW, date: old7, description: 'Talep oluşturuldu' },
        {
          status: RequestStatus.CANCELLED,
          date: daysAgo(49, 10),
          description: 'Başvuran tarafından iptal edildi',
        },
      ],
    },
  ]
}
