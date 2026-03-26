const express = require('express');
const db = require('../database/db');
const emailSvc = require('../email/sender');
const contentGen = require('../content/generator');
const imgGen = require('../images/generator');
const conversion = require('../conversion/scorer');

const router = express.Router();

router.post('/lead', async (req, res) => {
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
      secuencia: `Secuencia de ${datosArea.etiqueta} iniciada automáticamente`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook/lead', async (req, res) => {
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
      lead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leads', (req, res) => {
  const leads = db.getLeads();
  res.json(leads);
});

router.get('/leads/:id', (req, res) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
});

router.put('/leads/:id', (req, res) => {
  const lead = db.updateLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
});

router.delete('/leads/:id', (req, res) => {
  const leads = db.deleteLead(req.params.id);
  res.json({ success: true, leads });
});

router.post('/leads/:id/convertir', (req, res) => {
  const lead = conversion.convertirLead(req.params.id, req.body.metodo || 'manual');
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
});

router.get('/leads-prioritarios', (req, res) => {
  const leads = conversion.getLeadsPrioritarios();
  res.json(leads);
});

router.get('/stats', (req, res) => {
  const stats = conversion.getEstadisticasConversion();
  res.json(stats);
});

router.get('/config', (req, res) => {
  res.json(db.getConfig());
});

router.put('/config', (req, res) => {
  db.saveConfig(req.body);
  res.json({ success: true });
});

router.post('/trigger-secuencia', async (req, res) => {
  const results = await emailSvc.procesarSecuencia();
  res.json({ success: true, processed: results.length, results });
});

router.get('/generar-copy', (req, res) => {
  const { servicio, tipo } = req.query;
  const copy = contentGen.generarCopyRedes(servicio || 'tecnologia', tipo || 'post');
  res.json(copy);
});

router.post('/generar-imagen', (req, res) => {
  const { texto, tipo } = req.body;
  const imagen = imgGen.generarImagenRedes(texto, tipo || 'cuadrado');
  res.json({ url: imagen });
});

router.post('/generar-banner', (req, res) => {
  const { titulo, subtitulo, cta } = req.body;
  const imagen = imgGen.generarBannerPromocional(titulo, subtitulo, cta);
  res.json({ url: imagen });
});

router.get('/sugerir-cierre/:id', (req, res) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  const sugerencia = conversion.sugerirCierre(lead);
  res.json(sugerencia);
});

router.get('/imagenes', (req, res) => {
  const imagenes = imgGen.listImages();
  res.json(imagenes);
});

module.exports = router;