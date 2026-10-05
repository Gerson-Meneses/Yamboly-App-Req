import ExcelJS from 'exceljs';
import type { Catalogos, Apertura } from '../types';

const thin = { style: 'thin' as const, color: { argb: 'FF000000' } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

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

export async function buildAperturasFile(catalogos: Catalogos, aperturas: Apertura[]): Promise<File> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Generador de Requerimiento de Llaves';
  wb.created = new Date();

  // Optional columns only get included in the file if at least one record uses them.
  const usaMonto = aperturas.some((a) => a.monto !== null && a.monto !== undefined);
  const usaZona = aperturas.some((a) => (a.zona ?? '').trim() !== '');
  const usaDia = aperturas.some((a) => (a.dia ?? '').trim() !== '');

  const cols: string[] = ['Cliente'];
  if (usaMonto) cols.push('Monto');
  if (usaZona) cols.push('Zona');
  if (usaDia) cols.push('Día');
  cols.push('Total', 'Pagadas');
  const NUM_COLS = cols.length;

  const idxTotal = cols.indexOf('Total') + 1;
  const idxPagadas = cols.indexOf('Pagadas') + 1;
  const idxMonto = usaMonto ? cols.indexOf('Monto') + 1 : -1;
  const idxZona = usaZona ? cols.indexOf('Zona') + 1 : -1;
  const idxDia = usaDia ? cols.indexOf('Día') + 1 : -1;

  const ws = wb.addWorksheet('Aperturas', {
    pageSetup: { horizontalCentered: true, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  let row = 1;

  // Title
  ws.mergeCells(row, 1, row, NUM_COLS);
  const titleCell = ws.getCell(row, 1);
  titleCell.value = `APERTURAS ${fecha()}`;
  titleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
  ws.getRow(row).height = 22;
  for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
  row++;

  // Header
  const headerRow = ws.getRow(row);
  cols.forEach((label, i) => {
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
    aperturas.some((a) => a.vendedorId === v.id)
  );

  let totalGlobal = 0;
  let pagadasGlobal = 0;

  for (const vendedor of vendedoresActivos) {
    const aptsVendedor = aperturas.filter((a) => a.vendedorId === vendedor.id);
    if (aptsVendedor.length === 0) continue;

    // Section header
    ws.mergeCells(row, 1, row, NUM_COLS);
    const secCell = ws.getCell(row, 1);
    secCell.value = `${vendedor.codigo}: ${vendedor.nombre}`;
    secCell.font = { bold: true };
    secCell.alignment = { horizontal: 'center', vertical: 'middle' };
    secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;

    const startRow = row;
    for (const a of aptsVendedor) {
      const dataRow = ws.getRow(row);
      dataRow.getCell(1).value = a.cliente;
      if (idxMonto > 0) dataRow.getCell(idxMonto).value = a.monto ?? '';
      if (idxZona > 0) dataRow.getCell(idxZona).value = a.zona ?? '';
      if (idxDia > 0) dataRow.getCell(idxDia).value = a.dia ?? '';
      dataRow.getCell(idxTotal).value = a.cantidad;
      dataRow.getCell(idxPagadas).value = a.pagada ? a.cantidad : '';

      dataRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      for (let c = 2; c <= NUM_COLS; c++) {
        dataRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      for (let c = 1; c <= NUM_COLS; c++) dataRow.getCell(c).border = allBorders;

      totalGlobal += a.cantidad;
      if (a.pagada) pagadasGlobal += a.cantidad;
      row++;
    }
    const endRow = row - 1;

    // Subtotal row
    const subtotalLabelSpan = NUM_COLS - 2;
    ws.mergeCells(row, 1, row, subtotalLabelSpan);
    const subLabel = ws.getCell(row, 1);
    subLabel.value = 'Subtotal';
    subLabel.font = { bold: true };
    subLabel.alignment = { horizontal: 'center', vertical: 'middle' };

    const subTotalCell = ws.getCell(row, idxTotal);
    subTotalCell.value = { formula: `SUM(${colLetter(idxTotal)}${startRow}:${colLetter(idxTotal)}${endRow})` } as ExcelJS.CellFormulaValue;
    subTotalCell.font = { bold: true };
    subTotalCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const subPagadasCell = ws.getCell(row, idxPagadas);
    subPagadasCell.value = {
      formula: `SUM(${colLetter(idxPagadas)}${startRow}:${colLetter(idxPagadas)}${endRow})`,
    } as ExcelJS.CellFormulaValue;
    subPagadasCell.font = { bold: true };
    subPagadasCell.alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= NUM_COLS; c++) {
      ws.getCell(row, c).border = allBorders;
      ws.getCell(row, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
    }
    row++;

    // Conformidad row
    ws.mergeCells(row, 1, row, NUM_COLS);
    const conf = ws.getCell(row, 1);
    conf.value = 'Conformidad de pago recibido — Firma:';
    conf.alignment = { horizontal: 'center', vertical: 'middle' };
    conf.font = { italic: true, size: 10 };
    ws.getRow(row).height = 22;
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;
  }

  // Grand total
  const totalLabelSpan = NUM_COLS - 2;
  ws.mergeCells(row, 1, row, totalLabelSpan);
  const totalLabel = ws.getCell(row, 1);
  totalLabel.value = 'Aperturas Totales';
  totalLabel.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totalLabel.alignment = { horizontal: 'center', vertical: 'middle' };
  totalLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

  const totalCell = ws.getCell(row, idxTotal);
  totalCell.value = totalGlobal;
  totalCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

  const pagadasCell = ws.getCell(row, idxPagadas);
  pagadasCell.value = pagadasGlobal;
  pagadasCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  pagadasCell.alignment = { horizontal: 'center', vertical: 'middle' };
  pagadasCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

  for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;

  // Column widths
  const widths: Record<string, number> = {
    Cliente: 32,
    Monto: 12,
    Zona: 16,
    'Día': 14,
    Total: 10,
    Pagadas: 10,
  };
  cols.forEach((label, i) => {
    ws.getColumn(i + 1).width = widths[label] ?? 14;
  });

  ws.pageSetup.printTitlesRow = '1:2';

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `Aperturas_${fechaArchivo()}.xlsx`;
  return new File([buffer], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
