import { useMemo, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { Catalogos, Registro } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { exportRequerimiento } from '../lib/excelExport';

interface Props {
  catalogos: Catalogos;
  registros: Registro[];
}

export default function PreviewView({ catalogos, registros }: Props) {
  const [exporting, setExporting] = useState(false);

  const grupos = useMemo(() => {
    return catalogos.vendedores
      .map((v) => {
        const regs = registros.filter((r) => r.vendedorId === v.id);
        return {
          vendedor: v,
          registros: regs,
          subtotal: regs.reduce((s, r) => s + r.cantidad, 0),
        };
      })
      .filter((g) => g.registros.length > 0);
  }, [catalogos.vendedores, registros]);

  const totalesPorModelo = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of registros) map.set(r.modelo, (map.get(r.modelo) ?? 0) + r.cantidad);
    return catalogos.modelos.map((m) => ({ modelo: m.nombre, total: map.get(m.nombre) ?? 0 })).filter((m) => m.total > 0);
  }, [catalogos.modelos, registros]);

  const totalGlobal = registros.reduce((s, r) => s + r.cantidad, 0);

  async function handleExport() {
    setExporting(true);
    try {
      await exportRequerimiento(catalogos, registros);
    } finally {
      setExporting(false);
    }
  }

  if (registros.length === 0) {
    return (
      <Card className="p-8 text-center text-[var(--text-muted)]">
        Aún no hay registros capturados. Ve a la pestaña "Captura" para comenzar.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vista previa del requerimiento</h2>
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
                <th className="py-2 px-3">Motivo</th>
                <th className="py-2 px-3">Modelo</th>
                <th className="py-2 px-3">Pagará</th>
                <th className="py-2 px-3 text-right">Total Solicitado</th>
              </tr>
            </thead>
            <tbody>
              {g.registros.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]/60">
                  <td className="py-1.5 px-3">{r.cliente}</td>
                  <td className="py-1.5 px-3 text-[var(--text-muted)]">{r.motivo}</td>
                  <td className="py-1.5 px-3">{r.modelo}</td>
                  <td className="py-1.5 px-3">{r.pagara}</td>
                  <td className="py-1.5 px-3 text-right">{r.cantidad}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--surface-2)] font-semibold">
                <td className="py-2 px-3" colSpan={4}>
                  Subtotal
                </td>
                <td className="py-2 px-3 text-right">{g.subtotal}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      ))}

      <Card className="overflow-hidden">
        <div className="bg-black text-white px-4 py-2 font-semibold">Total por Modelo</div>
        <table className="w-full text-sm">
          <tbody>
            {totalesPorModelo.map((m) => (
              <tr key={m.modelo} className="border-b border-[var(--border)]/60">
                <td className="py-2 px-3 font-medium">{m.modelo}</td>
                <td className="py-2 px-3 text-right">{m.total}</td>
              </tr>
            ))}
            <tr className="bg-[var(--surface-2)] font-semibold">
              <td className="py-2 px-3">TOTAL GENERAL</td>
              <td className="py-2 px-3 text-right">{totalGlobal}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
