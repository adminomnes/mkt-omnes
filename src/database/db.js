const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../../data');

class Database {
  constructor() {
    this.leadsFile = path.join(DB_PATH, 'leads.json');
    this.configFile = path.join(DB_PATH, 'config.json');
    this.ensureDataDir();
    this.initializeFiles();
  }

  ensureDataDir() {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(DB_PATH, { recursive: true });
    }
  }

  initializeFiles() {
    if (!fs.existsSync(this.leadsFile)) {
      this.writeJSON(this.leadsFile, []);
    }
    if (!fs.existsSync(this.configFile)) {
      const defaultConfig = this.getDefaultConfig();
      if (process.env.RESEND_API_KEY) {
        defaultConfig.email.resendApiKey = process.env.RESEND_API_KEY;
      }
      if (process.env.EMAIL_FROM) {
        defaultConfig.email.from = process.env.EMAIL_FROM;
      }
      this.writeJSON(this.configFile, defaultConfig);
    }
  }

  readJSON(file) {
    try {
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, 'utf-8');
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  getLeads() {
    const data = this.readJSON(this.leadsFile);
    return data || [];
  }

  saveLead(lead) {
    const leads = this.getLeads();
    const newLead = {
      id: uuidv4(),
      ...lead,
      fechaIngreso: new Date().toISOString(),
      estado: 'nuevo',
      score: 0,
      historial: [],
      secuencia: { dia0: false, dia1: false, dia3: false, dia5: false, dia7: false }
    };
    leads.push(newLead);
    this.writeJSON(this.leadsFile, leads);
    return newLead;
  }

  updateLead(id, updates) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      const lead = leads[index];
      for (const [key, value] of Object.entries(updates)) {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          if (!lead[parent]) lead[parent] = {};
          lead[parent][child] = value;
        } else {
          lead[key] = value;
        }
      }
      leads[index] = lead;
      this.writeJSON(this.leadsFile, leads);
      return leads[index];
    }
    return null;
  }

  deleteLead(id) {
    const leads = this.getLeads();
    const filtered = leads.filter(l => l.id !== id);
    this.writeJSON(this.leadsFile, filtered);
    return filtered;
  }

  getLeadById(id) {
    const leads = this.getLeads();
    return leads.find(l => l.id === id);
  }

  getLeadByEmail(email) {
    const leads = this.getLeads();
    return leads.find(l => l.email.toLowerCase() === email.toLowerCase());
  }

  getConfig() {
    const data = this.readJSON(this.configFile);
    return data || this.getDefaultConfig();
  }

  saveConfig(config) {
    this.writeJSON(this.configFile, config);
  }

  getDefaultConfig() {
    return {
      automations: {
        enabled: true,
        secuencia: {
          dia0: { enabled: true, subject: 'Bienvenido a OMNES HOLDING', template: 'bienvenida' },
          dia1: { enabled: true, subject: 'Contenido de valor para ti', template: 'contenido' },
          dia3: { enabled: true, subject: 'Beneficios exclusivos', template: 'beneficios' },
          dia5: { enabled: true, subject: 'Caso de éxito', template: 'caso' },
          dia7: { enabled: true, subject: 'Oferta especial', template: 'oferta' }
        }
      },
      email: {
        from: process.env.EMAIL_FROM || 'OMNES HOLDING <contacto@omnes.cl>',
        resendApiKey: process.env.RESEND_API_KEY || '',
        smtp: { host: '', port: 587, user: '', pass: '' }
      },
      servicios: [
        { id: 'tecnologia', nombre: 'Tecnología', descripcion: 'Soluciones tech innovadoras' },
        { id: 'bienestar', nombre: 'Bienestar', descripcion: 'Programas de bienestar integral' },
        { id: 'negocio', nombre: 'Negocio', descripcion: 'Desarrollo empresarial' }
      ]
    };
  }

  addHistorial(id, evento) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index].historial.push({
        fecha: new Date().toISOString(),
        ...evento
      });
      this.writeJSON(this.leadsFile, leads);
      return leads[index];
    }
    return null;
  }

  getLeadsByState(estado) {
    const leads = this.getLeads();
    return leads.filter(l => l.estado === estado);
  }

  getPendingEmails() {
    const leads = this.getLeads();
    const pending = [];
    const now = new Date();
    
    leads.forEach(lead => {
      if (lead.estado === 'convertido') return;
      
      const fechaIngreso = new Date(lead.fechaIngreso);
      const diffDays = Math.floor((now - fechaIngreso) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 1 && !lead.secuencia.dia1) {
        pending.push({ lead, tipo: 'dia1', dia: 1 });
      }
      if (diffDays >= 3 && !lead.secuencia.dia3) {
        pending.push({ lead, tipo: 'dia3', dia: 3 });
      }
      if (diffDays >= 5 && !lead.secuencia.dia5) {
        pending.push({ lead, tipo: 'dia5', dia: 5 });
      }
      if (diffDays >= 7 && !lead.secuencia.dia7) {
        pending.push({ lead, tipo: 'dia7', dia: 7 });
      }
    });
    
    return pending;
  }
}

module.exports = new Database();