import { useMemo, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { Catalogos, Apertura } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { exportAperturas } from '../lib/excelExportAperturas';

interface Props {
  catalogos: Catalogos;
  aperturas: Apertura[];
}

export default function AperturaPreviewView({ catalogos, aperturas }: Props) {
  const [exporting, setExporting] = useState(false);

  const usaMonto = aperturas.some((a) => a.monto !== null && a.monto !== undefined);
  const usaZona = aperturas.some((a) => (a.zona ?? '').trim() !== '');
  const usaDia = aperturas.some((a) => (a.dia ?? '').trim() !== '');

  const grupos = useMemo(() => {
    return catalogos.vendedores
      .map((v) => {
        const apts = aperturas.filter((a) => a.vendedorId === v.id);
        return {
          vendedor: v,
          aperturas: apts,
          subtotal: apts.reduce((s, a) => s + a.cantidad, 0),
          pagadas: apts.filter((a) => a.pagada).reduce((s, a) => s + a.cantidad, 0),
        };
      })
      .filter((g) => g.aperturas.length > 0);
  }, [catalogos.vendedores, aperturas]);

  const totalGlobal = aperturas.reduce((s, a) => s + a.cantidad, 0);
  const pagadasGlobal = aperturas.filter((a) => a.pagada).reduce((s, a) => s + a.cantidad, 0);

  async function handleExport() {
    setExporting(true);
    try {
      await exportAperturas(catalogos, aperturas);
    } finally {
      setExporting(false);
    }
  }

  if (aperturas.length === 0) {
    return (
      <Card className="p-8 text-center text-[var(--text-muted)]">
        Aún no hay aperturas capturadas. Ve a la pestaña "Aperturas" para comenzar.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vista previa de aperturas</h2>
        <Button variant="primary" onClick={handleExport} disabled={exporting}>
          <FileSpreadsheet size={16} /> {exporting ? 'Generando…' : 'Exportar a Excel'}
        </Button>
      </div>

      {grupos.map((g) => (
        <Card key={g.vendedor.id} className="overflow-hidden">
          <div className="bg-[var(--surface-2)] px-4 py-2 font-semibold border-b border-[var(--border)]">
            {g.vendedor.codigo}: {g.vendedor.nombre}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="py-2 px-3">Cliente</th>
                {usaMonto && <th className="py-2 px-3">Monto</th>}
                {usaZona && <th className="py-2 px-3">Zona</th>}
                {usaDia && <th className="py-2 px-3">Día</th>}
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-right">Pagadas</th>
              </tr>
            </thead>
            <tbody>
              {g.aperturas.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)]/60">
                  <td className="py-1.5 px-3">{a.cliente}</td>
                  {usaMonto && <td className="py-1.5 px-3">{a.monto != null ? a.monto : ''}</td>}
                  {usaZona && <td className="py-1.5 px-3">{a.zona || ''}</td>}
                  {usaDia && <td className="py-1.5 px-3">{a.dia || ''}</td>}
                  <td className="py-1.5 px-3 text-right">{a.cantidad}</td>
                  <td className="py-1.5 px-3 text-right">{a.pagada ? a.cantidad : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--surface-2)] font-semibold">
                <td className="py-2 px-3" colSpan={1 + (usaMonto ? 1 : 0) + (usaZona ? 1 : 0) + (usaDia ? 1 : 0)}>
                  Subtotal
                </td>
                <td className="py-2 px-3 text-right">{g.subtotal}</td>
                <td className="py-2 px-3 text-right">{g.pagadas}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      ))}

      <Card className="overflow-hidden">
        <div className="bg-black text-white px-4 py-2 font-semibold flex items-center justify-between">
          <span>Aperturas Totales</span>
          <span>
            {totalGlobal} / {pagadasGlobal} pagadas
          </span>
        </div>
      </Card>
    </div>
  );
}
