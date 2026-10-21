// ====================================================================
// HomeVet - Módulo de Base de Datos Estructurada (IndexedDB + Storage)
// Base de datos robusta, escalable, con soporte de transacciones, índices,
// sincronización en tiempo real entre pestañas y respaldo JSON/CSV.
// ====================================================================

const DB_NAME = 'HomeVet_Database';
const DB_VERSION = 1;
const SYNC_CHANNEL_NAME = 'homevet_db_sync_channel';
const BUILD_TIMESTAMP = '2026-10-21T21:05:00Z';
const APP_VERSION = '1.2.0';

// CREDENCIALES ADMINISTRADOR
const ADMIN_CREDENTIALS = {
  email: 'admin@homevet.com',
  password: 'admin123'
};

// SERVICIOS INICIALES DE DEMOSTRACIÓN (CATÁLOGO CLÍNICO PROFESIONAL)
const INITIAL_SERVICES = [
  {
    id: 1,
    title: 'Consulta Médica General a Domicilio',
    category: 'Consulta',
    petType: 'Ambos',
    price: 120,
    duration: '45 - 60 min',
    description: 'Evaluación física completa: auscultación, temperatura, ojos, oídos, piel y mucosas en la comodidad y tranquilidad de tu hogar.',
    iconType: 'stethoscope',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Vacunación y Desparasitación Integral',
    category: 'Preventivo',
    petType: 'Ambos',
    price: 90,
    duration: '30 min',
    description: 'Aplicación de vacunas (Séxtuple/Óctuple para canes, Triple Felina para gatos, o Antirrábica) más desparasitación interna con carnet oficial.',
    iconType: 'syringe',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Control Pediátrico Cachorros y Gatitos',
    category: 'Preventivo',
    petType: 'Ambos',
    price: 100,
    duration: '40 min',
    description: 'Primera revisión veterinaria para nuevos miembros del hogar: plan nutricional, pautas de crianza, higiene y cronograma de vacunas.',
    iconType: 'paw',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Curación de Heridas y Tratamiento',
    category: 'Tratamiento',
    petType: 'Ambos',
    price: 110,
    duration: '45 min',
    description: 'Limpieza aséptica de heridas, cambio de vendajes, retiro de puntos, administración de inyectables y analgésicos indicados.',
    iconType: 'bandage',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Toma de Muestras y Laboratorio Clínico',
    category: 'Diagnóstico',
    petType: 'Ambos',
    price: 150,
    duration: '35 min',
    description: 'Extracción de sangre, raspados cutáneos o muestras biológicas a domicilio, sin el estrés de traslados a clínicas.',
    iconType: 'microscope',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Certificado Zoosanitario de Salud y Viaje',
    category: 'Documentos',
    petType: 'Ambos',
    price: 130,
    duration: '30 min',
    description: 'Emisión oficial de certificado veterinario de salud para viajes nacionales, aerolíneas o trámites de bienestar animal.',
    iconType: 'file',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    title: 'Baño Medicado y Cuidado Dermatológico',
    category: 'Dermatología',
    petType: 'Perro',
    price: 140,
    duration: '60 min',
    description: 'Tratamiento dérmico con champú medicado especial para problemas de hongos, alergias, dermatitis o control antiparasitario.',
    iconType: 'sparkles',
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    title: 'Atención Geriátrica y Cuidados Paliativos',
    category: 'Especialidad',
    petType: 'Ambos',
    price: 135,
    duration: '50 min',
    description: 'Atención compasiva para pacientes de la tercera edad: control del dolor crónico articular, movilidad y calidad de vida.',
    iconType: 'heart',
    active: true,
    updatedAt: new Date().toISOString()
  }
];

