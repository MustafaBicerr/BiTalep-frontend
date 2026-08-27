/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_MOCK_DELAY_MS: string
  readonly VITE_MOCK_PERSIST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __MOCK_STORE__?: unknown
  __MOCK_ERROR__?: string | null
}
