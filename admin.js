// ====================================================================
// HomeVet - Panel de Administración Especializado (admin.js)
// Conexión con HomeVetDB (IndexedDB), control de acceso, edición de
// catálogo, gestión de precios, control de reservas y respaldos.
// ====================================================================

const WHATSAPP_COUNTRY_CODE = '591';

// ICONOS SVG LIMPIOS Y PROFESIONALES
const ICONS = {
  stethoscope: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M13.5 14a4.5 4.5 0 0 0-9 0"/><path d="M9 18v3"/><circle cx="9" cy="21" r="1"/><path d="M18 10h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5"/></svg>`,
  syringe: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`,
  paw: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 11c-2.5 0-4.5 1.8-4.5 4 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-2.2-2-4-4.5-4z"/><circle cx="5.5" cy="9.5" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="18.5" cy="9.5" r="2"/></svg>`,
  bandage: `<svg class="svg-icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>`,
  microscope: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M6 18h8"/><path d="M3 22h18"/><path d="m14 22-.5-4.5a7 7 0 0 0-4.9-6.1L6 10"/><path d="M9 14h2"/><path d="M12 6 8.5 2.5a2.12 2.12 0 0 0-3 3L9 9"/><path d="m12 6 3 3"/></svg>`,
  file: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  sparkles: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  heart: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  edit: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
  trash: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  check: `<svg class="svg-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  chat: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  download: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
};

let currentReservationFilter = 'Todas';

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
  checkAdminAuth();
  setupEventListeners();

  // Escuchar cambios reactivos desde la base de datos (por ejemplo, si el cliente reserva en otra pestaña)
  if (window.HomeVetDB) {
    window.HomeVetDB.onChange((event) => {
      console.log('Notificación de cambio en BD recibida:', event);
      if (isAdminAuthenticated()) {
        renderAdminServices();
        renderAdminReservations();
        updateAdminStats();
      }
    });
  }
});

// CONTROL DE AUTENTICACIÓN
function isAdminAuthenticated() {
  return sessionStorage.getItem('homevet_admin_authenticated') === 'true';
}

function setAdminAuthenticated(val) {
  if (val) {
    sessionStorage.setItem('homevet_admin_authenticated', 'true');
  } else {
    sessionStorage.removeItem('homevet_admin_authenticated');
  }
}

function checkAdminAuth() {
  const loginSection = document.getElementById('admin-login-view');
  const dashboardSection = document.getElementById('admin-dashboard-view');

  if (isAdminAuthenticated()) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadDashboardData();
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }
}

window.handleAdminLogin = function(event) {
  event.preventDefault();

  const email = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value;
  const errorBox = document.getElementById('admin-login-error');

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    setAdminAuthenticated(true);
    if (errorBox) errorBox.style.display = 'none';
    checkAdminAuth();
    showToast('Sesión administrativa iniciada correctamente.', 'success');
  } else {
    if (errorBox) {
      errorBox.innerText = 'Credenciales no válidas. Verifica correo y contraseña.';
      errorBox.style.display = 'block';
    }
  }
};

window.prefillAdminCredentials = function() {
  document.getElementById('admin-login-email').value = ADMIN_CREDENTIALS.email;
  document.getElementById('admin-login-password').value = ADMIN_CREDENTIALS.password;
};

window.handleAdminLogout = function() {
  setAdminAuthenticated(false);
  checkAdminAuth();
  showToast('Has cerrado la sesión administrativa.', 'info');
};

async function loadDashboardData() {
  await renderAdminServices();
  await renderAdminReservations();
  await updateAdminStats();
}

// GESTIÓN DE TABS
window.switchAdminTab = function(tabName, buttonElement) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  if (buttonElement) buttonElement.classList.add('active');

  const servicesSection = document.getElementById('admin-section-services');
  const reservationsSection = document.getElementById('admin-section-reservations');
  const databaseSection = document.getElementById('admin-section-database');

  if (servicesSection) servicesSection.style.display = tabName === 'services' ? 'block' : 'none';
  if (reservationsSection) reservationsSection.style.display = tabName === 'reservations' ? 'block' : 'none';
  if (databaseSection) databaseSection.style.display = tabName === 'database' ? 'block' : 'none';
};

// ==========================================
// SECCIÓN 1: CATÁLOGO DE SERVICIOS Y PRECIOS
// ==========================================

async function renderAdminServices() {
  const tbody = document.getElementById('admin-services-table-body');
  if (!tbody || !window.HomeVetDB) return;

  try {
    const services = await window.HomeVetDB.getServices();

    if (services.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No hay servicios en el catálogo. Haz clic en "Añadir Nuevo Servicio".
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = services.map(s => {
      const iconSvg = ICONS[s.iconType] || ICONS.stethoscope;
      const petLabel = s.petType === 'Ambos' ? 'Caninos y Felinos' : (s.petType === 'Perro' ? 'Solo Caninos' : 'Solo Felinos');
      const isActive = s.active !== false;

      return `
        <tr>
          <td style="text-align: center; color: var(--primary);">${iconSvg}</td>
          <td>
            <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHTML(s.title)}</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px; max-width: 320px;">
              ${escapeHTML(s.description)}
            </p>
          </td>
          <td>
            <span class="badge" style="background:#f1f5f9; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.8rem; font-weight:700; color: #334155;">
              ${escapeHTML(s.category)}
            </span>
          </td>
          <td>
            <span style="font-weight: 600; font-size: 0.82rem; color: #475569;">
              ${petLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <strong style="color: var(--primary); font-size: 1.15rem; font-weight: 800;">Bs. ${s.price}</strong>
              <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="promptEditPrice(${s.id}, ${s.price})" title="Ajustar precio rápidamente">
                ${ICONS.edit} Editar Precio
              </button>
            </div>
          </td>
          <td>
            <button class="status-badge ${isActive ? 'status-completada' : 'status-cancelada'}" style="border:none; cursor:pointer;" onclick="toggleServiceStatus(${s.id})" title="Clic para alternar estado">
              ${isActive ? 'Activo' : 'Inactivo'}
            </button>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="openEditServiceModal(${s.id})">
                Editar
              </button>
              <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; color: var(--danger); border-color: var(--danger);" onclick="deleteService(${s.id})">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error cargando servicios admin:', err);
  }
}

