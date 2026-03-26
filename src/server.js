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