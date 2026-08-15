export interface Vendedor {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Modelo {
  id: string;
  nombre: string;
}

export interface Motivo {
  id: string;
  nombre: string;
}

export interface Registro {
  id: string;
  vendedorId: string;
  cliente: string;
  motivo: string;
  modelo: string;
  pagara: 'Sí' | 'No';
  cantidad: number;
  totalEntregado?: number | null;
}

export interface Apertura {
  id: string;
  vendedorId: string;
  cliente: string;
  cantidad: number;
  monto?: number | null;
  zona?: string;
  dia?: string;
  pagada: boolean;
}

export interface Catalogos {
  vendedores: Vendedor[];
  modelos: Modelo[];
  motivos: Motivo[];
}

export interface AppState {
  catalogos: Catalogos;
  registros: Registro[];
  aperturas: Apertura[];
  theme: 'light' | 'dark';
}
