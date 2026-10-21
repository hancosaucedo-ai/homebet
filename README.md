# 🐾 HomeVet - Servicios Veterinarios a Domicilio

[![Build Timestamp](https://img.shields.io/badge/Build%20Timestamp-2026--10--21T21%3A05%3A00Z-0e697d?style=flat-square)](https://github.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Compatible%20M%C3%B3vil-25d366?style=flat-square&logo=pwa)](https://github.com)
[![IndexedDB](https://img.shields.io/badge/Database-IndexedDB%20v1.0-0284c7?style=flat-square)](https://github.com)
[![Version](https://img.shields.io/badge/Version-1.2.0-indigo?style=flat-square)](https://github.com)

Aplicación web progresiva (**PWA**) y sistema integral para la gestión, reserva y administración de servicios médicos veterinarios a domicilio para caninos y felinos.

---

## 📌 Metadatos de Publicación y Release
* **Versión de Release:** `v1.2.0`
* **Timestamp de Compilación / Sincronización:** `2026-10-21T21:05:00Z`
* **Estado de Integración:** Listo para GitHub y GitHub Pages
* **Compatibilidad Móvil (PWA):** Android, iOS y Navegadores de Escritorio

---

## 🚀 Características Principales

### 1. 📱 Portal del Cliente (`index.html`)
* **Cabecera Limpia:** Únicamente muestra el logotipo oficial de WhatsApp con enlace directo en la barra de navegación superior (sin números telefónicos ni botones administrativos).
* **Catálogo Clínico Dinámico:** Cargado y renderizado reactivamente desde la base de datos `HomeVetDB`. Filtro interactivo por tipo de paciente (*Caninos, Felinos, Ambos*).
* **Formulario de Reserva Avanzado:**
  * Selector gráfico de tipo de mascota.
  * Selector múltiple de servicios con cálculo de presupuesto en tiempo real.
  * Geolocalización GPS asistida para ubicación exacta de visita.
  * Validación de horarios y días clínicos (Lunes a Sábado, 10:00 - 18:00).
  * Botón **"Enviar Reserva a WhatsApp"** (sin número visible en el botón).
  * Almacenamiento automático y transaccional en la base de datos previa apertura del chat de WhatsApp.
* **Información Telefónica Centralizada:** El número oficial de contacto (`63184686`) se encuentra reservado exclusivamente en la sección inferior de contacto y en el pie de página (*Footer*).

---

### 2. 🔐 Panel de Administración Especializado (`admin.html`)
* **Acceso Protegido:** Pantalla de autenticación con credenciales administrativas (`admin@homevet.com` / `admin123`).
* **Pestaña 1 - Servicios y Precios:**
  * Edición rápida de precios con un solo clic.
  * Interruptor para activar o pausar servicios del catálogo.
  * Modal para agregar nuevos servicios o modificar descripciones clínicas.
* **Pestaña 2 - Reservas de Clientes:**
  * Registro completo de todas las solicitudes enviadas por los usuarios.
  * Botón directo con enlace a WhatsApp para responder al cliente de forma instantánea.
  * Selector de estados de visita: *Pendiente, Confirmada, En Camino, Completada, Cancelada*.
  * **Exportación a Excel / CSV** con marcas de tiempo Unix e ISO para análisis.
* **Pestaña 3 - Base de Datos & Copias de Seguridad:**
  * Respaldo completo en formato **JSON** para descarga.
  * Restauración de base de datos desde archivo de respaldo.
  * Restablecimiento a valores de fábrica.

---

### 3. 🗄️ Base de Datos Estructurada (`db.js`)
* Motor transaccional basado en el estándar W3C **IndexedDB** (`HomeVet_Database`, v1).
* **Stores / Colecciones:**
  * `services`: Catálogo clínico con índices por categoría, tipo de mascota, estado activo y precio.
  * `reservations`: Almacena cada cita con:
    * `id`: Código alfanumérico único (ej. `#HV-8921`).
    * `timestamp`: Unix timestamp (ms) exacto.
    * `createdAtISO` y `updatedAtISO`: Timestamps en formato estándar ISO 8601.
    * `clientName`, `clientPhone`, `location`, `petType`, `petName`, `date`, `time`, `serviceNames`, `totalPrice`, `notes` y `status`.
* **Sincronización en Tiempo Real (Cross-Tab):** Utiliza `BroadcastChannel` para reflejar instantáneamente en `index.html` cualquier cambio de precio o servicio realizado en `admin.html`.
* **Respaldo en Espejo:** Sincronización continua con `localStorage` como capa de redundancia.

---

### 4. 📲 Compatibilidad PWA (Móviles Android / iOS)
* **Manifest Web (`manifest.json`):** Configurado con modo `standalone`, orientación vertical y paleta de colores de marca (`#0e697d`).
* **Service Worker (`sw.js`):**
  * Soporte offline con estrategia *Network-First* con *Cache-Fallback*.
  * Versionado automático basado en timestamp para invalidación de caché tras cada despliegue.
* **Banner de Instalación Móvil:** Detecta el evento `beforeinstallprompt` y ofrece a los usuarios en celular agregar la app directamente a su pantalla de inicio.

---

## 🛠️ Estructura del Proyecto

```text
homebet/
├── index.html          # Portal del cliente y formulario de reservas
├── admin.html          # Panel independiente de administración
├── styles.css          # Sistema de diseño, temas y diseño responsivo
├── app.js              # Controlador del cliente y reservas
├── admin.js            # Controlador del panel de administración
├── db.js               # Motor de Base de Datos IndexedDB y persistencia
├── manifest.json       # Manifiesto de aplicación PWA para celulares
├── sw.js               # Service Worker PWA para soporte offline
├── .gitignore          # Exclusiones de control de versiones
├── README.md           # Documentación del proyecto
└── assets/             # Recursos gráficos (logotipo, imágenes hero)
    ├── logo.png
    └── hero_pets.jpg
```

---

## 🌐 Pasos para Subir a GitHub y Desplegar en GitHub Pages

Cuando desees subir el proyecto a GitHub, ejecuta los siguientes comandos en tu terminal:

```bash
# 1. Inicializar el repositorio Git (si no está inicializado)
git init

# 2. Agregar todos los archivos preparados
git add .

# 3. Crear el commit con el timestamp oficial
git commit -m "feat(release): v1.2.0 - Base de datos IndexedDB, Panel Admin independiente, soporte PWA móvil y timestamps [2026-10-21T21:05:00Z]"

# 4. Vincular con tu repositorio remoto de GitHub
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 5. Subir a GitHub
git push -u origin main
```

### Para activar el despliegue automático gratis en GitHub Pages:
1. Ve a tu repositorio en GitHub.
2. Ingresa a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**. En un par de minutos tu sitio estará en línea con HTTPS y compatibilidad PWA para celulares.

---

## 📄 Licencia
© 2026 HomeVet. Todos los derechos reservados.
