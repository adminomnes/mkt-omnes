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
        content += `<li style="margin: 12px 0; color: #333; font-size: 15px; line-height: 1.6;">${trimmed}</li>`;
      } else if (trimmed.startsWith('✓') || trimmed.startsWith('✓')) {
        content += `<li style="margin: 12px 0; color: #0066cc; font-size: 15px; line-height: 1.6;">${trimmed}</li>`;
      } else if (trimmed.startsWith('📞') || trimmed.startsWith('📅') || trimmed.startsWith('🚀') || trimmed.startsWith('🔗')) {
        content += `<p style="color: #0066cc; font-size: 15px; font-weight: 600; margin: 15px 0;">${trimmed}</p>`;
      } else {
        content += `<p style="color: #333; font-size: 15px; line-height: 1.8; margin: 12px 0;">${trimmed}</p>`;
      }
    });
    
    const logoUrl = process.env.RENDER ? `https://${process.env.RENDER_EXTERNAL_URL}/images/logo-correos.png` : 'https://mkt-omnes.onrender.com/images/logo-correos.png';
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNES HOLDING</title>
</head>
<body style="margin: 0; padding: 0; background: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f4f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,102,204,0.15);">
          
          <!-- Header azul con logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #003366 0%, #0066cc 50%, #0088ff 100%); padding: 45px 40px; text-align: center;">
              <img src="https://mkt-omnes.onrender.com/images/logo-correos.png" alt="OMNES HOLDING" style="max-width: 220px; height: auto; margin-bottom: 20px;">
              <div style="width: 80px; height: 4px; background: #ffffff; margin: 0 auto; border-radius: 2px;"></div>
            </td>
          </tr>
          
          <!-- Línea decorativa azul -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #003366, #0066cc, #0088ff, #003366);"></td>
          </tr>
          
          <!-- Saludo -->
          <tr>
            <td style="padding: 40px 45px 20px; background: #ffffff;">
              <h2 style="margin: 0 0 10px; color: #003366; font-size: 22px; font-weight: 600;">¡Bienvenido/a!</h2>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">Gracias por tu interés en OMNES HOLDING. Estamos encantados de tenerte con nosotros.</p>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 20px 45px 30px; background: #ffffff;">
              <ul style="margin: 0; padding-left: 25px;">
                ${content}
              </ul>
            </td>
          </tr>
          
          <!-- Botón CTA -->
          <tr>
            <td style="padding: 0 45px 35px; text-align: center;">
              <a href="https://www.omnes.cl" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #0088ff 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(0,102,204,0.35);">
                VISITAR NUESTRA WEB
              </a>
            </td>
          </tr>
          
          <!-- Servicios -->
          <tr>
            <td style="background: linear-gradient(135deg, #f8fafc 0%, #e8f4fc 100%); padding: 35px 45px;">
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #003366; text-transform: uppercase; letter-spacing: 2px; text-align: center; font-weight: 600;">Nuestros Servicios</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 8px 5px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #003366, #0066cc); color: #ffffff; padding: 12px 18px; border-radius: 10px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,102,204,0.2);">📻 Radio Me Gusta</span>
                  </td>
                  <td style="text-align: center; padding: 8px 5px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #003366, #0066cc); color: #ffffff; padding: 12px 18px; border-radius: 10px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,102,204,0.2);">💚 Humanar</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 8px 5px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #003366, #0066cc); color: #ffffff; padding: 12px 18px; border-radius: 10px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,102,204,0.2);">💻 Digital Omnes</span>
                  </td>
                  <td style="text-align: center; padding: 8px 5px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #003366, #0066cc); color: #ffffff; padding: 12px 18px; border-radius: 10px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,102,204,0.2);">📊 Omnes Consultoria</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #003366 0%, #004488 100%); padding: 35px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 18px; color: #ffffff; font-weight: 700; letter-spacing: 2px;">OMNES HOLDING</p>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: rgba(255,255,255,0.7);">Innovación | Bienestar | Prosperidad</p>
              <div style="width: 40px; height: 2px; background: rgba(255,255,255,0.3); margin: 0 auto 15px;"></div>
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.6);">
                © 2024 OMNES HOLDING. Todos los derechos reservados.<br>
                Antofagasta, Chile<br>
                <a href="https://www.omnes.cl" style="color: #66b3ff; text-decoration: none;">www.omnes.cl</a>
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