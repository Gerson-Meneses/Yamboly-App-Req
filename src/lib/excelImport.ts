import ExcelJS from 'exceljs';
import { v4 as uuid } from 'uuid';
import type { Catalogos, Registro, Vendedor, Modelo, Motivo } from '../types';

export interface ImportResult {
  catalogos: Catalogos;
  registros: Registro[];
  stats: {
    vendedoresNuevos: number;
    registrosImportados: number;
  };
}

function textOf(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    // Rich text or formula result
    const anyVal = value as { text?: string; richText?: { text: string }[]; result?: unknown };
    if (anyVal.richText) return anyVal.richText.map((r) => r.text).join('');
    if (anyVal.text) return anyVal.text;
    if (anyVal.result !== undefined) return String(anyVal.result);
    return '';
  }
  return String(value).trim();
}

function numOf(value: ExcelJS.CellValue): number | null {
  const t = textOf(value);
  if (!t) return null;
  const n = parseFloat(t.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function normalizePagara(value: string): 'Sí' | 'No' {
  const v = value.trim().toLowerCase();
  if (v === 'si' || v === 'sí' || v === 's' || v === 'yes') return 'Sí';
  return 'No';
}

/**
 * Parses an .xlsx buffer that follows the same general layout used by the
 * app export (or the original physical report): a title row, a header row
 * containing "Cliente", then blocks of `CODIGO: Nombre` section headers
 * followed by data rows, "Subtotal" rows, and a trailing "Total Por Modelo"
 * section. Vendors, motivos and modelos not already present in the current
 * catalogs are created automatically.
 */
export async function importRequerimiento(
  file: File,
  catalogosActuales: Catalogos
): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('El archivo no contiene hojas de cálculo.');

  const vendedores: Vendedor[] = [...catalogosActuales.vendedores];
  const modelos: Modelo[] = [...catalogosActuales.modelos];
  const motivos: Motivo[] = [...catalogosActuales.motivos];
  const nuevosRegistros: Registro[] = [];

  function findOrCreateModelo(nombre: string): Modelo | null {
    if (!nombre) return null;
    let m = modelos.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (!m) {
      m = { id: uuid(), nombre };
      modelos.push(m);
    }
    return m;
  }

  function findOrCreateMotivo(nombre: string): Motivo | null {
    if (!nombre) return null;
    let m = motivos.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (!m) {
      m = { id: uuid(), nombre };
      motivos.push(m);
    }
    return m;
  }

  let vendedoresNuevos = 0;

  function findOrCreateVendedor(codigo: string, nombre: string): Vendedor {
    let v = vendedores.find(
      (x) =>
        x.nombre.toLowerCase() === nombre.toLowerCase() &&
        (!codigo || x.codigo.toLowerCase() === codigo.toLowerCase())
    );
    if (!v) {
      const codigoFinal = codigo || `V${vendedores.length + 1}`;
      v = { id: uuid(), codigo: codigoFinal, nombre, activo: true };
      vendedores.push(v);
      vendedoresNuevos++;
    }
    return v;
  }

  let stage: 'seeking-header' | 'data' | 'done' = 'seeking-header';
  let currentVendedor: Vendedor | null = null;
  let lastCliente = '';

  ws.eachRow((row) => {
    if (stage === 'done') return;

    const c1 = textOf(row.getCell(1).value);
    const c2 = textOf(row.getCell(2).value);
    const c3 = textOf(row.getCell(3).value);
    const c4 = textOf(row.getCell(4).value);
    const c5raw = row.getCell(5).value;
    const c6raw = row.getCell(6).value;
    const c5text = textOf(c5raw);

    if (stage === 'seeking-header') {
      if (c1.toLowerCase() === 'cliente') {
        stage = 'data';
      }
      return;
    }

    // stage === 'data'

    // A merged section/title row repeats the SAME text in every column
    // (that's how ExcelJS reports merged-cell values), so compare against c1
    // rather than assuming the other columns are blank.
    const sameAsC1 = (v: string) => !v || v === c1;

    if (!c1 && !c2 && !c3 && !c4 && !c5text) return; // truly blank separator row

    if (c1) {
      const c1Lower = c1.toLowerCase();

      if (c1Lower.startsWith('total por modelo')) {
        stage = 'done';
        return;
      }

      if (c1Lower === 'subtotal' || c1Lower.startsWith('total general')) {
        return; // computed values, nothing to import
      }

      if (c1Lower.startsWith('conformidad')) return;

      const otherColsMatchOrEmpty = sameAsC1(c2) && sameAsC1(c3) && sameAsC1(c4) && sameAsC1(c5text);
      if (otherColsMatchOrEmpty) {
        // Section header row: "V1: Nombre" (or just "Nombre")
        const match = c1.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          currentVendedor = findOrCreateVendedor(match[1].trim(), match[2].trim());
        } else {
          currentVendedor = findOrCreateVendedor('', c1);
        }
        lastCliente = '';
        return;
      }
    }

    // Data row — Cliente can be blank when the cell is merged vertically
    // across several key requests for the same client.
    if (!currentVendedor) return;

    const clienteTexto = c1 || lastCliente;
    if (!clienteTexto) return;
    lastCliente = clienteTexto;

    const modelo = findOrCreateModelo(c3);
    const motivo = c2 ? findOrCreateMotivo(c2) : null;
    const cantidad = numOf(c5raw) ?? 1;
    const totalEntregado = numOf(c6raw);

    nuevosRegistros.push({
      id: uuid(),
      vendedorId: currentVendedor.id,
      cliente: clienteTexto.toUpperCase(),
      motivo: motivo?.nombre ?? '',
      modelo: modelo?.nombre ?? c3,
      pagara: normalizePagara(c4),
      cantidad,
      totalEntregado: totalEntregado ?? undefined,
    });
  });

  if (nuevosRegistros.length === 0) {
    throw new Error(
      'No se encontraron registros de clientes. Verifica que el archivo tenga una fila de encabezado con "Cliente" y bloques por vendedor (ej. "V1: Nombre").'
    );
  }

  return {
    catalogos: { vendedores, modelos, motivos },
    registros: nuevosRegistros,
    stats: { vendedoresNuevos, registrosImportados: nuevosRegistros.length },
  };
}
