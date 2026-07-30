/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPOINTMENT_ENDPOINT?: string;
  readonly VITE_VEHICLE_SALE_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
