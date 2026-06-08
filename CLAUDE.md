# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server en puerto 2024 (con --host para acceso en red local)
npm run build     # tsc + vite build
npm run preview   # Previsualizar el build de producción
```

No hay suite de tests configurada en este proyecto.

## Arquitectura general

SPA de React 18 + TypeScript construida con Vite. El backend es una API REST separada que corre en `http://10.10.100.107:3001` (configurable vía `VITE_API_URL`). Todas las llamadas al backend se hacen con Axios usando esa variable de entorno.

### Autenticación y roles

`src/auth/AuthProvider.tsx` es un Context global que gestiona toda la sesión. Al hacer login, guarda en `localStorage` el token JWT y todos los datos del empleado. Los campos clave para el control de acceso son:

- `RRHH === 1` — acceso a ProcesarVacaciones, ProcesarPermisos, GestionExpediente
- `canApproveVacations` — acceso a AprobarVacaciones
- `canApprovePermits` — acceso a AprobarPermisos
- `isAdmin` — acceso al AdminDashboard

`src/routes/ProtectedRoute.tsx` envuelve todas las rutas privadas. Cada ruta con acceso restringido verifica el campo correspondiente en `useAuth()` y redirige a `/home` si no tiene permiso.

El hook `revalidateUserStatus` re-consulta el backend para actualizar los flags de rol sin cerrar sesión (lo llama el Navbar al abrir los menús de procesos).

### Rutas principales

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Login | Público |
| `/home` | Home | Autenticado |
| `/expediente/:seccion` | Expendiente | Autenticado |
| `/GestionExpediente` | RRHHExpedientes | RRHH |
| `/AprobarVacaciones` | AprobarVacaciones | canApproveVacations |
| `/ProcesarVacaciones` | ProcesarVacaciones | RRHH |
| `/AprobarPermisos` | AprobarPermisos | canApprovePermits |
| `/ProcesarPermisos` | ProcesarPermisos | RRHH |
| `/Admin` | AdminDashboard | isAdmin |

### Módulo Expediente (multi-fase)

`src/routes/Expediente/Expendiente.tsx` es el contenedor principal que maneja 3 fases navegadas por URL:

1. **`/expediente/datos`** — DatosPersonalesPhase: edición de datos personales; los cambios no se guardan directamente sino que generan una solicitud que RRHH debe aprobar. Si `estatusSolicitudCambio === 1`, el formulario queda bloqueado.
2. **`/expediente/rutograma`** — RutogramaPhase: formulario de ruta habitual casa↔oficina con transporte, escalas y actividades para ambos sentidos.
3. **`/expediente/documentos`** — DocumentosPhase: carga y consulta de documentos en Google Drive vía backend.

El estado del rutograma se persiste como borrador en `localStorage` bajo la clave `rutograma_${cod_emp}`. El hook `useRutogramaState` (`src/hooks/useRutogramaState.ts`) gestiona ese estado con hidratación automática desde localStorage. Los tipos centrales están en `src/types/rutograma.types.ts`.

### Estilos

El proyecto usa tres sistemas de estilos en paralelo:

- **CSS Modules** (`*.module.css` en `src/css/`) — patrón dominante para componentes de rutas
- **CSS global** (archivos `.css` planos en `src/css/`) — para Navbar, Login, tablas compartidas
- **Tailwind CSS v4** vía `@tailwindcss/vite` — activado en `src/css/tailwind.css`
- **Bootstrap 5 + React-Bootstrap** — componentes de UI (modales, navbar, offcanvas, acordeones)

El alias `@` resuelve a `src/`, configurado en `vite.config.ts`.

### Integración con Google Drive

Los documentos del Expediente se almacenan en carpetas de Google Drive. El backend expone endpoints para subir, listar y descargar archivos. Los IDs de carpetas se configuran en `.env`:

```
VITE_API_URL=             # URL del backend (puerto 3001)
VITE_GOOGLE_API_KEY=      # Clave de API de Google
VITE_GALERIA_FOLDER_ID=   # Carpeta de galería de eventos (Home)
VITE_SEGURIDAD_FOLDER_ID= # Carpeta de Seguridad y Salud Laboral
VITE_MANUALES_FOLDER_ID=  # Carpeta de Manuales
```

### Componentes compartidos notables

- `NavbarEmpresa` — navbar responsivo con Offcanvas; muestra/oculta ítems de menú según rol; llama `revalidateUserStatus` al abrir dropdowns de procesos
- `src/components/react-bits/` — componentes de animación (CountUp, BlurText, RotatingText, ScrollFloat, MagicBento)
- `Home.tsx` — cachea las estadísticas de RRHH en `sessionStorage` por 15 minutos usando `IntersectionObserver` para cargarlas solo al hacer scroll
