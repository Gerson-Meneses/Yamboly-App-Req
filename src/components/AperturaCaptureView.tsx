import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, ArrowRight, Users, Pencil, Check, X } from 'lucide-react';
import type { Catalogos, Apertura } from '../types';
import Button from './ui/Button';
import { Input, Select, Label } from './ui/Field';
import { Card, Badge } from './ui/Card';

interface Props {
  catalogos: Catalogos;
  aperturas: Apertura[];
  setAperturas: (a: Apertura[]) => void;
}

export default function AperturaCaptureView({ catalogos, aperturas, setAperturas }: Props) {
  const vendedoresActivos = catalogos.vendedores.filter((v) => v.activo);
  const [vendedorId, setVendedorId] = useState<string>(vendedoresActivos[0]?.id ?? '');

  const [cliente, setCliente] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [monto, setMonto] = useState('');
  const [zona, setZona] = useState('');
  const [dia, setDia] = useState('');
  const [pagada, setPagada] = useState(false);

  const vendedorActual = catalogos.vendedores.find((v) => v.id === vendedorId);
  const aperturasVendedor = useMemo(
    () => aperturas.filter((a) => a.vendedorId === vendedorId),
    [aperturas, vendedorId]
  );

  function agregar() {
    if (!vendedorId || !cliente.trim()) return;
    const nueva: Apertura = {
      id: uuid(),
      vendedorId,
      cliente: cliente.trim().toUpperCase(),
      cantidad: cantidad || 1,
      monto: monto.trim() ? parseFloat(monto) : null,
      zona: zona.trim(),
      dia: dia.trim(),
      pagada,
    };
    setAperturas([...aperturas, nueva]);
    setCliente('');
    setCantidad(1);
    setMonto('');
    setZona('');
    setDia('');
    setPagada(false);
  }

  function eliminar(id: string) {
    setAperturas(aperturas.filter((a) => a.id !== id));
  }

  const [editId, setEditId] = useState<string | null>(null);
  const [editCliente, setEditCliente] = useState('');
  const [editCantidad, setEditCantidad] = useState(1);
  const [editMonto, setEditMonto] = useState('');
  const [editZona, setEditZona] = useState('');
  const [editDia, setEditDia] = useState('');
  const [editPagada, setEditPagada] = useState(false);

  function startEdit(a: Apertura) {
    setEditId(a.id);
    setEditCliente(a.cliente);
    setEditCantidad(a.cantidad);
    setEditMonto(a.monto != null ? String(a.monto) : '');
    setEditZona(a.zona ?? '');
    setEditDia(a.dia ?? '');
    setEditPagada(a.pagada);
  }

  function saveEdit() {
    if (!editCliente.trim()) return;
    setAperturas(
      aperturas.map((a) =>
        a.id === editId
          ? {
              ...a,
              cliente: editCliente.trim().toUpperCase(),
              cantidad: editCantidad || 1,
              monto: editMonto.trim() ? parseFloat(editMonto) : null,
              zona: editZona.trim(),
              dia: editDia.trim(),
              pagada: editPagada,
            }
          : a
      )
    );
    setEditId(null);
  }

  const resumen = catalogos.vendedores
    .map((v) => {
      const apts = aperturas.filter((a) => a.vendedorId === v.id);
      return {
        vendedor: v,
        clientes: apts.length,
        aperturas: apts.reduce((s, a) => s + a.cantidad, 0),
        pagadas: apts.filter((a) => a.pagada).reduce((s, a) => s + a.cantidad, 0),
      };
    })
    .filter((r) => r.clientes > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card className="p-4">
          <Label>Paso 1 · Selecciona vendedor</Label>
          <Select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
            {vendedoresActivos.length === 0 && <option value="">Sin vendedores activos</option>}
            {vendedoresActivos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.codigo}: {v.nombre}
              </option>
            ))}
          </Select>
          {vendedorActual && (
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="accent">
                <Users size={12} /> {vendedorActual.codigo}: {vendedorActual.nombre}
              </Badge>
              <Badge tone="muted">{aperturasVendedor.length} cliente(s)</Badge>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Label>Paso 2 · Formulario rápido de apertura</Label>
          <div className="grid sm:grid-cols-2 gap-3 mt-1">
            <div className="sm:col-span-2">
              <Input
                placeholder="Nombre del cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregar()}
              />
            </div>
            <Input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              placeholder="Cantidad"
            />
            <label className="flex items-center gap-2 text-sm px-1">
              <input
                type="checkbox"
                checked={pagada}
                onChange={(e) => setPagada(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              Pagada
            </label>
            <div>
              <Label>Monto (opcional)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="S/ 0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>
            <div>
              <Label>Zona (opcional)</Label>
              <Input placeholder="Zona" value={zona} onChange={(e) => setZona(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Día de apertura (opcional)</Label>
              <Input placeholder="Ej. 14/08/2026" value={dia} onChange={(e) => setDia(e.target.value)} />
            </div>
          </div>
          <Button variant="primary" className="mt-3 w-full" onClick={agregar} disabled={!vendedorId}>
            <Plus size={16} /> Agregar
          </Button>
        </Card>

        <Card className="p-4">
          <Label>Paso 3 · Aperturas de {vendedorActual ? vendedorActual.nombre : 'vendedor'}</Label>
          {aperturasVendedor.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">Aún no hay aperturas para este vendedor.</p>
          ) : (
            <div className="overflow-auto mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                    <th className="py-1.5 pr-2">Cliente</th>
                    <th className="py-1.5 pr-2 text-right">Cant.</th>
                    <th className="py-1.5 pr-2">Monto</th>
                    <th className="py-1.5 pr-2">Zona</th>
                    <th className="py-1.5 pr-2">Día</th>
                    <th className="py-1.5 pr-2">Pagada</th>
                    <th className="py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {aperturasVendedor.map((a) =>
                    editId === a.id ? (
                      <tr key={a.id} className="border-b border-[var(--border)]/60 bg-[var(--surface-2)]">
                        <td className="py-1.5 pr-2">
                          <Input
                            value={editCliente}
                            onChange={(e) => setEditCliente(e.target.value)}
                            className="!py-1"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          />
                        </td>
                        <td className="py-1.5 pr-2 text-right">
                          <Input
                            type="number"
                            min={1}
                            value={editCantidad}
                            onChange={(e) => setEditCantidad(parseInt(e.target.value) || 1)}
                            className="!py-1 text-right"
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editMonto}
                            onChange={(e) => setEditMonto(e.target.value)}
                            className="!py-1"
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input value={editZona} onChange={(e) => setEditZona(e.target.value)} className="!py-1" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input value={editDia} onChange={(e) => setEditDia(e.target.value)} className="!py-1" />
                        </td>
                        <td className="py-1.5 pr-2 text-center">
                          <input
                            type="checkbox"
                            checked={editPagada}
                            onChange={(e) => setEditPagada(e.target.checked)}
                            className="w-4 h-4 accent-[var(--accent)]"
                          />
                        </td>
                        <td className="py-1.5 text-right whitespace-nowrap">
                          <button onClick={saveEdit} title="Guardar">
                            <Check size={14} className="text-[var(--accent-2)]" />
                          </button>{' '}
                          <button onClick={() => setEditId(null)} title="Cancelar">
                            <X size={14} className="text-[var(--text-muted)]" />
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={a.id} className="border-b border-[var(--border)]/60">
                        <td className="py-1.5 pr-2">{a.cliente}</td>
                        <td className="py-1.5 pr-2 text-right">{a.cantidad}</td>
                        <td className="py-1.5 pr-2 text-[var(--text-muted)]">{a.monto != null ? a.monto : '—'}</td>
                        <td className="py-1.5 pr-2 text-[var(--text-muted)]">{a.zona || '—'}</td>
                        <td className="py-1.5 pr-2 text-[var(--text-muted)]">{a.dia || '—'}</td>
                        <td className="py-1.5 pr-2">
                          {a.pagada ? <Badge tone="success">Sí</Badge> : <Badge tone="muted">No</Badge>}
                        </td>
                        <td className="py-1.5 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(a)} title="Editar">
                            <Pencil size={14} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                          </button>{' '}
                          <button onClick={() => eliminar(a.id)} title="Eliminar">
                            <Trash2 size={14} className="text-[var(--danger)]" />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
          {vendedoresActivos.length > 1 && (
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => {
                const idx = vendedoresActivos.findIndex((v) => v.id === vendedorId);
                const next = vendedoresActivos[(idx + 1) % vendedoresActivos.length];
                setVendedorId(next.id);
              }}
            >
              Siguiente vendedor <ArrowRight size={14} />
            </Button>
          )}
        </Card>
      </div>

      <Card className="p-4 h-fit sticky top-4">
        <h3 className="font-semibold mb-3">Resumen de avance</h3>
        {resumen.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Sin aperturas aún.</p>
        ) : (
          <ul className="space-y-2">
            {resumen.map((r) => (
              <li
                key={r.vendedor.id}
                className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              >
                <span>
                  {r.vendedor.codigo}: {r.vendedor.nombre}
                </span>
                <span className="text-[var(--text-muted)]">
                  {r.clientes} cliente{r.clientes !== 1 ? 's' : ''} / {r.aperturas} apertura{r.aperturas !== 1 ? 's' : ''} ({r.pagadas} pagada{r.pagadas !== 1 ? 's' : ''})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
