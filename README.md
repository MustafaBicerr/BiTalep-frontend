# BiTalep Frontend

Kurumsal talep ve başvuru yönetim sistemi — staj projesi frontend uygulaması.

## Project Description

BiTalep, personel ve yöneticilerin izin, eğitim, avans, malzeme ve görev taleplerini oluşturup takip edebildiği bir SPA’dır. Geliştirme ortamında `VITE_API_MODE=mock` ile çalışan in-memory mock backend kullanır; gerçek API’ye geçiş repository factory üzerinden yapılır.

## Features

- Rol bazlı paneller (PERSONEL / ADMIN)
- Talep listesi, oluşturma, düzenleme, detay, onay/red
- Onay kuyruğu, başvuran filtresi, kullanıcı arama
- Dashboard KPI’ları, haftalık trend, bekleyen onaylar
- Raporlar: client-side Excel (`.xlsx`) export
- Bildirimler, global arama (Ctrl/Cmd+K), profil ve ayarlar
- Dosya listesi, i18n (tr/en), light tema
- Mock seed: ~28 kullanıcı, ~36 talep (persist `seedVersion`)

## Technologies

- Vite 5, React 18, TypeScript
- Tailwind CSS v3, shadcn/ui, Lucide
- TanStack Query, Axios, Zustand
- React Hook Form + Zod
- react-i18next, Recharts, Sonner, SheetJS (`xlsx`)

## Installation

```bash
cd BiTalep-frontend
npm install
npm run logo          # logo varyantlarını üretir (opsiyonel, public/ doluysa gerekmez)
npm run dev           # http://localhost:5173
```

### Demo giriş bilgileri (mock)

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@bitalep.com | Test1234! | ADMIN |
| mehmet@bitalep.com | Test1234! | PERSONEL |

### Scripts

| Script | Açıklama |
|--------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run preview` | Build önizleme |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run lint` | ESLint |
| `npm run logo` | Logo pipeline (sharp) |

## Database

Gerçek veritabanı yoktur. Mock katmanı `src/mock/store/MockStore.ts` içinde tutulur; `VITE_MOCK_PERSIST=true` iken `localStorage` anahtarı `bitalep-mock-store` kullanılır. Sıfırlamak için konsolda `window.__MOCK_STORE__.reset()`.

## API Endpoints

Mock ve HTTP repository’ler aynı sözleşmeyi uygular (`agent_rules/mock_rules/mock_api_contract.md`):

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |
| GET/PUT | `/api/users/me` |
| GET | `/api/users` |
| GET/POST/PUT/DELETE | `/api/forms` |
| PUT | `/api/forms/{id}/approve` |
| PUT | `/api/forms/{id}/reject` |
| GET | `/api/dashboard` |
| GET | `/api/notifications` |
| POST | `/api/files/upload` |

## Screenshots

Uygulama açıldıktan sonra login, dashboard ve talep listesi ekranları tarayıcıda incelenebilir.

## Project Structure

```
src/
  components/   # ui, atoms, molecules, organisms, templates
  pages/        # feature sayfaları
  hooks/        # TanStack Query hooks
  services/     # public API
  repositories/ # mock + http + factory
  mock/         # store, seeds, engine
  locales/      # tr + en
  routes/       # routing + guards
```

## Future Improvements

- Gerçek backend bağlantısı (`VITE_API_MODE=real`)
- Dosya önizleme (PDF/iframe) ve sürükle-bırak yükleme UI’sinin genişletilmesi
- E2E testleri (Playwright)
- Bildirim WebSocket / SSE

## License

Staj / eğitim amaçlı proje.
