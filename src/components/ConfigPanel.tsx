import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Pencil, Check, X, Power } from 'lucide-react';
import type { Catalogos, Vendedor, Modelo, Motivo } from '../types';
import Button from './ui/Button';
import { Input } from './ui/Field';
import { Card } from './ui/Card';

interface Props {
  catalogos: Catalogos;
  setCatalogos: (c: Catalogos) => void;
}

export default function ConfigPanel({ catalogos, setCatalogos }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <VendedoresSection catalogos={catalogos} setCatalogos={setCatalogos} />
      <ModelosSection catalogos={catalogos} setCatalogos={setCatalogos} />
      <MotivosSection catalogos={catalogos} setCatalogos={setCatalogos} />
    </div>
  );
}

function VendedoresSection({ catalogos, setCatalogos }: Props) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editCodigo, setEditCodigo] = useState('');
  const [editNombre, setEditNombre] = useState('');

  function add() {
    if (!codigo.trim() || !nombre.trim()) return;
    const v: Vendedor = { id: uuid(), codigo: codigo.trim(), nombre: nombre.trim(), activo: true };
    setCatalogos({ ...catalogos, vendedores: [...catalogos.vendedores, v] });
    setCodigo('');
    setNombre('');
  }

  function remove(id: string) {
    setCatalogos({ ...catalogos, vendedores: catalogos.vendedores.filter((v) => v.id !== id) });
  }

  function toggleActivo(id: string) {
    setCatalogos({
      ...catalogos,
      vendedores: catalogos.vendedores.map((v) => (v.id === id ? { ...v, activo: !v.activo } : v)),
    });
  }

  function startEdit(v: Vendedor) {
    setEditId(v.id);
    setEditCodigo(v.codigo);
    setEditNombre(v.nombre);
  }

  function saveEdit() {
    setCatalogos({
      ...catalogos,
      vendedores: catalogos.vendedores.map((v) =>
        v.id === editId ? { ...v, codigo: editCodigo, nombre: editNombre } : v
      ),
    });
    setEditId(null);
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Vendedores</h3>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Código (V1)" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-24" />
        <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Button variant="primary" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      <ul className="space-y-1.5 max-h-80 overflow-auto pr-1">
        {catalogos.vendedores.map((v) => (
          <li
            key={v.id}
            className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5"
          >
            {editId === v.id ? (
              <>
                <Input value={editCodigo} onChange={(e) => setEditCodigo(e.target.value)} className="w-16 !py-1" />
                <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="!py-1" />
                <Button size="sm" variant="ghost" onClick={saveEdit}>
                  <Check size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <span className={`text-sm flex-1 ${!v.activo ? 'opacity-40 line-through' : ''}`}>
                  <span className="font-medium">{v.codigo}</span>: {v.nombre}
                </span>
                <button onClick={() => toggleActivo(v.id)} title={v.activo ? 'Desactivar' : 'Activar'}>
                  <Power size={14} className={v.activo ? 'text-[var(--accent-2)]' : 'text-[var(--text-muted)]'} />
                </button>
                <button onClick={() => startEdit(v)}>
                  <Pencil size={14} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
                <button onClick={() => remove(v.id)}>
                  <Trash2 size={14} className="text-[var(--danger)]" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ModelosSection({ catalogos, setCatalogos }: Props) {
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');

  function add() {
    if (!nombre.trim()) return;
    const m: Modelo = { id: uuid(), nombre: nombre.trim() };
    setCatalogos({ ...catalogos, modelos: [...catalogos.modelos, m] });
    setNombre('');
  }

  function remove(id: string) {
    setCatalogos({ ...catalogos, modelos: catalogos.modelos.filter((m) => m.id !== id) });
  }

  function startEdit(m: Modelo) {
    setEditId(m.id);
    setEditNombre(m.nombre);
  }

  function saveEdit() {
    setCatalogos({
      ...catalogos,
      modelos: catalogos.modelos.map((m) => (m.id === editId ? { ...m, nombre: editNombre } : m)),
    });
    setEditId(null);
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Modelos</h3>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Nombre del modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Button variant="primary" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      <ul className="space-y-1.5 max-h-80 overflow-auto pr-1">
        {catalogos.modelos.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5"
          >
            {editId === m.id ? (
              <>
                <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="!py-1" />
                <Button size="sm" variant="ghost" onClick={saveEdit}>
                  <Check size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm flex-1">{m.nombre}</span>
                <button onClick={() => startEdit(m)}>
                  <Pencil size={14} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
                <button onClick={() => remove(m.id)}>
                  <Trash2 size={14} className="text-[var(--danger)]" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MotivosSection({ catalogos, setCatalogos }: Props) {
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');

  function add() {
    if (!nombre.trim()) return;
    const m: Motivo = { id: uuid(), nombre: nombre.trim() };
    setCatalogos({ ...catalogos, motivos: [...catalogos.motivos, m] });
    setNombre('');
  }

  function remove(id: string) {
    setCatalogos({ ...catalogos, motivos: catalogos.motivos.filter((m) => m.id !== id) });
  }

  function startEdit(m: Motivo) {
    setEditId(m.id);
    setEditNombre(m.nombre);
  }

  function saveEdit() {
    setCatalogos({
      ...catalogos,
      motivos: catalogos.motivos.map((m) => (m.id === editId ? { ...m, nombre: editNombre } : m)),
    });
    setEditId(null);
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Motivos</h3>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Nombre del motivo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Button variant="primary" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      <ul className="space-y-1.5 max-h-80 overflow-auto pr-1">
        {catalogos.motivos.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5"
          >
            {editId === m.id ? (
              <>
                <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="!py-1" />
                <Button size="sm" variant="ghost" onClick={saveEdit}>
                  <Check size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm flex-1">{m.nombre}</span>
                <button onClick={() => startEdit(m)}>
                  <Pencil size={14} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
                <button onClick={() => remove(m.id)}>
                  <Trash2 size={14} className="text-[var(--danger)]" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
