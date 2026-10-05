import { useEffect, useRef, useState } from 'react';
import { KeyRound, ListPlus, Table2, Settings2, Trash, Upload, DoorOpen } from 'lucide-react';
import type { Catalogos, Registro, Apertura } from './types';
import {
  loadCatalogos,
  saveCatalogos,
  loadRegistros,
  saveRegistros,
  loadAperturas,
  saveAperturas,
  loadTheme,
  saveTheme,
  clearAllData,
} from './lib/storage';
import { importRequerimiento } from './lib/excelImport';
import ThemeToggle from './components/ThemeToggle';
import CaptureView from './components/CaptureView';
import PreviewView from './components/PreviewView';
import AperturaCaptureView from './components/AperturaCaptureView';
import AperturaPreviewView from './components/AperturaPreviewView';
import ConfigPanel from './components/ConfigPanel';
import Button from './components/ui/Button';

type Tab = 'captura' | 'aperturas' | 'preview' | 'config';
type PreviewSubTab = 'llaves' | 'aperturas';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [catalogos, setCatalogosState] = useState<Catalogos>(() => loadCatalogos());
  const [registros, setRegistrosState] = useState<Registro[]>(() => loadRegistros());
  const [aperturas, setAperturasState] = useState<Apertura[]>(() => loadAperturas());
  const [tab, setTab] = useState<Tab>('captura');
  const [previewSub, setPreviewSub] = useState<PreviewSubTab>('llaves');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  function setCatalogos(c: Catalogos) {
    setCatalogosState(c);
    saveCatalogos(c);
  }

  function setRegistros(r: Registro[]) {
    setRegistrosState(r);
    saveRegistros(r);
  }

  function setAperturas(a: Apertura[]) {
    setAperturasState(a);
    saveAperturas(a);
  }

  function resetTodo() {
    const esAperturas = tab === 'aperturas' || (tab === 'preview' && previewSub === 'aperturas');
    if (esAperturas) {
      if (!confirm('¿Seguro que deseas borrar todas las aperturas capturadas? Los catálogos no se verán afectados.')) return;
      setAperturas([]);
    } else {
      if (!confirm('¿Seguro que deseas borrar todos los registros de llaves capturados? Los catálogos no se verán afectados.')) return;
      setRegistros([]);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const result = await importRequerimiento(file, catalogos);
      setCatalogos(result.catalogos);
      setRegistros([...registros, ...result.registros]);
      alert(
        `Importación completa: ${result.stats.registrosImportados} registro(s) agregados` +
          (result.stats.vendedoresNuevos > 0
            ? `, ${result.stats.vendedoresNuevos} vendedor(es) nuevo(s) creado(s).`
            : '.')
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo importar el archivo.');
    } finally {
      setImporting(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'captura', label: 'Llaves', icon: <ListPlus size={16} /> },
    { id: 'aperturas', label: 'Aperturas', icon: <DoorOpen size={16} /> },
    { id: 'preview', label: 'Vista Previa', icon: <Table2 size={16} /> },
    { id: 'config', label: 'Configuración', icon: <Settings2 size={16} /> },
  ];

  const limpiarLabel =
    tab === 'aperturas' || (tab === 'preview' && previewSub === 'aperturas') ? 'Limpiar aperturas' : 'Limpiar llaves';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-10 backdrop-blur bg-[var(--bg)]/85 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
              <KeyRound size={18} />
            </div>
            <div>
              <h1 className="font-semibold leading-tight">Requerimientos de Vendedores</h1>
              <p className="text-xs text-[var(--text-muted)] leading-tight">Llaves y aperturas por vendedor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleImportFile} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              title="Importar requerimiento de llaves desde Excel"
            >
              <Upload size={14} /> {importing ? 'Importando…' : 'Importar Excel'}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetTodo} title={limpiarLabel}>
              <Trash size={14} /> {limpiarLabel}
            </Button>
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                tab === t.id
                  ? 'bg-[var(--accent)] text-black font-medium'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'captura' && (
          <CaptureView catalogos={catalogos} registros={registros} setRegistros={setRegistros} />
        )}

        {tab === 'aperturas' && (
          <AperturaCaptureView catalogos={catalogos} aperturas={aperturas} setAperturas={setAperturas} />
        )}

        {tab === 'preview' && (
          <div className="space-y-4">
            <div className="inline-flex bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-1 gap-1">
              <button
                onClick={() => setPreviewSub('llaves')}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  previewSub === 'llaves' ? 'bg-[var(--accent)] text-black font-medium' : 'text-[var(--text-muted)]'
                }`}
              >
                Llaves
              </button>
              <button
                onClick={() => setPreviewSub('aperturas')}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  previewSub === 'aperturas' ? 'bg-[var(--accent)] text-black font-medium' : 'text-[var(--text-muted)]'
                }`}
              >
                Aperturas
              </button>
            </div>

            {previewSub === 'llaves' ? (
              <PreviewView catalogos={catalogos} registros={registros} />
            ) : (
              <AperturaPreviewView catalogos={catalogos} aperturas={aperturas} />
            )}
          </div>
        )}

        {tab === 'config' && (
          <>
            <ConfigPanel catalogos={catalogos} setCatalogos={setCatalogos} />
            <div className="mt-6">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      'Esto restaurará los catálogos a los valores iniciales y borrará los registros de llaves y aperturas. ¿Continuar?'
                    )
                  ) {
                    clearAllData();
                    window.location.reload();
                  }
                }}
              >
                Restaurar todo a valores de fábrica
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
