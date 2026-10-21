// ====================================================================
// HomeVet - Módulo de Cliente y Reservas (app.js)
// Conexión con HomeVetDB, catálogo interactivo, validación de citas y
// redirección directa y profesional a WhatsApp.
// ====================================================================

const WHATSAPP_NUMBER = '63184686';
const WHATSAPP_COUNTRY_CODE = '591'; // Bolivia (+591)

// REPOSITORIO DE ICONOS SVG VECTORIALES
const ICONS = {
  stethoscope: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M13.5 14a4.5 4.5 0 0 0-9 0"/><path d="M9 18v3"/><circle cx="9" cy="21" r="1"/><path d="M18 10h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5"/></svg>`,
  syringe: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`,
  paw: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 11c-2.5 0-4.5 1.8-4.5 4 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-2.2-2-4-4.5-4z"/><circle cx="5.5" cy="9.5" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="18.5" cy="9.5" r="2"/></svg>`,
  bandage: `<svg class="svg-icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>`,
  microscope: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M6 18h8"/><path d="M3 22h18"/><path d="m14 22-.5-4.5a7 7 0 0 0-4.9-6.1L6 10"/><path d="M9 14h2"/><path d="M12 6 8.5 2.5a2.12 2.12 0 0 0-3 3L9 9"/><path d="m12 6 3 3"/></svg>`,
  file: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  sparkles: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  heart: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  clock: `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mapPin: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  check: `<svg class="svg-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`
};

let currentPetFilter = 'todos';
let selectedBookingPetType = 'Perro';
let selectedBookingTime = '10:00';

// INICIALIZACION AL CARGAR EL DOM
document.addEventListener('DOMContentLoaded', async () => {
  await renderServicesCatalog();
  await populateBookingServiceSelect();
  initTimeSlots();
  setupDateValidation();
  setupEventListeners();

  // Escuchar cambios en la base de datos (por ejemplo, si el administrador modifica precios en admin.html)
  if (window.HomeVetDB) {
    window.HomeVetDB.onChange(async (event) => {
      console.log('Actualización de base de datos reflejada en catálogo:', event);
      await renderServicesCatalog();
      await populateBookingServiceSelect();
    });
  }
});

// ==========================================
// RENDERIZADO DEL CATÁLOGO DE SERVICIOS
// ==========================================