// RESERVAS INICIALES DE DEMOSTRACIÓN
const INITIAL_RESERVATIONS = [
  {
    id: 'HV-8921',
    clientName: 'Valeria Méndez',
    clientPhone: '77234567',
    location: 'Av. Las Palmas #450, Edif. Los Pinos, Apto 3B (Zona Norte)',
    petType: 'Perro',
    petName: 'Rocky (Golden Retriever, 3 años)',
    date: '2026-10-22',
    time: '11:00',
    serviceIds: [2],
    serviceNames: 'Vacunación y Desparasitación Integral',
    totalPrice: 90,
    notes: 'Es muy dócil. Tiene carnet de vacunación al día.',
    status: 'Confirmada',
    createdAt: '2026-10-21 08:30'
  },
  {
    id: 'HV-8922',
    clientName: 'Carlos Gutiérrez',
    clientPhone: '71098234',
    location: 'Calle Tulipanes #124, casa verde con portón negro',
    petType: 'Gato',
    petName: 'Michi (Gato común, 2 años)',
    date: '2026-10-22',
    time: '15:00',
    serviceIds: [1],
    serviceNames: 'Consulta Médica General a Domicilio',
    totalPrice: 120,
    notes: 'No quiere comer desde ayer y está decaído.',
    status: 'Pendiente',
    createdAt: '2026-10-21 09:15'
  },
  {
    id: 'HV-8920',
    clientName: 'Mariana Suarez',
    clientPhone: '76543210',
    location: 'Condominio Sevilla 2, Casa #88 (Anillo 3)',
    petType: 'Ambos',
    petName: 'Lucas (Perro) y Luna (Gata)',
    date: '2026-10-21',
    time: '16:00',
    serviceIds: [1, 2],
    serviceNames: 'Consulta Médica General a Domicilio, Vacunación y Desparasitación Integral',
    totalPrice: 210,
    notes: 'Revisión semestral preventiva de ambos.',
    status: 'En Camino',
    createdAt: '2026-10-20 14:20'
  }
];

