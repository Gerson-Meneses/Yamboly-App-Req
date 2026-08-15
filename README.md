# Requerimiento de Llaves — Generador

App web (Vite + React + TypeScript + Tailwind CSS) para capturar los requerimientos de llaves por vendedor y exportarlos a un Excel con el mismo formato del reporte físico (bloques por vendedor, subtotales, total por modelo y espacio de conformidad/firma).

## Requisitos

- Node.js 18 o superior.

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

## Compilar para producción

```bash
npm run build
```

Los archivos listos para desplegar quedan en `dist/`. Puedes servirlos con cualquier hosting estático (Netlify, Vercel, GitHub Pages, un servidor interno, etc.) o simplemente abrir `dist/index.html` en el navegador.

## Funcionalidad

- **Configuración**: catálogos de Vendedores, Modelos y Motivos con alta / edición / eliminación. Los vendedores se pueden activar o desactivar (los inactivos no aparecen para captura). Todo se guarda automáticamente en `localStorage` del navegador.
- **Captura**: selecciona un vendedor, llena el formulario rápido (cliente, motivo, modelo, pagará, cantidad) y agrégalo. La tabla temporal muestra los registros del vendedor activo, y el panel lateral resume el avance por cada vendedor con clientes cargados.
- **Vista Previa**: muestra la estructura agrupada por vendedor con subtotales, y el resumen de Total por Modelo + Total General, tal como saldrá en el Excel.
- **Exportar a Excel**: genera un archivo `.xlsx` con:
  - Encabezado `REQUERIMIENTO DE LLAVES [FECHA ACTUAL]`.
  - Columnas: Cliente, Motivo, Modelo, Pagará, Total Solicitado, Total Entregado.
  - Un bloque por vendedor (solo los que tienen registros), con encabezado de sección, filas de detalle, fila de Subtotal (con fórmula `SUM`) y una fila de conformidad/firma integrada.
  - Sección final "Total Por Modelo" con el total de cada modelo y el Total General.
  - Bordes finos, anchos de columna ajustados y configuración de impresión centrada horizontalmente.
  - Nombre de archivo: `Requerimiento_de_Llaves_DD-MM-YYYY.xlsx`.
- **Modo oscuro/claro**: botón en la esquina superior derecha. El modo oscuro usa negro puro (`#000000`) para pantallas AMOLED, y la preferencia se guarda en `localStorage`.
- **Botón "Limpiar"**: borra únicamente los registros capturados (mantiene los catálogos).
- **Botón "Restaurar todo a valores de fábrica"** (en Configuración): borra registros y catálogos, y vuelve a cargar el listado inicial de ejemplo.

## Estructura del proyecto

```
src/
  types.ts                Tipos compartidos (Vendedor, Modelo, Motivo, Registro)
  data/seed.ts             Catálogos iniciales de ejemplo
  lib/storage.ts           Persistencia en localStorage
  lib/excelExport.ts        Generación del Excel con ExcelJS
  components/
    ui/                    Componentes base (Button, Input, Select, Card, Badge)
    ThemeToggle.tsx
    ConfigPanel.tsx         CRUD de catálogos
    CaptureView.tsx         Flujo de captura por vendedor
    PreviewView.tsx          Vista previa + botón de exportación
  App.tsx                   Layout principal con pestañas
```

## Notas

- Los datos (catálogos y registros) viven solo en el navegador (localStorage). Si necesitas compartir el avance entre dispositivos, exporta a Excel o migra el almacenamiento a un backend.
- La librería de generación de Excel es exceljs, que sí soporta bordes, colores de relleno y fórmulas (a diferencia de la edición community de SheetJS).