window.promptEditPrice = async function(serviceId, currentPrice) {
  const newPriceStr = prompt(`Ingresa el nuevo precio en Bs. para este servicio:`, currentPrice);
  if (newPriceStr === null) return;

  const newPrice = parseFloat(newPriceStr);
  if (isNaN(newPrice) || newPrice <= 0) {
    showToast('Introduce un precio numérico válido mayor a 0.', 'error');
    return;
  }

  try {
    const updated = await window.HomeVetDB.updateServicePrice(serviceId, newPrice);
    await renderAdminServices();
    await updateAdminStats();
    showToast(`Precio de "${updated.title}" actualizado a Bs. ${newPrice}`, 'success');
  } catch (err) {
    showToast('Error al actualizar el precio.', 'error');
  }
};

window.toggleServiceStatus = async function(serviceId) {
  try {
    const updated = await window.HomeVetDB.toggleServiceActive(serviceId);
    await renderAdminServices();
    await updateAdminStats();
    showToast(`Servicio "${updated.title}" ahora está: ${updated.active ? 'Activo' : 'Inactivo'}`, 'info');
  } catch (err) {
    showToast('Error al cambiar el estado del servicio.', 'error');
  }
};

window.openAddServiceModal = function() {
  document.getElementById('service-modal-title').innerText = 'Añadir Nuevo Servicio';
  document.getElementById('service-modal-id').value = '';
  document.getElementById('service-form-title').value = '';
  document.getElementById('service-form-price').value = '';
  document.getElementById('service-form-category').value = 'Consulta';
  document.getElementById('service-form-pet').value = 'Ambos';
  document.getElementById('service-form-duration').value = '45 min';
  document.getElementById('service-form-desc').value = '';

  document.getElementById('service-modal').classList.add('active');
};

window.openEditServiceModal = async function(serviceId) {
  try {
    const s = await window.HomeVetDB.getService(serviceId);
    if (!s) return;

    document.getElementById('service-modal-title').innerText = 'Editar Servicio';
    document.getElementById('service-modal-id').value = s.id;
    document.getElementById('service-form-title').value = s.title;
    document.getElementById('service-form-price').value = s.price;
    document.getElementById('service-form-category').value = s.category || 'Consulta';
    document.getElementById('service-form-pet').value = s.petType || 'Ambos';
    document.getElementById('service-form-duration').value = s.duration || '40 min';
    document.getElementById('service-form-desc').value = s.description;

    document.getElementById('service-modal').classList.add('active');
  } catch (err) {
    showToast('Error al abrir el servicio para edición.', 'error');
  }
};

