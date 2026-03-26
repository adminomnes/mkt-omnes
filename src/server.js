const express = require('express');
const cron = require('node-cron');
const path = require('path');
const apiRoutes = require('./api/routes');
const emailSvc = require('./email/sender');
const db = require('./database/db');
const imgGen = require('./images/generator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.post('/api/lead', async (req, res) => {
  try {
    const { nombre, email, telefono, area } = req.body;
    
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    const areaValida = ['radio', 'humanar', 'digital', 'consultoria'];
    const areaLead = areaValida.includes(area) ? area : 'digital';
    
    const emailExistente = db.getLeadByEmail(email);
    if (emailExistente) {
      return res.status(200).json({ 
        message: 'Lead ya existente', 
        lead: emailExistente 
      });
    }
    
    const areaData = {
      radio: { etiqueta: 'RADIO', servicio: 'radio', descripcion: 'Contenido comunicacional y posicionamiento' },
      humanar: { etiqueta: 'HUMANAR', servicio: 'bienestar', descripcion: 'Bienestar y terapias' },
      digital: { etiqueta: 'DIGITAL', servicio: 'marketing', descripcion: 'Marketing y crecimiento de negocio' },
      consultoria: { etiqueta: 'CONSULTORIA', servicio: 'consultoria', descripcion: 'Estrategia y optimización empresarial' }
    };
    
    const datosArea = areaData[areaLead];
    
    const lead = db.saveLead({
      nombre,
      email,
      telefono: telefono || '',
      area: datosArea.etiqueta,
      servicio: datosArea.servicio,
      areaDescripcion: datosArea.descripcion,
      automatizacionActiva: true,
      secuenciaIniciada: true,
      secuenciaInicio: new Date().toISOString()
    });
    
    const imagenLead = await imgGen.generarImagenLead(lead);
    lead.imagenBienvenida = imagenLead;
    db.updateLead(lead.id, { imagenBienvenida: imagenLead });
    
    await emailSvc.enviarBienvenida(lead);
    
    db.addHistorial(lead.id, { 
      tipo: 'captura', 
      area: datosArea.etiqueta, 
      descripcion: `Lead capturado vía formulario - Área: ${datosArea.etiqueta}`,
      status: 'completado'
    });
    
    res.status(201).json({
      success: true,
      message: `Lead capturado exitosamente - Área: ${datosArea.etiqueta}`,
      lead,
      imagen: imagenLead,
      secuencia: `Secuencia de ${datosArea.etiqueta} iniciada automáticamente`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/lead', async (req, res) => {
  try {
    const { nombre, email, telefono, area } = req.body;
    
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    const areaValida = ['radio', 'humanar', 'digital', 'consultoria'];
    const areaLead = areaValida.includes(area) ? area : 'digital';
    
    const emailExistente = db.getLeadByEmail(email);
    if (emailExistente) {
      return res.status(200).json({ 
        message: 'Lead ya existente', 
        lead: emailExistente 
      });
    }
    
    const areaData = {
      radio: { etiqueta: 'RADIO', servicio: 'radio', descripcion: 'Contenido comunicacional y posicionamiento' },
      humanar: { etiqueta: 'HUMANAR', servicio: 'bienestar', descripcion: 'Bienestar y terapias' },
      digital: { etiqueta: 'DIGITAL', servicio: 'marketing', descripcion: 'Marketing y crecimiento de negocio' },
      consultoria: { etiqueta: 'CONSULTORIA', servicio: 'consultoria', descripcion: 'Estrategia y optimización empresarial' }
    };
    
    const datosArea = areaData[areaLead];
    
    const lead = db.saveLead({
      nombre,
      email,
      telefono: telefono || '',
      area: datosArea.etiqueta,
      servicio: datosArea.servicio,
      areaDescripcion: datosArea.descripcion,
      automatizacionActiva: true,
      secuenciaIniciada: true,
      secuenciaInicio: new Date().toISOString()
    });
    
    const imagenLead = await imgGen.generarImagenLead(lead);
    lead.imagenBienvenida = imagenLead;
    db.updateLead(lead.id, { imagenBienvenida: imagenLead });
    
    await emailSvc.enviarBienvenida(lead);
    
    db.addHistorial(lead.id, { 
      tipo: 'captura', 
      area: datosArea.etiqueta, 
      descripcion: `Lead capturado vía webhook - Área: ${datosArea.etiqueta}`,
      status: 'completado'
    });
    
    res.status(201).json({
      success: true,
      message: `Lead capturado exitosamente - Área: ${datosArea.etiqueta}`,
      lead,
      imagen: imagenLead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contacto.html'));
});

app.get('/contacto.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contacto.html'));
});

cron.schedule('*/30 * * * *', async () => {
  console.log('[CRON] Ejecutando secuencia de automatización...');
  const config = db.getConfig();
  if (config.automations.enabled) {
    const results = await emailSvc.procesarSecuencia();
    if (results.length > 0) {
      console.log(`[CRON] ${results.length} emails procesados`);
    }
  }
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║     OMNES HOLDING - SISTEMA DE MARKETING AUTOMÁTICO   ║
╠═══════════════════════════════════════════════════════╣
║  Servidor activo en: http://localhost:${PORT}           ║
║  Panel de control:  http://localhost:${PORT}/dashboard  ║
║  API webhook:       http://localhost:${PORT}/api/webhook/lead ║
╚═══════════════════════════════════════════════════════╝

SISTEMA OPERATIVO:
• Captura de leads: Activa
• Secuencia automática: En ejecución cada 30 min
• Generación de contenido: Lista
• Generación de imágenes: Lista
• Panel de control: Disponible
  `);
});

module.exports = app;