class HomeVetDatabase {
  constructor() {
    this.db = null;
    this.listeners = [];
    this.syncChannel = null;
    this.isReadyPromise = this.init();

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.syncChannel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === 'homevet_db_version_ping') {
            this.notifyListeners({ type: 'storage_ping' });
          }
        });
      }
    } catch (err) {
      console.warn('Sync channel not available:', err);
    }
  }

  // Inicializar IndexedDB con fallback seguro a LocalStorage
  async init() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB no soportado en este entorno. Usando LocalStorage.');
        this.ensureLocalStorageSeed();
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store: services
        if (!db.objectStoreNames.contains('services')) {
          const serviceStore = db.createObjectStore('services', { keyPath: 'id' });
          serviceStore.createIndex('category', 'category', { unique: false });
          serviceStore.createIndex('petType', 'petType', { unique: false });
          serviceStore.createIndex('active', 'active', { unique: false });
          serviceStore.createIndex('price', 'price', { unique: false });
        }

        // Store: reservations
        if (!db.objectStoreNames.contains('reservations')) {
          const resStore = db.createObjectStore('reservations', { keyPath: 'id' });
          resStore.createIndex('date', 'date', { unique: false });
          resStore.createIndex('status', 'status', { unique: false });
          resStore.createIndex('clientPhone', 'clientPhone', { unique: false });
          resStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store: config
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this.ensureInitialSeed();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Error abriendo IndexedDB:', event.target.error);
        this.ensureLocalStorageSeed();
        resolve(null);
      };
    });
  }

  // Comprobar y sembrar datos iniciales si la BD está vacía
  async ensureInitialSeed() {
    if (!this.db) {
      this.ensureLocalStorageSeed();
      return;
    }

    try {
      const services = await this.getAllFromStore('services');
      if (!services || services.length === 0) {
        // Cargar desde LocalStorage si existe o cargar defaults
        const cached = localStorage.getItem('homevet_services');
        const seedServices = cached ? JSON.parse(cached) : INITIAL_SERVICES;
        for (const s of seedServices) {
          await this.putInStore('services', s);
        }
      }

      const reservations = await this.getAllFromStore('reservations');
      if (!reservations || reservations.length === 0) {
        const cachedRes = localStorage.getItem('homevet_reservations');
        const seedRes = cachedRes ? JSON.parse(cachedRes) : INITIAL_RESERVATIONS;
        for (const r of seedRes) {
          await this.putInStore('reservations', r);
        }
      }

      // Sincronizar siempre copia en LocalStorage para redundancia
      await this.syncMirrorToLocalStorage();
    } catch (err) {
      console.warn('Error en sembrado inicial:', err);
      this.ensureLocalStorageSeed();
    }
  }

  ensureLocalStorageSeed() {
    if (!localStorage.getItem('homevet_services')) {
      localStorage.setItem('homevet_services', JSON.stringify(INITIAL_SERVICES));
    }
    if (!localStorage.getItem('homevet_reservations')) {
      localStorage.setItem('homevet_reservations', JSON.stringify(INITIAL_RESERVATIONS));
    }
  }

  async syncMirrorToLocalStorage() {
    try {
      const services = await this.getAllFromStore('services');
      const reservations = await this.getAllFromStore('reservations');
      if (services) localStorage.setItem('homevet_services', JSON.stringify(services));
      if (reservations) localStorage.setItem('homevet_reservations', JSON.stringify(reservations));
    } catch (e) {
      // Ignorar si falla
    }
  }

  // Operaciones genéricas con IndexedDB
  getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        const raw = localStorage.getItem(`homevet_${storeName}`);
        resolve(raw ? JSON.parse(raw) : []);
        return;
      }
      try {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (err) {
        const raw = localStorage.getItem(`homevet_${storeName}`);
        resolve(raw ? JSON.parse(raw) : []);
      }
    });
  }

  getOneFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        const list = JSON.parse(localStorage.getItem(`homevet_${storeName}`) || '[]');
        resolve(list.find(item => item.id === key) || null);
        return;
      }
      try {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  putInStore(storeName, value) {
    return new Promise((resolve, reject) => {
      // Sincronizar en LocalStorage como backup inmediato
      try {
        const list = JSON.parse(localStorage.getItem(`homevet_${storeName}`) || '[]');
        const idx = list.findIndex(item => item.id === value.id);
        if (idx >= 0) {
          list[idx] = value;
        } else {
          list.push(value);
        }
        localStorage.setItem(`homevet_${storeName}`, JSON.stringify(list));
      } catch (e) {}

      if (!this.db) {
        resolve(value);
        return;
      }

      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value);
        req.onsuccess = () => resolve(value);
        req.onerror = () => reject(req.error);
      } catch (err) {
        resolve(value);
      }
    });
  }

  deleteFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const list = JSON.parse(localStorage.getItem(`homevet_${storeName}`) || '[]');
        const filtered = list.filter(item => item.id !== key);
        localStorage.setItem(`homevet_${storeName}`, JSON.stringify(filtered));
      } catch (e) {}

      if (!this.db) {
        resolve(true);
        return;
      }

      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (err) {
        resolve(true);
      }
    });
  }

  // ==========================================
  // MÉTODOS PÚBLICOS: GESTIÓN DE SERVICIOS
  // ==========================================

  async getServices(onlyActive = false) {
    await this.isReadyPromise;
    const list = await this.getAllFromStore('services');
    list.sort((a, b) => a.id - b.id);
    if (onlyActive) {
      return list.filter(s => s.active !== false);
    }
    return list;
  }

  async getService(id) {
    await this.isReadyPromise;
    return await this.getOneFromStore('services', parseInt(id));
  }

  async saveService(service) {
    await this.isReadyPromise;
    if (!service.id) {
      const all = await this.getServices();
      const maxId = all.reduce((max, s) => Math.max(max, s.id || 0), 0);
      service.id = maxId + 1;
    } else {
      service.id = parseInt(service.id);
    }
    service.price = parseFloat(service.price) || 0;
    service.updatedAt = new Date().toISOString();
    if (typeof service.active === 'undefined') service.active = true;

    await this.putInStore('services', service);
    this.broadcastChange('service_saved', service);
    return service;
  }

  async updateServicePrice(id, newPrice) {
    await this.isReadyPromise;
    const service = await this.getService(id);
    if (!service) throw new Error('Servicio no encontrado');
    service.price = parseFloat(newPrice);
    service.updatedAt = new Date().toISOString();
    await this.putInStore('services', service);
    this.broadcastChange('service_price_updated', service);
    return service;
  }

  async toggleServiceActive(id) {
    await this.isReadyPromise;
    const service = await this.getService(id);
    if (!service) throw new Error('Servicio no encontrado');
    service.active = !service.active;
    service.updatedAt = new Date().toISOString();
    await this.putInStore('services', service);
    this.broadcastChange('service_toggled', service);
    return service;
  }

  async deleteService(id) {
    await this.isReadyPromise;
    await this.deleteFromStore('services', parseInt(id));
    this.broadcastChange('service_deleted', { id: parseInt(id) });
    return true;
  }

  // ==========================================
  // MÉTODOS PÚBLICOS: GESTIÓN DE RESERVAS
  // ==========================================

  async getReservations() {
    await this.isReadyPromise;
    const list = await this.getAllFromStore('reservations');
    // Ordenar de más reciente a más antiguo
    list.sort((a, b) => {
      const dateA = a.createdAt || a.date || '';
      const dateB = b.createdAt || b.date || '';
      return dateB.localeCompare(dateA);
    });
    return list;
  }

  async getReservation(id) {
    await this.isReadyPromise;
    return await this.getOneFromStore('reservations', id);
  }

  async addReservation(reservationData) {
    await this.isReadyPromise;
    const id = reservationData.id || ('HV-' + Math.floor(1000 + Math.random() * 9000));
    const now = new Date();
    const timestamp = reservationData.timestamp || now.getTime();
    const isoString = reservationData.createdAtISO || now.toISOString();
    const createdAt = reservationData.createdAt || now.toISOString().slice(0, 16).replace('T', ' ');

    const completeRecord = {
      id: id,
      clientName: (reservationData.clientName || '').trim(),
      clientPhone: (reservationData.clientPhone || '').trim(),
      location: (reservationData.location || '').trim(),
      petType: reservationData.petType || 'Perro',
      petName: (reservationData.petName || 'No indicado').trim(),
      date: reservationData.date,
      time: reservationData.time,
      serviceIds: reservationData.serviceIds || [],
      serviceNames: reservationData.serviceNames || '',
      totalPrice: parseFloat(reservationData.totalPrice) || 0,
      notes: (reservationData.notes || 'Ninguna').trim(),
      status: reservationData.status || 'Pendiente',
      timestamp: timestamp,
      createdAtISO: isoString,
      createdAt: createdAt,
      updatedAtISO: isoString,
      source: 'web_booking'
    };

    await this.putInStore('reservations', completeRecord);
    this.broadcastChange('reservation_added', completeRecord);
    return completeRecord;
  }

  async updateReservationStatus(id, newStatus) {
    await this.isReadyPromise;
    const reservation = await this.getReservation(id);
    if (!reservation) throw new Error('Reserva no encontrada');
    reservation.status = newStatus;
    reservation.updatedAt = new Date().toISOString();
    await this.putInStore('reservations', reservation);
    this.broadcastChange('reservation_status_updated', reservation);
    return reservation;
  }

  async deleteReservation(id) {
    await this.isReadyPromise;
    await this.deleteFromStore('reservations', id);
    this.broadcastChange('reservation_deleted', { id });
    return true;
  }

  // ==========================================
  // ESTADÍSTICAS Y MÉTRICAS
  // ==========================================

  async getStats() {
    await this.isReadyPromise;
    const reservations = await this.getReservations();
    const services = await this.getServices();

    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter(r => r.status === 'Pendiente').length;
    const confirmedReservations = reservations.filter(r => r.status === 'Confirmada' || r.status === 'En Camino').length;
    const completedReservations = reservations.filter(r => r.status === 'Completada').length;
    const totalRevenue = reservations
      .filter(r => r.status !== 'Cancelada')
      .reduce((sum, r) => sum + (parseFloat(r.totalPrice) || 0), 0);
    const activeServices = services.filter(s => s.active !== false).length;

    return {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      completedReservations,
      totalRevenue,
      activeServices,
      totalServices: services.length
    };
  }

  // ==========================================
  // RESPALDO, EXPORTACIÓN E IMPORTACIÓN
  // ==========================================

  async exportDatabaseJSON() {
    await this.isReadyPromise;
    const services = await this.getServices();
    const reservations = await this.getReservations();
    const now = new Date();

    const exportData = {
      app: 'HomeVet Domiciliar',
      version: APP_VERSION,
      schemaVersion: DB_VERSION,
      buildTimestamp: BUILD_TIMESTAMP,
      exportTimestamp: now.toISOString(),
      exportTimestampUnix: now.getTime(),
      gitReady: true,
      pwaReady: true,
      recordCounts: {
        services: services.length,
        reservations: reservations.length
      },
      services: services,
      reservations: reservations
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importDatabaseJSON(jsonString) {
    await this.isReadyPromise;
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.services || !parsed.reservations) {
        throw new Error('El archivo no contiene una estructura válida de HomeVet.');
      }

      // Importar servicios
      for (const s of parsed.services) {
        await this.putInStore('services', s);
      }

      // Importar reservas
      for (const r of parsed.reservations) {
        await this.putInStore('reservations', r);
      }

      await this.syncMirrorToLocalStorage();
      this.broadcastChange('database_imported', { count: parsed.reservations.length });
      return true;
    } catch (err) {
      console.error('Error importando BD:', err);
      throw err;
    }
  }

  async exportReservationsCSV() {
    await this.isReadyPromise;
    const reservations = await this.getReservations();
    
    const headers = [
      'Codigo',
      'Timestamp_Unix',
      'Timestamp_ISO',
      'Fecha_Creacion',
      'Cliente',
      'Telefono',
      'Direccion',
      'Mascota_Tipo',
      'Mascota_Nombre',
      'Fecha_Cita',
      'Hora_Cita',
      'Servicios',
      'Total_Bs',
      'Estado',
      'Notas'
    ];

    const rows = reservations.map(r => [
      r.id,
      r.timestamp || '',
      r.createdAtISO || '',
      r.createdAt || '',
      `"${(r.clientName || '').replace(/"/g, '""')}"`,
      r.clientPhone,
      `"${(r.location || '').replace(/"/g, '""')}"`,
      r.petType,
      `"${(r.petName || '').replace(/"/g, '""')}"`,
      r.date,
      r.time,
      `"${(r.serviceNames || '').replace(/"/g, '""')}"`,
      r.totalPrice,
      r.status,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    return csvContent;
  }

  async resetToDefault() {
    await this.isReadyPromise;
    
    // Limpiar stores
    const services = await this.getServices();
    for (const s of services) {
      await this.deleteFromStore('services', s.id);
    }
    const res = await this.getReservations();
    for (const r of res) {
      await this.deleteFromStore('reservations', r.id);
    }

    // Reinsertar defaults
    for (const s of INITIAL_SERVICES) {
      await this.putInStore('services', s);
    }
    for (const r of INITIAL_RESERVATIONS) {
      await this.putInStore('reservations', r);
    }

    await this.syncMirrorToLocalStorage();
    this.broadcastChange('database_reset', {});
    return true;
  }

  // ==========================================
  // EVENTOS Y SINCRONIZACIÓN CROSS-TAB
  // ==========================================

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error('Error en listener DB:', err);
      }
    });
  }

  broadcastChange(type, payload) {
    const data = { type, payload, timestamp: Date.now() };
    this.notifyListeners(data);
    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage(data);
      } catch (e) {}
    }
    try {
      localStorage.setItem('homevet_db_version_ping', String(Date.now()));
    } catch (e) {}
  }
}

// Instancia global compartida
const db = new HomeVetDatabase();
window.HomeVetDB = db;