window.handleServiceFormSubmit = async function(event) {
  event.preventDefault();

  const id = document.getElementById('service-modal-id').value;
  const title = document.getElementById('service-form-title').value.trim();
  const price = parseFloat(document.getElementById('service-form-price').value);
  const category = document.getElementById('service-form-category').value;
  const petType = document.getElementById('service-form-pet').value;
  const duration = document.getElementById('service-form-duration').value.trim();
  const desc = document.getElementById('service-form-desc').value.trim();

  if (!title || isNaN(price) || price <= 0 || !desc) {
    showToast('Completa todos los campos obligatorios con valores correctos.', 'error');
    return;
  }

  try {
    const servicePayload = {
      id: id ? parseInt(id) : null,
      title,
      price,
      category,
      petType,
      duration: duration || '45 min',
      description: desc,
      active: true,
      iconType: 'stethoscope'
    };

    await window.HomeVetDB.saveService(servicePayload);
    closeModal('service-modal');
    await renderAdminServices();
    await updateAdminStats();
    showToast(id ? 'Servicio actualizado correctamente.' : 'Nuevo servicio añadido al catálogo.', 'success');
  } catch (err) {
    showToast('Error al guardar el servicio en la base de datos.', 'error');
  }
};

window.deleteService = async function(serviceId) {
  if (!confirm('¿Estás seguro de eliminar este servicio del catálogo?')) return;

  try {
    await window.HomeVetDB.deleteService(serviceId);
    await renderAdminServices();
    await updateAdminStats();
    showToast('Servicio eliminado de la base de datos.', 'info');
  } catch (err) {
    showToast('Error al eliminar el servicio.', 'error');
  }
};

// ==========================================
// SECCIÓN 2: GESTIÓN DE RESERVAS DE CLIENTES
// ==========================================

