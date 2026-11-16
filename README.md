# INFI-Final-Rheinmetall

**Rheinmetall AG — Tablero de Control Estratégico y KPI 2026**

Trabajo Final Integrador para la asignatura **Informática Industrial** (Ingeniería Informática, Universidad Blas Pascal — UBP, Prof. Lic. Gustavo Funes).

- **Autores:** Tomás Molina & Edgar Karpowicz
- **Alcance:** División Defensa de Rheinmetall AG (`Grupo Consolidado` y sub-divisiones `Weapon & Ammunition`, `Vehicle Systems` y `Electronic Solutions`) — Horizonte FY 2026.

---

## Estructura del repositorio

```text
INFI-Final-Rheinmetall/
├── docs/                   # Documentación académica y especificaciones (PDF)
│   ├── TP-FInal-KPI.pdf
│   ├── Documento de Requerimientos del Sistema - Rheinmetall AG.pdf  (RHM-UBP-SRS-2026-01)
│   └── Anexo - Objetivos Estratégicos y Matriz de KPI - Rheinmetall AG.pdf  (RHM-UBP-ANX-2026-02)
├── dataset/                # Fuente de datos híbrida FY 2026
│   ├── Dataset_Rheinmetall_KPI_2026.xlsx
│   └── rheinmetall_kpi_2026.json
├── project/                # Aplicación web del Tablero KPI (React + TypeScript + Vite)
├── presentation/           # Presentación interactiva standalone (HTML / CSS / JS sin build)
└── .github/workflows/      # CI/CD de despliegue en GitHub Pages (deploy-pages.yml)
```

---

## Cómo ejecutar el Tablero Web (`project/`)

Requisitos: **Node.js 22** (o compatible con Vite 8) y **npm**.

```bash
cd project
npm install
npm run dev
```

Otros scripts disponibles en `project/package.json`:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm test` | Ejecuta la suite de pruebas en Vitest (`vitest run`) |
| `npm run test:watch` | Ejecuta Vitest en modo interactivo |
| `npm run build` | Verifica tipos (`tsc`) y genera el bundle de producción (`project/dist/`) |
| `npm run preview` | Previsualiza localmente el build de producción |

El flujo `.github/workflows/deploy-pages.yml` ejecuta `npm ci`, `npm test` y `npm run build` sobre `project/` y publica `project/dist/` en GitHub Pages en cada push a `main`.

---

## Cómo abrir la Presentación (`presentation/`)

La carpeta `presentation/` contiene 9 diapositivas interactivas sin dependencias externas ni paso de compilación:

1. Abrir [`presentation/index.html`](presentation/index.html) directamente en cualquier navegador moderno.
2. Controles disponibles:
   - `←` / `→`: navegar entre diapositivas (soporta hash de URL `#slide=N&theme=dark`)
   - `M`: abrir/cerrar el mapa general de diapositivas
   - `T`: alternar tema claro / oscuro
   - `F`: mostrar/ocultar la flota táctica animada

---

## Catálogo de KPIs (5 sectores · 10 indicadores SMART)

| Sector | Código | Indicador | Tipo | Meta SMART | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Ventas** | `KPI-1.1` | Ratio Book-to-Bill | Leading | `>= 1,50x` | VP Ventas Defensa |
| **1. Ventas** | `KPI-1.2` | Margen de Resultado Operativo | Lagging | `>= 18,0%` | CFO / Controlling |
| **2. Línea de Producción** | `KPI-2.1` | OEE (Eficiencia Global de Equipos) | Leading | `>= 82,0%` | Director de Planta |
| **2. Línea de Producción** | `KPI-2.2` | Cumplimiento del Programa Maestro (MPS) | Lagging | `>= 95,0%` | Gerente Planificación |
| **3. Calidad** | `KPI-3.1` | First-Pass Yield (FPY) | Leading | `>= 97,0%` | Ingeniero Jefe QC |
| **3. Calidad** | `KPI-3.2` | Tasa de Rechazo/Demora Aceptación Lotes | Lagging | `<= 1,5%` | Gerente QA |
| **4. Compras y Abast.** | `KPI-4.1` | Días de Inventario de Suministros (DOS) | Leading | `65 - 80 días` | Director Supply Chain |
| **4. Compras y Abast.** | `KPI-4.2` | Supplier OTIF (Entregas a Tiempo y Completas) | Lagging | `>= 94,0%` | VP Compras Estratégicas |
| **5. Seguridad (EHS)** | `KPI-5.1` | Tasa de Cierre Proactivo de Riesgos | Leading | `>= 95,0%` | Gerente Corporativo EHS |
| **5. Seguridad (EHS)** | `KPI-5.2` | LTIFR (Frecuencia Accidentes con Baja) | Lagging | `<= 2,20 Acc. / 10^6 h` | Gerente EHS / Dir. Planta |

---

## Modelo de datos (3 capas)

Documentado en `dataset/rheinmetall_kpi_2026.json`:

1. **Datos Corporativos Reales (Auditados / Públicos):** anclajes de Rheinmetall AG (Annual Report FY 2025 y Quarterly Statements Q1–Q3 2026).
2. **Datos Híbridos Calibrados:** anclaje público combinado con desagregación mensual y telemetría operativa (`KPI-3.2`, `KPI-4.1`, `KPI-5.2`).
3. **Datos Industriales Simulados Calibrados:** señales granulares de planta (MES / QMS / SCM / EHS) calibradas con curvas de aprendizaje industrial FY 2026.
