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

### 3. 🗄️ Arquitectura de Base de Datos Dual: PostgreSQL / PostgREST & IndexedDB
* **PostgreSQL / PostgREST (`schema_postgrest.sql`):**
  * Esquema relacional estricto con tablas `services`, `reservations`, `admin_users`, `system_config` y `audit_logs`.
  * Tipos de alta fidelidad: `TIMESTAMPTZ` para todas las marcas de tiempo con valor por defecto `NOW()`.
  * Triggers automáticos en PL/pgSQL para actualización de `updated_at`.
  * Procedimiento RPC `test_timestamps(test_label)` para certificación y validación de marcas de tiempo del servidor.
  * Roles de seguridad PostgREST (`anon`, `admin_role`) con políticas RLS para lectura pública y mutación controlada.
* **IndexedDB Local Transaccional (`db.js`):**
  * Persistencia nativa offline de alta velocidad con 8 índices B-Tree.
  * Funciona al 100% en GitHub Pages sin necesidad obligatoria de backend externo.
  * Cliente PostgREST integrado con sincronización automática en segundo plano y botón de sincronización masiva en el panel administrativo.
  * Copia espejo continua en `localStorage`.

---

### 4. 🧪 Laboratorio de Pruebas de Timestamps y Diagnóstico
* Integrado en la 4ª pestaña del panel administrativo (`admin.html`).
* **Verificación de Timestamps:**
  * Prueba de formato ISO 8601 (RFC 3339) con milisegundos y UTC `Z`.
  * Validación de Epoch Unix (`timestamp_epoch_ms`).
  * Precisión de parseo bidireccional (Date ↔ ISO ↔ Unix ms) con desviación de 0 ms.
  * Cálculo dinámico de intervalos temporales (-24 horas y +7 días).
  * Comparación y sincronización de reloj cliente contra reloj del servidor PostgreSQL/PostgREST.
* **Simulador de Citas:** Genera reservas de prueba con marcas temporales pasadas (-24h), en tiempo real (ahora) y futuras (+7 días).

---

### 5. 📲 Optimización Móvil PWA y Ergonomía Táctil
* **Botones Grandes y Accesibles:** Cumplen con las pautas de accesibilidad táctil W3C/Google (mínimo 48px - 54px de altura) tanto en teléfonos celulares como en computadoras.
* **Prevención de Zoom en iOS:** Controles de formulario con tamaño de fuente óptimo (16px / 1rem) para evitar el molesto auto-zoom de Safari móvil.
* **Botón Flotante de WhatsApp Móvil (FAB):** Botón circular de 58x58px en la esquina inferior para contacto directo con un solo toque.
* **Service Worker (`sw.js`) & Manifest:** Capacidad offline, pantalla completa *standalone* e instalación directa en la pantalla de inicio del teléfono.

---

## 🛠️ Estructura del Proyecto

```text
homebet/
├── index.html            # Portal del cliente y formulario de reservas PWA
├── admin.html            # Panel de administración (servicios, reservas, BD y pruebas)
├── styles.css            # Sistema de diseño responsivo y botones táctiles grandes
├── app.js                # Controlador del portal de reservas
├── admin.js              # Controlador del panel de administración y pruebas
├── db.js                 # Capa de datos dual (IndexedDB + Cliente PostgREST)
├── schema_postgrest.sql  # Script DDL completo de PostgreSQL para PostgREST
├── manifest.json         # Manifiesto PWA para instalación móvil
├── sw.js                 # Service Worker PWA para soporte offline
├── .gitignore            # Exclusiones de control de versiones
├── README.md             # Documentación del proyecto
└── assets/               # Recursos gráficos (logotipo, imágenes)
    ├── logo.png
    └── hero_pets.jpg
```

---

## 🌐 Pasos para Subir a GitHub y Desplegar en GitHub Pages

Para actualizar o subir tu proyecto al repositorio de GitHub:

```bash
# 1. Verificar el estado de los cambios
git status

# 2. Agregar todos los archivos actualizados
git add .

# 3. Crear el commit de actualización
git commit -m "feat(core): Optimizaciones PWA móvil, arquitectura PostgREST y suite de timestamps [2026-10-21T22:45:00Z]"

# 4. Asegurarse de estar en la rama main
git branch -M main

# 5. Si es la primera vez, vincular el repositorio remoto:
# git remote add origin https://github.com/hancosaucedo-ai/homebet.git

# 6. Subir a GitHub
git push -u origin main
```

### Para activar o verificar GitHub Pages:
1. Ve a tu repositorio en GitHub: [https://github.com/hancosaucedo-ai/homebet](https://github.com/hancosaucedo-ai/homebet)
2. Ingresa a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Source**, selecciona `Deploy from a branch`.
4. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
5. Haz clic en **Save**. En un par de minutos tu sitio estará en línea con HTTPS y certificado PWA.

---

## 📄 Licencia
© 2026 HomeVet. Todos los derechos reservados.
