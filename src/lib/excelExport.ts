import ExcelJS from 'exceljs';
import type { Catalogos, Registro } from '../types';

const COLS = ['Cliente', 'Motivo', 'Modelo', 'Pagará', 'Total Solicitado', 'Total Entregado'];
const NUM_COLS = COLS.length;

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

export async function buildRequerimientoFile(catalogos: Catalogos, registros: Registro[]): Promise<File> {
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
  titleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
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
      dataRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
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
    ws.mergeCells(row, 1, row, 3);
    const firmaLabel = ws.getCell(row, 1);
    firmaLabel.value = 'Conformidad de entrega — Firma:';
    firmaLabel.alignment = { horizontal: 'left', vertical: 'middle' };
    firmaLabel.font = { italic: true, size: 9 };

    ws.mergeCells(row, 4, row, 5);
    const entregadoLabel = ws.getCell(row, 4);
    entregadoLabel.value = 'Total entregado confirmado:';
    entregadoLabel.alignment = { horizontal: 'left', vertical: 'middle' };
    entregadoLabel.font = { italic: true, size: 9 };

    const fechaCell = ws.getCell(row, 6);
    fechaCell.value = 'Fecha: ____/____/______';
    fechaCell.alignment = { horizontal: 'left', vertical: 'middle' };
    fechaCell.font = { italic: true, size: 9 };

    ws.getRow(row).height = 26;
    for (let c = 1; c <= NUM_COLS; c++) ws.getCell(row, c).border = allBorders;
    row++;
  }

  // Total por modelo section
  row++;
  ws.mergeCells(row, 1, row, NUM_COLS);
  const totModCell = ws.getCell(row, 1);
  totModCell.value = 'Total Por Modelo';
  totModCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totModCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totModCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
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

  // Column widths (auto-fit approximation)
  const widths = [30, 20, 14, 10, 16, 16];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.pageSetup.printTitlesRow = '1:2';

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `Requerimiento_de_Llaves_${fechaArchivo()}.xlsx`;
  return new File([buffer], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
