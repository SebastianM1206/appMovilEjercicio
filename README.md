# Stride — App de Running

Aplicación móvil para tracking de carreras con GPS, sincronización offline-first, leaderboard semanal y perfiles de usuario. Construida con **Ionic React + Capacitor + Firebase + Cloudinary**.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 19 + Ionic 8 (`@ionic/react`) |
| Build / Bundler | Vite 8 + TypeScript 5.9 |
| Backend Cloud | Firebase Auth + Firebase Realtime Database |
| Almacenamiento Local | Dexie.js (IndexedDB) |
| Imágenes | Cloudinary (unsigned upload presets) |
| Mapas | Leaflet + react-leaflet |
| Estilos | Tailwind CSS v4 + diseño propio "Stride" |
| Testing | Vitest (unit) + Cypress (E2E) |
| Linting / Formato | ESLint + Prettier |
| Gestor Paquetes | pnpm |

---

## Sensores del Teléfono Usados

| Sensor / Plugin | Paquete Capacitor | Funcionalidad |
|---|---|---|
| **GPS** | `@capacitor/geolocation` | Rastreo de ruta en tiempo real con `watchPosition`. Velocidad, altitud,精确idad. |
| **Acelerómetro** | API nativa `devicemotion` | Detección de movimiento del dispositivo. Auto-pausa tras 15s de inactividad. |
| **Cámara** | `@capacitor/camera` | Captura de fotos durante la carrera y selección de avatar de perfil. |
| **Hápticos** | `@capacitor/haptics` | Feedback táctil al pausar/reanudar (`MEDIUM` impact) y al completar milestones (`SUCCESS` notification). |
| **Notificaciones Locales** | `@capacitor/local-notifications` | Alertas al completar cada kilómetro, batería baja, auto-pausa y resumen al finalizar. |
| **Red** | `@capacitor/network` | Monitoreo de conectividad. Dispara sincronización automática al reconectar. |
| **Info Dispositivo** | `@capacitor/device` | Modelo, plataforma, versión SO, idioma, nivel de batería. |
| **Sistema de Archivos** | `@capacitor/filesystem` | Almacenamiento temporal de fotos antes de subir a Cloudinary. |
| **Teclado** | `@capacitor/keyboard` | Manejo de teclado en pantallas de autenticación. |
| **Status Bar** | `@capacitor/status-bar` | Configuración de la barra de estado del dispositivo. |
| **App** | `@capacitor/app` | Acceso a información de la app (versión, build) para metadatos de sincronización. |

---

## Funcionalidades del Sistema

### 🔐 Autenticación
- **Registro e inicio de sesión** con email/contraseña vía Firebase Auth.
- Validación del lado del cliente: email con formato válido, contraseña mínima **8 caracteres**, nombre de usuario máximo **40 caracteres**.
- Guardia de ruta (`AuthGate`) que redirige a `/auth` si no hay sesión activa.
- Al registrarse, crea automáticamente un perfil público en la RTDB.

### 🏃‍♂️ Grabación de Carreras
- **GPS en tiempo real** con `watchPosition`, intervalo mínimo de 3s, alta precisión cuando hay permiso.
- Estados: **Idle → Recording → Paused → Finished**.
- **Pausa/Reanudación manual** con botón en pantalla y **auto-pausa** tras 15s de inactividad detectada por el acelerómetro.
- **Milestones**: cada kilómetro completo dispara una notificación local + feedback háptico + banner en pantalla por 3.2s.
- **Métricas en vivo**: distancia, duración, ritmo (pace), velocidad promedio.
- **División de vueltas (splits)** manuales con el botón "flag".
- **Mapa interactivo** con Leaflet mostrando la ruta grabada en tiempo real.
- **Fotos**: captura de fotos durante la carrera que se suben a Cloudinary.
- **Advertencia de batería baja** al 20% durante la grabación.
- Al finalizar: resumen con distancia, tiempo, ritmo, velocidad, puntos GPS y opciones de compartir.

### 📊 Historial
- Lista de carreras anteriores ordenadas por fecha descendente.
- **Filtros**: "Todas", "Esta semana", "Este mes".
- **Resumen mensual**: total de kilómetros, cantidad de carreras, ritmo promedio del mes.
- Nombres generados automáticamente según la hora: "Matutino", "Vespertino", "Nocturno".
- Subida de fotos por carrera desde la galería o cámara.
- Estado de sincronización individual por carrera (pendiente, sincronizando, sincronizado, error).
- Botón manual para forzar sincronización pendiente.