async function renderServicesCatalog() {
  const container = document.getElementById('services-grid');
  if (!container || !window.HomeVetDB) return;

  try {
    const services = await window.HomeVetDB.getServices(true); // Solo servicios activos
    const filtered = services.filter(s => {
      if (currentPetFilter === 'todos') return true;
      if (currentPetFilter === 'perro') return s.petType === 'Perro' || s.petType === 'Ambos';
      if (currentPetFilter === 'gato') return s.petType === 'Gato' || s.petType === 'Ambos';
      if (currentPetFilter === 'ambos') return s.petType === 'Ambos';
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          <p>No se encontraron servicios disponibles para el filtro seleccionado.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(service => {
      const badgeClass = service.petType === 'Perro' ? 'pet-perro' : (service.petType === 'Gato' ? 'pet-gato' : 'pet-ambos');
      const badgeText = service.petType === 'Ambos' ? 'Caninos y Felinos' : (service.petType === 'Perro' ? 'Solo Caninos' : 'Solo Felinos');
      const iconSvg = ICONS[service.iconType] || ICONS.stethoscope;

      return `
        <div class="service-card" data-service-id="${service.id}">
          <div class="service-badge ${badgeClass}">${badgeText}</div>
          <div class="service-icon-wrapper">${iconSvg}</div>
          <h3 class="service-title">${escapeHTML(service.title)}</h3>
          <p class="service-desc">${escapeHTML(service.description)}</p>
          
          <div class="service-meta">
            <div class="service-meta-item">
              ${ICONS.clock}
              <span>${escapeHTML(service.duration || '40 min')}</span>
            </div>
            <div class="service-meta-item">
              ${ICONS.mapPin}
              <span>Servicio a Domicilio</span>
            </div>
          </div>

          <div class="service-pricing">
            <div class="price-tag">Bs. ${service.price} <span>/ servicio</span></div>
            <button class="btn btn-outline" style="padding: 0.45rem 1rem; font-size: 0.82rem;" onclick="quickBookService(${service.id})">
              Reservar Cita
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error cargando catálogo de servicios:', err);
  }
}

// FILTRADO POR TIPO DE MASCOTA
window.filterServicesByPet = function(type, buttonElement) {
  currentPetFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (buttonElement) buttonElement.classList.add('active');
  renderServicesCatalog();
};

// BOTÓN DIRECTO "RESERVAR ESTE"
window.quickBookService = function(serviceId) {
  const serviceSelect = document.getElementById('booking-services');
  if (serviceSelect) {
    const options = Array.from(serviceSelect.options);
    options.forEach(opt => {
      if (parseInt(opt.value) === serviceId) {
        opt.selected = true;
      }
    });
    updateBookingSummary();
  }
  const bookingSection = document.getElementById('reservar');
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// ==========================================
// FORMULARIO DE RESERVAS
// ==========================================

async function populateBookingServiceSelect() {
  const select = document.getElementById('booking-services');
  if (!select || !window.HomeVetDB) return;

  try {
    const previouslySelected = Array.from(select.selectedOptions).map(o => o.value);
    const services = await window.HomeVetDB.getServices(true);

    select.innerHTML = services.map(s => `
      <option value="${s.id}" data-price="${s.price}">
        ${escapeHTML(s.title)} — Bs. ${s.price}
      </option>
    `).join('');

    // Restaurar selecciones o seleccionar la primera por defecto
    if (previouslySelected.length > 0) {
      Array.from(select.options).forEach(opt => {
        if (previouslySelected.includes(opt.value)) opt.selected = true;
      });
    } else if (services.length > 0) {
      select.options[0].selected = true;
    }

    updateBookingSummary();
  } catch (err) {
    console.error('Error poblando selector de servicios:', err);
  }
}

window.selectPetType = function(type) {
  selectedBookingPetType = type;
  document.querySelectorAll('.pet-radio-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-pet') === type);
  });
  updateBookingSummary();
};

function initTimeSlots() {
  const container = document.getElementById('time-slots-container');
  if (!container) return;

  const slots = [
    '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  container.innerHTML = slots.map((time, idx) => `
    <div class="time-slot ${idx === 0 ? 'active' : ''}" onclick="selectTimeSlot('${time}', this)">
      ${time}
    </div>
  `).join('');

  selectedBookingTime = slots[0];
}

window.selectTimeSlot = function(time, element) {
  selectedBookingTime = time;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
  if (element) element.classList.add('active');
  updateBookingSummary();
};

function setupDateValidation() {
  const dateInput = document.getElementById('booking-date');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
  dateInput.value = `${yyyy}-${mm}-${dd}`;

  dateInput.addEventListener('change', () => {
    const chosenDate = new Date(dateInput.value + 'T00:00:00');
    const dayOfWeek = chosenDate.getDay(); // 0 = Domingo
    
    if (dayOfWeek === 0) {
      showToast('Atención: Nuestro horario de atención a domicilio es de Lunes a Sábado de 10:00 a 18:00. Los domingos no hay servicio regular.', 'error');
      dateInput.value = '';
      return;
    }
    updateBookingSummary();
  });
}

window.getCurrentLocation = function() {
  const locationInput = document.getElementById('booking-location');
  if (!navigator.geolocation) {
    showToast('Tu navegador no cuenta con soporte para geolocalización.', 'error');
    return;
  }

  showToast('Obteniendo tu ubicación actual...', 'info');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(5);
      const lng = position.coords.longitude.toFixed(5);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      locationInput.value = `Ubicación GPS: Lat ${lat}, Lng ${lng} (${mapsUrl})`;
      showToast('Ubicación GPS obtenida correctamente.', 'success');
      updateBookingSummary();
    },
    () => {
      showToast('No fue posible obtener la ubicación GPS automática. Por favor escribe tu dirección manualmente.', 'error');
    },
    { timeout: 8000 }
  );
};

function updateBookingSummary() {
  const serviceSelect = document.getElementById('booking-services');
  const summaryServices = document.getElementById('summary-services-list');
  const summaryTotal = document.getElementById('summary-total-price');
  const summaryPet = document.getElementById('summary-pet-type');
  const summaryDateTime = document.getElementById('summary-date-time');

  let total = 0;
  let selectedNames = [];

  if (serviceSelect) {
    Array.from(serviceSelect.selectedOptions).forEach(opt => {
      const price = parseFloat(opt.getAttribute('data-price')) || 0;
      total += price;
      selectedNames.push(opt.text.split('—')[0].trim());
    });
  }

  if (summaryServices) {
    summaryServices.innerHTML = selectedNames.length > 0 
      ? selectedNames.join(', ') 
      : '<span style="color:var(--text-muted)">Ningún servicio seleccionado</span>';
  }

  if (summaryTotal) {
    summaryTotal.innerText = `Bs. ${total}`;
  }

  if (summaryPet) {
    summaryPet.innerText = selectedBookingPetType;
  }

  if (summaryDateTime) {
    const dateVal = document.getElementById('booking-date')?.value || 'Fecha no definida';
    summaryDateTime.innerText = `${dateVal} a las ${selectedBookingTime || '10:00'}`;
  }
}

// ==========================================
// SUBMIT DE RESERVA, ALMACENAMIENTO EN BASE
// DE DATOS Y REDIRECCIÓN DIRECTA A WHATSAPP
// ==========================================

window.handleBookingSubmit = async function(event) {
  event.preventDefault();

  const name = document.getElementById('booking-name').value.trim();
  const phone = document.getElementById('booking-phone').value.trim();
  const location = document.getElementById('booking-location').value.trim();
  const petName = document.getElementById('booking-pet-name').value.trim();
  const date = document.getElementById('booking-date').value;
  const notes = document.getElementById('booking-notes').value.trim();
  const serviceSelect = document.getElementById('booking-services');

  if (!name || !phone || !location || !date || !selectedBookingTime) {
    showToast('Por favor completa todos los campos requeridos con asterisco (*).', 'error');
    return;
  }

  const chosenDate = new Date(date + 'T00:00:00');
  if (chosenDate.getDay() === 0) {
    showToast('Recuerda que nuestro horario de atención es de Lunes a Sábado de 10:00 a 18:00.', 'error');
    return;
  }

  const selectedOptions = Array.from(serviceSelect.selectedOptions);
  if (selectedOptions.length === 0) {
    showToast('Selecciona al menos un servicio para tu reserva.', 'error');
    return;
  }

  let total = 0;
  let serviceIds = [];
  let serviceDetails = [];

  selectedOptions.forEach(opt => {
    const price = parseFloat(opt.getAttribute('data-price')) || 0;
    total += price;
    serviceIds.push(parseInt(opt.value));
    serviceDetails.push(`• ${opt.text}`);
  });

  const reservationId = 'HV-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const createdAt = now.toISOString().slice(0, 16).replace('T', ' ');

  // 1. Guardar formalmente en la base de datos estructurada
  const reservationRecord = {
    id: reservationId,
    clientName: name,
    clientPhone: phone,
    location: location,
    petType: selectedBookingPetType,
    petName: petName || 'No indicado',
    date: date,
    time: selectedBookingTime,
    serviceIds: serviceIds,
    serviceNames: selectedOptions.map(o => o.text.split('—')[0].trim()).join(', '),
    totalPrice: total,
    notes: notes || 'Sin notas adicionales',
    status: 'Pendiente',
    createdAt: createdAt
  };

  try {
    if (window.HomeVetDB) {
      await window.HomeVetDB.addReservation(reservationRecord);
    }
  } catch (err) {
    console.error('Error guardando reserva en la base de datos:', err);
  }

  // 2. Formato estructurado para mensaje de WhatsApp
  const whatsappMessage = 
`*NUEVA RESERVA DE SERVICIO A DOMICILIO - HOMEVET*
──────────────────────────────────────
Codigo: ${reservationId}
Cliente: ${name}
Telefono: ${phone}
Direccion de Visita: ${location}
Mascota: ${selectedBookingPetType} (${petName || 'Sin nombre especificado'})
Fecha: ${date}
Horario: ${selectedBookingTime} (Lun - Sab: 10:00 - 18:00)

Servicios Solicitados:
${serviceDetails.join('\n')}

Total Estimado: Bs. ${total}
Sintomas / Observaciones: ${notes || 'Ninguna'}
──────────────────────────────────────
Hola HomeVet, solicito confirmar mi reserva a domicilio en este horario.`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${WHATSAPP_COUNTRY_CODE}${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // 3. Mostrar modal de confirmación y redireccionar directamente a WhatsApp
  showConfirmationModal(reservationRecord, whatsappUrl);
};

function showConfirmationModal(reservation, whatsappUrl) {
  const modal = document.getElementById('confirmation-modal');
  const detailsContainer = document.getElementById('modal-booking-details');
  const btnWhatsApp = document.getElementById('modal-whatsapp-btn');

  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--accent-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.85rem; border: 1px solid var(--accent-subtle);">
          ${ICONS.check}
        </div>
        <h3 style="color: var(--primary); font-size: 1.35rem; font-weight: 800;">Reserva Registrada Exitosamente</h3>
        <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">Código de confirmación: <strong>#${reservation.id}</strong></p>
      </div>

      <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.88rem; line-height: 1.7; border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
        <div><strong>Cliente:</strong> ${escapeHTML(reservation.clientName)} (${escapeHTML(reservation.clientPhone)})</div>
        <div><strong>Dirección:</strong> ${escapeHTML(reservation.location)}</div>
        <div><strong>Mascota:</strong> ${escapeHTML(reservation.petType)} - ${escapeHTML(reservation.petName)}</div>
        <div><strong>Cita:</strong> ${reservation.date} a las ${reservation.time}</div>
        <div><strong>Servicios:</strong> ${escapeHTML(reservation.serviceNames)}</div>
        <div style="margin-top: 0.5rem; font-size: 1.15rem; color: var(--primary); font-weight: 800;">
          <strong>Total Estimado:</strong> Bs. ${reservation.totalPrice}
        </div>
      </div>
      <p style="text-align: center; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0;">
        Tu solicitud ha sido almacenada en la base de datos y se abrirá WhatsApp para coordinar tu atención.
      </p>
    `;
  }

  if (btnWhatsApp) {
    btnWhatsApp.onclick = () => {
      window.open(whatsappUrl, '_blank');
    };
  }

  if (modal) modal.classList.add('active');

  // Redireccionar directamente a WhatsApp en una nueva pestaña
  window.open(whatsappUrl, '_blank');
}

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

function setupEventListeners() {
  const bookingServiceSelect = document.getElementById('booking-services');
  if (bookingServiceSelect) {
    bookingServiceSelect.addEventListener('change', updateBookingSummary);
  }
}

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
