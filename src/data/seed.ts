import type { Catalogos } from '../types';
import { v4 as uuid } from 'uuid';

export function seedCatalogos(): Catalogos {
  return {
    vendedores: [
      { id: uuid(), codigo: 'V1', nombre: 'Emanuel Meneses', activo: true },
      { id: uuid(), codigo: 'V2', nombre: 'Gerson Meneses', activo: true },
      { id: uuid(), codigo: 'V3', nombre: 'Silvia Correa', activo: true },
      { id: uuid(), codigo: 'V1159', nombre: 'Raysa Reyna', activo: true },
      { id: uuid(), codigo: 'V5', nombre: 'Jesus Garay', activo: true },
      { id: uuid(), codigo: 'V730', nombre: 'Lizeth Saavedra', activo: true },
      { id: uuid(), codigo: 'V1160', nombre: 'Rossy Caramantin', activo: true },
      { id: uuid(), codigo: 'V9', nombre: 'Hugo Pacherrez', activo: true },
    ],
    modelos: [
      { id: uuid(), nombre: 'Hiron' },
      { id: uuid(), nombre: 'Serrucho' },
      { id: uuid(), nombre: 'Liebherr' },
    ],
    motivos: [
      { id: uuid(), nombre: 'Llave Malograda' },
      { id: uuid(), nombre: 'Llave Perdida' },
      { id: uuid(), nombre: 'Apertura' },
      { id: uuid(), nombre: 'Nunca le dejaron' },
      { id: uuid(), nombre: 'No Especificado' },
    ],
  };
}