### 🏆 Leaderboard
- Ranking semanal con **período ISO week** (formato `YYYY-WW`).
- Puntaje = distancia total recorrida en la semana (`score === distanceM`).
- Visualización tipo podio (1°, 2°, 3° con alturas diferenciadas).
- Posición propia destacada con su puntuación.
- Perfiles públicos con iniciales y foto de avatar.
- Índice `score` en RTDB para consultas eficientes ordenadas.

### 👤 Perfil de Usuario
- Nombre, email y foto de avatar.
- **Subida de avatar** a Cloudinary (validación: tipo imagen, máximo 1 MB).
- Estadísticas personales: kilómetros totales, carreras realizadas, días activos.
- **Gráfico semanal** de distancia por semana (últimas 7 semanas) con barras.
- Logros: placeholders para 5K, racha, récord personal, top 5.
- Cierre de sesión.

### 🔄 Sincronización Offline (Outbox Pattern)
- **Almacenamiento local primero**: toda la carrera se guarda en Dexie antes de cualquier intento de subida al cloud.
- **3 operaciones de sincronización** encoladas al finalizar cada carrera:
  1. `UPLOAD_ROUTE` — sube la ruta GPS a RTDB (`runs/{uid}/{runId}/route`).
  2. `WRITE_SUMMARY` — sube el resumen de la carrera con banderas de integridad (`runs/{uid}/{runId}/summary`).
  3. `UPDATE_AGG` — incrementa la agregación semanal en `agg/{periodKey}/{uid}` con candado `counted` (write-once, atómico).
- **Reintentos con backoff exponencial**: `baseDelayMs * 2^attempts` con tope de 60 minutos.
- **Errores fatales** (ruta muy grande, puntos insuficientes, distancia muy corta, auth expirado): se marcan con `nextRetryAt = Infinity` y no se reintentan.
- **Errores recuperables** (problemas de red, conflictos): reintento progresivo.
- **Sincronización automática**: al iniciar sesión, al reconectar a internet y cada 15 segundos mientras haya operaciones pendientes.
- Contexto React (`SyncProvider`) expone estado global de sincronización: `isSyncing`, `pendingCount`, `lastError`, `triggerSync`.

---

## Arquitectura

### Capas del Proyecto

```
src/
├── app/              # Bootstrap: App, env, providers, routes
├── data/             # Acceso a datos
│   ├── cloudinary/   # Uploader + media repo (fotos y avatares)
│   ├── dexie/        # IndexedDB local (db, schema, repos)
│   └── firebase/     # Auth + RTDB (paths, repos, validación, integridad)
├── features/         # Features de negocio
│   ├── auth/         # Autenticación (servicio, contexto, pantalla)
│   ├── run/          # Grabación de carrera (dominio, hooks, pantalla)
│   ├── history/      # Historial (hooks, pantalla)
│   ├── leaderboard/  # Leaderboard (servicio, hooks, pantalla)
│   ├── profile/      # Perfil (servicio, hooks, pantalla)
│   └── sync/         # Motor de sincronización (engine, contexto, tests)
├── infra/            # Integración con dispositivo
│   ├── device/       # Wrappers de plugins Capacitor (GPS, cámara, etc.)
│   └── network/      # Monitoreo de red
├── hooks/            # Hooks React compartidos
├── shared/           # Tipos, constantes y utilidades comunes
└── ui/               # Sistema de diseño
    ├── components/   # Componentes reutilizables (Button, Icon, MapRoute, etc.)
    ├── layouts/      # Layouts de página
    └── theme/        # Tokens de diseño (variables CSS + Tailwind)
```

### Roles de Cada Servicio

| Sistema | Rol | Datos |
|---|---|---|
| **Firebase Auth** | Autenticación | Email + contraseña, sesión del usuario |
| **Firebase RTDB** | Persistencia en cloud | Perfiles públicos, resúmenes de carreras, rutas GPS, metadatos de fotos, agregaciones semanales |
| **Dexie (IndexedDB)** | Almacenamiento local offline | Sesiones activas, puntos GPS, eventos, cola de outbox |
| **Cloudinary** | Hosting de imágenes | Avatares y fotos de carreras (unsigned upload) |

### Flujo de Datos: Una Carrera Completa

