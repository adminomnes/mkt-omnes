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
    let content = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        content += `<li style="margin: 12px 0; color: #e0e0e0; font-size: 15px; line-height: 1.6;">${trimmed}</li>`;
      } else if (trimmed.startsWith('✓') || trimmed.startsWith('✓')) {
        content += `<li style="margin: 12px 0; color: #22c55e; font-size: 15px; line-height: 1.6;">${trimmed}</li>`;
      } else if (trimmed.startsWith('📞') || trimmed.startsWith('📅') || trimmed.startsWith('🚀') || trimmed.startsWith('🔗')) {
        content += `<p style="color: #D4AF37; font-size: 15px; font-weight: 600; margin: 15px 0;">${trimmed}</p>`;
      } else {
        content += `<p style="color: #e0e0e0; font-size: 15px; line-height: 1.8; margin: 12px 0;">${trimmed}</p>`;
      }
    });
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNES HOLDING</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header con logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #D4AF37; letter-spacing: 3px;">OMNES</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #888; letter-spacing: 2px;">HOLDING</p>
              <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #D4AF37, #f4d03f); margin: 20px auto 0; border-radius: 2px;"></div>
            </td>
          </tr>
          
          <!-- Línea decorativa dorada -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, transparent, #D4AF37, transparent);"></td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 35px; background: #ffffff;">
              <ul style="margin: 0; padding-left: 20px;">
                ${content}
              </ul>
            </td>
          </tr>
          
          <!-- Botón CTA -->
          <tr>
            <td style="padding: 0 35px 30px; text-align: center;">
              <a href="https://www.omnes.cl" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #f4d03f 100%); color: #0a0a0f; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(212,175,55,0.3);">
                VISITAR OMNES
              </a>
            </td>
          </tr>
          
          <!-- Servicios -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px 35px; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Nuestros Servicios</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background: #0a0a0f; color: #D4AF37; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">RADIO</span>
                  </td>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background: #0a0a0f; color: #D4AF37; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">HUMANAR</span>
                  </td>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background: #0a0a0f; color: #D4AF37; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">DIGITAL</span>
                  </td>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background: #0a0a0f; color: #D4AF37; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONSULTORÍA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0f; padding: 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #D4AF37; font-weight: 600;">OMNES HOLDING</p>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #666;">Innovación | Bienestar | Prosperidad</p>
              <p style="margin: 0; font-size: 11px; color: #444;">
                © 2024 OMNES HOLDING. Todos los derechos reservados.<br>
                Antofagasta, Chile
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