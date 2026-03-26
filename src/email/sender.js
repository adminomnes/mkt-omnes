const { Resend } = require('resend');
const db = require('../database/db');
const contentGen = require('../content/generator');

class EmailService {
  constructor() {
    this.resend = null;
  }

  getResend() {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY || db.getConfig().email.resendApiKey;
      if (apiKey) {
        this.resend = new Resend(apiKey);
      }
    }
    return this.resend;
  }

  getFromEmail() {
    const config = db.getConfig();
    return process.env.EMAIL_FROM || config.email.from || 'OMNES HOLDING <noreply@omnes.cl>';
  }

  async sendEmail(to, subject, body) {
    const resend = this.getResend();
    
    if (!resend) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return { success: true, mock: true };
    }
    
    try {
      const data = await resend.emails.send({
        from: this.getFromEmail(),
        to: [to],
        subject,
        html: this.textToHtml(body)
      });
      
      console.log(`[EMAIL ENVIADO] To: ${to}, Subject: ${subject}`);
      return { success: true, messageId: data.data?.id };
    } catch (error) {
      console.error('Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }

  textToHtml(text) {
    const lines = text.split('\n');
    let bodyContent = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      bodyContent += `<p style="margin: 0 0 18px; color: #e0e0e0; font-size: 15px; line-height: 1.8;">${trimmed}</p>`;
    });
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNES HOLDING</title>
</head>
<body style="margin: 0; padding: 0; background: #0a0a0f; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a0f; padding: 50px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background: #12121a; border-radius: 16px; overflow: hidden; max-width: 600px;">
          
          <!-- Header con logo -->
          <tr>
            <td style="padding: 50px 40px 40px; text-align: center; background: #0a0a0f;">
              <img src="https://mkt-omnes.onrender.com/images/logo-correos.png" alt="OMNES HOLDING" style="max-width: 180px; height: auto; margin-bottom: 30px;">
              <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #666, transparent); margin: 0 auto;"></div>
            </td>
          </tr>
          
          <!-- Línea decorativa -->
          <tr>
            <td style="height: 1px; background: linear-gradient(90deg, transparent, #333, #555, #333, transparent);"></td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 45px 50px; background: #12121a;">
              ${bodyContent}
            </td>
          </tr>
          
          <!-- Área seleccionada -->
          <tr>
            <td style="padding: 0 50px 40px; background: #12121a;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a25; border-radius: 12px; border: 1px solid #2a2a3a;">
                <tr>
                  <td style="padding: 20px 25px; text-align: center;">
                    <p style="margin: 0 0 5px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Área de atención</p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; letter-spacing: 1px;">Ecosistema de estrategia, tecnología y bienestar</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Botón -->
          <tr>
            <td style="padding: 0 50px 40px; background: #12121a; text-align: center;">
              <a href="https://www.omnes.cl" style="display: inline-block; background: transparent; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 1px; border: 1px solid #555;">
                Visitar www.omnes.cl
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0f; padding: 35px 50px; text-align: center; border-top: 1px solid #222;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 3px;">OMNES HOLDING</p>
              <p style="margin: 0 0 20px; color: #666; font-size: 11px; letter-spacing: 1px;">Innovación | Bienestar | Prosperidad</p>
              <div style="width: 40px; height: 1px; background: #333; margin: 0 auto 20px;"></div>
              <p style="margin: 0 0 8px; color: #888; font-size: 12px;">
                📧 contacto@omnes.cl | 📞 Antofagasta, Chile
              </p>
              <p style="margin: 20px 0 0; color: #555; font-size: 10px;">
                © 2024 OMNES HOLDING. Todos los derechos reservados.<br>
                Este mensaje fue enviado a través de nuestro sistema automático.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>`;
  }

  async enviarBienvenida(lead) {
    const area = lead.area || 'DIGITAL';
    const { subject, body } = contentGen.generarEmailBienvenida(lead.nombre, area);
    const result = await this.sendEmail(lead.email, subject, body);
    
    if (result.success) {
      db.updateLead(lead.id, { 'secuencia.dia0': true });
      db.addHistorial(lead.id, { tipo: 'email', template: 'bienvenida', area, status: 'enviado' });
    }
    
    return result;
  }

  async enviarContenido(lead) {
    const area = lead.area || 'DIGITAL';
    const { subject, body } = contentGen.generarEmailContenido(lead.nombre, area);
    const result = await this.sendEmail(lead.email, subject, body);
    
    if (result.success) {
      db.updateLead(lead.id, { 'secuencia.dia1': true });
      db.addHistorial(lead.id, { tipo: 'email', template: 'contenido', area, status: 'enviado' });
    }
    
    return result;
  }

  async enviarBeneficios(lead) {
    const area = lead.area || 'DIGITAL';
    const { subject, body } = contentGen.generarEmailBeneficios(lead.nombre, area);
    const result = await this.sendEmail(lead.email, subject, body);
    
    if (result.success) {
      db.updateLead(lead.id, { 'secuencia.dia3': true });
      db.addHistorial(lead.id, { tipo: 'email', template: 'beneficios', area, status: 'enviado' });
    }
    
    return result;
  }

  async enviarCaso(lead) {
    const area = lead.area || 'DIGITAL';
    const { subject, body } = contentGen.generarEmailCaso(lead.nombre, area);
    const result = await this.sendEmail(lead.email, subject, body);
    
    if (result.success) {
      db.updateLead(lead.id, { 'secuencia.dia5': true });
      db.addHistorial(lead.id, { tipo: 'email', template: 'caso', area, status: 'enviado' });
    }
    
    return result;
  }

  async enviarOferta(lead) {
    const area = lead.area || 'DIGITAL';
    const { subject, body } = contentGen.generarEmailOferta(lead.nombre, area);
    const result = await this.sendEmail(lead.email, subject, body);
    
    if (result.success) {
      db.updateLead(lead.id, { 'secuencia.dia7': true });
      db.addHistorial(lead.id, { tipo: 'email', template: 'oferta', area, status: 'enviado' });
    }
    
    return result;
  }

  async procesarSecuencia() {
    const config = db.getConfig();
    if (!config.automations.enabled) return;
    
    const pending = db.getPendingEmails();
    const results = [];
    
    for (const item of pending) {
      const { lead, tipo } = item;
      const stepConfig = config.automations.secuencia[tipo];
      
      if (!stepConfig || !stepConfig.enabled) continue;
      
      let result;
      switch (tipo) {
        case 'dia1': result = await this.enviarContenido(lead); break;
        case 'dia3': result = await this.enviarBeneficios(lead); break;
        case 'dia5': result = await this.enviarCaso(lead); break;
        case 'dia7': result = await this.enviarOferta(lead); break;
      }
      
      results.push({ leadId: lead.id, tipo, result });
    }
    
    return results;
  }
}

module.exports = new EmailService();