```
1. USUARIO TAPA "INICIAR"
   │
   ▼
2. createSession() en Dexie
   - UUID v4 como sessionId
   - Estado: "recording"
   │
   ▼
3. GPS WATCHING (cada 3s)
   - Acumula muestras en memoria
   - Cada 5 muestras → flushPoints() a Dexie
   - Acelerómetro monitorea movimiento
   - Ticker cada 1s recalcula métricas en vivo
   │
   ▼
4. MILESTONES (cada 1 km)
   - Evento guardado en Dexie
   - Notificación local + hápticos + banner
   │
   ▼
5. PAUSE / RESUME (opcional, manual o auto-pausa)
   │
   ▼
6. USUARIO TAPA "FINALIZAR"
   - Métricas finales calculadas
   - Sesión marcada como "finished" en Dexie
   - 3 operaciones encoladas en outbox:
     a) UPLOAD_ROUTE
     b) WRITE_SUMMARY
     c) UPDATE_AGG
   - Pantalla de resumen
   │
   ▼
7. SINCRONIZACIÓN (fondo)
   - Procesa outbox una por una
   - Backoff exponencial en fallos
   - Errores fatales → no reintentar
   - Al completar: sesión marcada "synced"
   │
   ▼
8. COMPLETO: Datos en Firebase RTDB + visible en leaderboard
```

---

## Reglas de Seguridad Firebase (RTDB)

Las reglas en `firebase/database.rules.json` definen:

| Ruta | Lectura | Escritura | Validación |
|---|---|---|---|
| `users/{uid}/public` | ✅ Público | 🔒 Solo dueño | displayName (1-40 chars), createdAt/updatedAt numérico |
| `runs/{uid}/{runId}/summary` | 🔒 Solo dueño | 🔒 Solo dueño | 13 campos requeridos, distanceM (50-100000), durationS (≤86400) |
| `runs/{uid}/{runId}/route` | 🔒 Solo dueño | 🔒 Solo dueño | version, runId, uid, pointCount, points |
| `runs/{uid}/{runId}/photos/{id}` | 🔒 Solo dueño | 🔒 Solo dueño | photoId, publicId, url, bytes, uploadedAt |
| `counted/{uid}/{runId}` | 🔒 Solo dueño | 🔒 Una sola vez | Write-once lock atómico |
| `agg/{periodKey}/{uid}` | ✅ Público | 🔒 Solo dueño | score == distanceM, indexed on score |
| Raíz (`/`) | ❌ Denegado | ❌ Denegado | — |

---

## Variables de Entorno

Crear archivo `.env` en la raíz basado en `.env.example`:

```env
# App
VITE_APP_NAME=Stride

# Firebase (Auth + RTDB)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudinary (unsigned upload preset)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_AVATAR_FOLDER=stride/avatars
VITE_CLOUDINARY_RUN_PHOTO_FOLDER=stride/run-photos
```

Cloudinary se habilita automáticamente cuando `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET` están ambos presentes.

---

## Instalación y Configuración

```bash
# 1. Clonar repositorio
git clone <repo>
cd appMovilEjercicio

# 2. Instalar dependencias (usar pnpm)
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de Firebase y Cloudinary

# 4. Iniciar en desarrollo
pnpm run dev
```

---

## Testing

### Tests Unitarios (Vitest)

Once archivos de test cubren:

| Archivo | Cobertura |
|---|---|
| `authValidation.test.ts` | Validación de email, password y displayName |
| `integrity.test.ts` | Flags de integridad de carrera (distancia, ritmo, velocidad) |
| `paths.test.ts` | Generadores de rutas RTDB |
| `runAggRepo.test.ts` | Candado counted + incremento de agregación semanal |
| `userPublicRepo.test.ts` | CRUD de perfil público |
| `leaderboardService.test.ts` | Top query, perfil propio, cache de display names |
| `syncEngine.test.ts` | Motor de sincronización completo: upload ruta, summary, agg, retry, errores fatales |
| `syncService.test.ts` | Servicio de sincronización con auth check |

Ejecutar:
```bash
pnpm run test.unit
```

### Tests E2E (Cypress)

```bash
pnpm run test.e2e
```

---

## Contribuidores

| Desarrollador | Rama | PR | Aportes principales |
|---|---|---|---|
| Alejandro Bravo | `Alejandro` | [#1](https://github.com/SebastianM1206/appMovilEjercicio/pull/1) | Firebase setup, auth context, sync engine con outbox, Dexie schema, leaderboard base, wrappers de sensores |
| Angel Del Castillo | `AngelDev` | [#2](https://github.com/SebastianM1206/appMovilEjercicio/pull/2) | Registro de usuarios, perfiles con avatar, leaderboard completo, historial, mejoras al sync, tests extensivos, seguridad Firebase |
| Sebastian | `Sebastian` | — | UI completa con diseño "Stride", migración Cloudinary, mapa interactivo Leaflet, RunScreen, pantallas de perfil/historial/leaderboard |