window.filterAdminReservations = function(status, btnElement) {
  currentReservationFilter = status;
  document.querySelectorAll('.reservation-filter-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderAdminReservations();
};

async function renderAdminReservations() {
  const tbody = document.getElementById('admin-reservations-table-body');
  if (!tbody || !window.HomeVetDB) return;

  try {
    let reservations = await window.HomeVetDB.getReservations();
    const searchTerm = (document.getElementById('admin-search-reservations')?.value || '').toLowerCase();

    if (currentReservationFilter !== 'Todas') {
      reservations = reservations.filter(r => r.status === currentReservationFilter);
    }

    if (searchTerm) {
      reservations = reservations.filter(r => 
        (r.clientName || '').toLowerCase().includes(searchTerm) || 
        (r.clientPhone || '').includes(searchTerm) ||
        (r.id || '').toLowerCase().includes(searchTerm) ||
        (r.location || '').toLowerCase().includes(searchTerm) ||
        (r.petName || '').toLowerCase().includes(searchTerm)
      );
    }

    if (reservations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            No se encontraron reservas con los filtros actuales.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = reservations.map(r => {
      const clientCleanPhone = (r.clientPhone || '').replace(/\D/g, '');
      const clientWhatsAppMsg = encodeURIComponent(`Hola ${r.clientName}, te contactamos desde HomeVet para coordinar tu cita veterinaria #${r.id} del ${r.date} a las ${r.time}.`);
      const clientWhatsAppUrl = `https://wa.me/${WHATSAPP_COUNTRY_CODE}${clientCleanPhone}?text=${clientWhatsAppMsg}`;

      return `
        <tr>
          <td>
            <div style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">${r.id}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${r.createdAt || ''}</div>
          </td>
          <td>
            <strong style="color: var(--text-primary);">${escapeHTML(r.clientName)}</strong>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 3px;">
              <span style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHTML(r.clientPhone)}</span>
              <a href="${clientWhatsAppUrl}" target="_blank" title="Abrir chat de WhatsApp con el cliente" style="color: #059669; display: inline-flex; align-items: center; text-decoration: none;">
                ${ICONS.chat}
              </a>
            </div>
          </td>
          <td style="max-width: 220px;">
            <div style="font-size: 0.82rem; line-height: 1.4; color: #334155;" title="${escapeHTML(r.location)}">
              ${escapeHTML(r.location)}
            </div>
            ${r.notes && r.notes !== 'Ninguna' ? `<div style="font-size: 0.74rem; color: var(--text-muted); font-style: italic; margin-top: 3px;">Nota: ${escapeHTML(r.notes)}</div>` : ''}
          </td>
          <td>
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary);">${r.petType}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHTML(r.petName || 'Sin datos')}</div>
          </td>
          <td>
            <div style="font-size: 0.88rem; font-weight: 700;">${r.date}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${r.time} hrs</div>
            <div style="font-size: 0.75rem; color: var(--primary); margin-top: 2px;">${escapeHTML(r.serviceNames || '')}</div>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 1.1rem; font-weight: 800;">Bs. ${r.totalPrice}</strong>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <select class="form-control" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; width: auto; font-weight: 700;" onchange="changeReservationStatus('${r.id}', this.value)">
                <option value="Pendiente" ${r.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="Confirmada" ${r.status === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                <option value="En Camino" ${r.status === 'En Camino' ? 'selected' : ''}>En Camino</option>
                <option value="Completada" ${r.status === 'Completada' ? 'selected' : ''}>Completada</option>
                <option value="Cancelada" ${r.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
              </select>
              <button onclick="deleteReservationRecord('${r.id}')" title="Eliminar reserva" style="background:none; border:none; color: var(--danger); cursor:pointer; padding: 4px;">
                ${ICONS.trash}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error renderizando reservas:', err);
  }
}

window.changeReservationStatus = async function(reservationId, newStatus) {
  try {
    await window.HomeVetDB.updateReservationStatus(reservationId, newStatus);
    await updateAdminStats();
    showToast(`Estado de reserva ${reservationId} actualizado a: ${newStatus}`, 'success');
  } catch (err) {
    showToast('Error al actualizar el estado de la reserva.', 'error');
  }
};

window.deleteReservationRecord = async function(reservationId) {
  if (!confirm(`¿Eliminar la reserva #${reservationId} de la base de datos?`)) return;

  try {
    await window.HomeVetDB.deleteReservation(reservationId);
    await renderAdminReservations();
    await updateAdminStats();
    showToast(`Reserva #${reservationId} eliminada.`, 'info');
  } catch (err) {
    showToast('Error al eliminar la reserva.', 'error');
  }
};

// ==========================================
// SECCIÓN 3: BASE DE DATOS Y RESPALDOS
// ==========================================

window.exportDatabaseJSON = async function() {
  try {
    const jsonStr = await window.HomeVetDB.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HomeVet_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada exitosamente en formato JSON.', 'success');
  } catch (err) {
    showToast('Error al exportar la base de datos.', 'error');
  }
};

window.exportReservationsCSV = async function() {
  try {
    const csvStr = await window.HomeVetDB.exportReservationsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HomeVet_Reservas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Planilla CSV de reservas descargada correctamente.', 'success');
  } catch (err) {
    showToast('Error al exportar archivo CSV.', 'error');
  }
};

window.importDatabaseJSON = function() {
  const input = document.getElementById('db-import-file-input');
  if (input) input.click();
};

window.handleFileImportChange = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      await window.HomeVetDB.importDatabaseJSON(e.target.result);
      await loadDashboardData();
      showToast('Base de datos restaurada correctamente desde el archivo.', 'success');
    } catch (err) {
      showToast('El archivo de respaldo no es válido.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

window.resetDatabaseToDefault = async function() {
  if (!confirm('¿Deseas restablecer la base de datos a sus valores iniciales de demostración? Se reconfigurarán los servicios y reservas base.')) return;

  try {
    await window.HomeVetDB.resetToDefault();
    await loadDashboardData();
    showToast('Base de datos restablecida a valores iniciales.', 'info');
  } catch (err) {
    showToast('Error al reiniciar base de datos.', 'error');
  }
};

// ==========================================
// MÉTRICAS Y ACTUALIZACIONES
// ==========================================

async function updateAdminStats() {
  if (!window.HomeVetDB) return;

  try {
    const stats = await window.HomeVetDB.getStats();

    const statRes = document.getElementById('stat-total-reservations');
    const statPending = document.getElementById('stat-pending-reservations');
    const statRev = document.getElementById('stat-total-revenue');
    const statServ = document.getElementById('stat-active-services');

    if (statRes) statRes.innerText = stats.totalReservations;
    if (statPending) statPending.innerText = stats.pendingReservations;
    if (statRev) statRev.innerText = `Bs. ${stats.totalRevenue}`;
    if (statServ) statServ.innerText = stats.activeServices;

    // Actualizar badges en pestaña de base de datos
    const dbStatRes = document.getElementById('db-stat-reservations');
    const dbStatServ = document.getElementById('db-stat-services');
    if (dbStatRes) dbStatRes.innerText = stats.totalReservations;
    if (dbStatServ) dbStatServ.innerText = stats.totalServices;
  } catch (err) {
    console.error('Error actualizando stats:', err);
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('admin-search-reservations');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdminReservations();
    });
  }
}

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconSvg = type === 'success' ? ICONS.check : (type === 'error' ? ICONS.bandage : ICONS.file);
  toast.innerHTML = `<span style="display:flex; align-items:center;">${iconSvg}</span> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
