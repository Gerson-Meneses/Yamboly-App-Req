import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, ArrowRight, Users, Pencil, Check, X } from 'lucide-react';
import type { Catalogos, Registro } from '../types';
import Button from './ui/Button';
import { Input, Select, Label } from './ui/Field';
import { Card, Badge } from './ui/Card';

interface Props {
  catalogos: Catalogos;
  registros: Registro[];
  setRegistros: (r: Registro[]) => void;
}

export default function CaptureView({ catalogos, registros, setRegistros }: Props) {
  const vendedoresActivos = catalogos.vendedores.filter((v) => v.activo);
  const [vendedorId, setVendedorId] = useState<string>(vendedoresActivos[0]?.id ?? '');

  const [cliente, setCliente] = useState('');
  const [motivo, setMotivo] = useState(catalogos.motivos[0]?.nombre ?? '');
  const [modelo, setModelo] = useState(catalogos.modelos[0]?.nombre ?? '');
  const [pagara, setPagara] = useState<'Sí' | 'No'>('No');
  const [cantidad, setCantidad] = useState(1);

  const vendedorActual = catalogos.vendedores.find((v) => v.id === vendedorId);
  const registrosVendedor = useMemo(
    () => registros.filter((r) => r.vendedorId === vendedorId),
    [registros, vendedorId]
  );

  function agregar() {
    if (!vendedorId || !cliente.trim()) return;
    const nuevo: Registro = {
      id: uuid(),
      vendedorId,
      cliente: cliente.trim().toUpperCase(),
      motivo,
      modelo,
      pagara,
      cantidad: cantidad || 1,
    };
    setRegistros([...registros, nuevo]);
    setCliente('');
    setCantidad(1);
  }

  function eliminar(id: string) {
    setRegistros(registros.filter((r) => r.id !== id));
  }

  const [editId, setEditId] = useState<string | null>(null);
  const [editCliente, setEditCliente] = useState('');
  const [editMotivo, setEditMotivo] = useState('');
  const [editModelo, setEditModelo] = useState('');
  const [editPagara, setEditPagara] = useState<'Sí' | 'No'>('No');
  const [editCantidad, setEditCantidad] = useState(1);

  function startEdit(r: Registro) {
    setEditId(r.id);
    setEditCliente(r.cliente);
    setEditMotivo(r.motivo);
    setEditModelo(r.modelo);
    setEditPagara(r.pagara);
    setEditCantidad(r.cantidad);
  }

  function saveEdit() {
    if (!editCliente.trim()) return;
    setRegistros(
      registros.map((r) =>
        r.id === editId
          ? {
              ...r,
              cliente: editCliente.trim().toUpperCase(),
              motivo: editMotivo,
              modelo: editModelo,
              pagara: editPagara,
              cantidad: editCantidad || 1,
            }
          : r
      )
    );
    setEditId(null);
  }

  const resumen = catalogos.vendedores
    .map((v) => {
      const regs = registros.filter((r) => r.vendedorId === v.id);
      return {
        vendedor: v,
        clientes: regs.length,
        llaves: regs.reduce((s, r) => s + r.cantidad, 0),
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
              <Badge tone="muted">{registrosVendedor.length} cliente(s)</Badge>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Label>Paso 2 · Formulario rápido de cliente</Label>
          <div className="grid sm:grid-cols-2 gap-3 mt-1">
            <div className="sm:col-span-2">
              <Input
                placeholder="Nombre del cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregar()}
              />
            </div>
            <Select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
              {catalogos.motivos.map((m) => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </Select>
            <Select value={modelo} onChange={(e) => setModelo(e.target.value)}>
              {catalogos.modelos.map((m) => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </Select>
            <Select value={pagara} onChange={(e) => setPagara(e.target.value as 'Sí' | 'No')}>
              <option value="No">Pagará: No</option>
              <option value="Sí">Pagará: Sí</option>
            </Select>
            <Input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              placeholder="Cantidad"
            />
          </div>
          <Button variant="primary" className="mt-3 w-full" onClick={agregar} disabled={!vendedorId}>
            <Plus size={16} /> Agregar
          </Button>
        </Card>

        <Card className="p-4">
          <Label>Paso 3 · Registros de {vendedorActual ? vendedorActual.nombre : 'vendedor'}</Label>
          {registrosVendedor.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">Aún no hay registros para este vendedor.</p>
          ) : (
            <div className="overflow-auto mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                    <th className="py-1.5 pr-2">Cliente</th>
                    <th className="py-1.5 pr-2">Motivo</th>
                    <th className="py-1.5 pr-2">Modelo</th>
                    <th className="py-1.5 pr-2">Pagará</th>
                    <th className="py-1.5 pr-2 text-right">Cant.</th>
                    <th className="py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {registrosVendedor.map((r) =>
                    editId === r.id ? (
                      <tr key={r.id} className="border-b border-[var(--border)]/60 bg-[var(--surface-2)]">
                        <td className="py-1.5 pr-2">
                          <Input
                            value={editCliente}
                            onChange={(e) => setEditCliente(e.target.value)}
                            className="!py-1"
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Select value={editMotivo} onChange={(e) => setEditMotivo(e.target.value)} className="!py-1">
                            {catalogos.motivos.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="py-1.5 pr-2">
                          <Select value={editModelo} onChange={(e) => setEditModelo(e.target.value)} className="!py-1">
                            {catalogos.modelos.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="py-1.5 pr-2">
                          <Select
                            value={editPagara}
                            onChange={(e) => setEditPagara(e.target.value as 'Sí' | 'No')}
                            className="!py-1"
                          >
                            <option value="No">No</option>
                            <option value="Sí">Sí</option>
                          </Select>
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
                      <tr key={r.id} className="border-b border-[var(--border)]/60">
                        <td className="py-1.5 pr-2">{r.cliente}</td>
                        <td className="py-1.5 pr-2 text-[var(--text-muted)]">{r.motivo}</td>
                        <td className="py-1.5 pr-2">{r.modelo}</td>
                        <td className="py-1.5 pr-2">{r.pagara}</td>
                        <td className="py-1.5 pr-2 text-right">{r.cantidad}</td>
                        <td className="py-1.5 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(r)} title="Editar">
                            <Pencil size={14} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                          </button>{' '}
                          <button onClick={() => eliminar(r.id)} title="Eliminar">
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
          <p className="text-sm text-[var(--text-muted)]">Sin registros aún.</p>
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
                  {r.clientes} cliente{r.clientes !== 1 ? 's' : ''} / {r.llaves} llave{r.llaves !== 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
