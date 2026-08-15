import ExcelJS from 'exceljs';
import type { Catalogos, Registro } from '../types';

const COLS = ['Cliente', 'Motivo', 'Modelo', 'Pagará', 'Total Solicitado', 'Total Entregado'];
const NUM_COLS = COLS.length;

const thin = { style: 'thin' as const, color: { argb: 'FF000000' } };
const allBorders = { top: thin, center: thin, bottom: thin, right: thin };

function fecha(): string {
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];
  const d = new Date();
  return `${d.getDate()} DE ${meses[d.getMonth()]} DE ${d.getFullYear()}`;
}

function fechaArchivo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export async function exportRequerimiento(catalogos: Catalogos, registros: Registro[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Generador de Requerimiento de Llaves';
  wb.created = new Date();

  const ws = wb.addWorksheet('Requerimiento', {
    pageSetup: { horizontalCentered: true, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  let row = 1;

  // Title
  ws.mergeCells(row, 1, row, NUM_COLS);
  const titleCell = ws.getCell(row, 1);
  titleCell.value = `REQUERIMIENTO DE LLAVES ${fecha()}`;
  titleCell.font = { bold: true, size: 13, color: { argb: '000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  ws.getRow(row).height = 22;
  for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
  row++;

  // Header
  const headerRow = ws.getRow(row);
  COLS.forEach((label, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = allBorders;
  });
  headerRow.height = 24;
  row++;

  const vendedoresActivos = catalogos.vendedores.filter((v) =>
    registros.some((r) => r.vendedorId === v.id)
  );

  const totalesPorModelo = new Map<string, number>();
  let totalGlobal = 0;

  for (const vendedor of vendedoresActivos) {
    const regsVendedor = registros.filter((r) => r.vendedorId === vendedor.id);
    if (regsVendedor.length === 0) continue;

    // Section header
    ws.mergeCells(row, 1, row, NUM_COLS);
    const secCell = ws.getCell(row, 1);
    secCell.value = `${vendedor.codigo}: ${vendedor.nombre}`;
    secCell.font = { bold: true };
    secCell.alignment = { horizontal: 'center', vertical: 'middle' };
    secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;

    const subtotalStartRow = row;
    for (const r of regsVendedor) {
      const dataRow = ws.getRow(row);
      dataRow.getCell(1).value = r.cliente;
      dataRow.getCell(2).value = r.motivo || '';
      dataRow.getCell(3).value = r.modelo;
      dataRow.getCell(4).value = r.pagara || '';
      dataRow.getCell(5).value = r.cantidad;
      dataRow.getCell(6).value = r.totalEntregado ?? '';
      dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      for (let c = 2; c <= NUM_COLS; c++) {
        dataRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      for (let c = 1; c <= NUM_COLS; c++) dataRow.getCell(c).border = allBorders;

      totalesPorModelo.set(r.modelo, (totalesPorModelo.get(r.modelo) ?? 0) + r.cantidad);
      totalGlobal += r.cantidad;
      row++;
    }
    const subtotalEndRow = row - 1;

    // Subtotal row
    ws.mergeCells(row, 1, row, NUM_COLS - 2);
    const subLabel = ws.getCell(row, 1);
    subLabel.value = 'Subtotal';
    subLabel.font = { bold: true };
    subLabel.alignment = { horizontal: 'center', vertical: 'middle' };
    const subValueCell = ws.getCell(row, NUM_COLS - 1);
    subValueCell.value = { formula: `SUM(E${subtotalStartRow}:E${subtotalEndRow})` } as ExcelJS.CellFormulaValue;
    subValueCell.font = { bold: true };
    subValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
    for (let c = 1; c <= NUM_COLS; c++) {
      ws.getCell(row, c).border = allBorders;
      ws.getCell(row, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
    }
    row++;

    // Conformidad / firma row
    ws.mergeCells(row, 1, row, 6);
    const firmaLabel = ws.getCell(row, 1);
    firmaLabel.value = 'Conformidad de entrega — Firma:';
    firmaLabel.alignment = { horizontal: 'center', vertical: 'middle' };
    firmaLabel.font = { italic: false, size: 11 };

    ws.getRow(row).height = 26;
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;
  }

  // Total por modelo section
  row++;
  ws.mergeCells(row, 1, row, NUM_COLS);
  const totModCell = ws.getCell(row, 1);
  totModCell.value = 'Total Por Modelo';
  totModCell.font = { bold: true, color: { argb: '000000' } };
  totModCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totModCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
  row++;

  for (const modelo of catalogos.modelos) {
    const total = totalesPorModelo.get(modelo.nombre);
    if (!total) continue;
    ws.mergeCells(row, 1, row, NUM_COLS - 2);
    const modLabel = ws.getCell(row, 1);
    modLabel.value = modelo.nombre;
    modLabel.font = { bold: true };
    modLabel.alignment = { horizontal: 'center', vertical: 'middle' };
    const modValue = ws.getCell(row, NUM_COLS - 1);
    modValue.value = total;
    modValue.font = { bold: true };
    modValue.alignment = { horizontal: 'center', vertical: 'middle' };
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;
  }

  // Grand total
  ws.mergeCells(row, 1, row, NUM_COLS - 2);
  const totalLabel = ws.getCell(row, 1);
  totalLabel.value = 'TOTAL GENERAL';
  totalLabel.font = { bold: true };
  totalLabel.alignment = { horizontal: 'center', vertical: 'middle' };
  const totalValue = ws.getCell(row, NUM_COLS - 1);
  totalValue.value = totalGlobal;
  totalValue.font = { bold: true };
  totalValue.alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 1; c <= NUM_COLS; c++) {
    ws.getCell(row, c).border = allBorders;
    ws.getCell(row, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  }

  // Auto-ajuste de ancho de columnas según contenido
  ws.columns?.forEach((column) => {
    if (!column || typeof column.eachCell !== 'function') return;

    let maxLength = 10;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const master = cell.master;
      if (master && master.address !== cell.address) return;

      let cellLength = 0;

      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === 'object') {
          if ('formula' in cell.value) {
            cellLength = 10;
          } else if ('result' in cell.value && cell.value.result) {
            cellLength = cell.value.result.toString().length;
          } else if ('richText' in cell.value && Array.isArray(cell.value.richText)) {
            cellLength = cell.value.richText.reduce((acc, t) => acc + t.text.length, 0);
          }
        } else {
          cellLength = cell.value.toString().length;
        }
      }

      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });

    column.width = Math.min(maxLength + 1, 50);
  });

  ws.pageSetup.printTitlesRow = '1:2';

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Requerimiento_de_Llaves_${fechaArchivo()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}