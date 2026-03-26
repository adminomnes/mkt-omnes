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
        content += `<li style="margin: 14px 0; color: #2c3e50; font-size: 15px; line-height: 1.7; padding-left: 8px;">${trimmed}</li>`;
      } else if (trimmed.startsWith('✓')) {
        content += `<li style="margin: 14px 0; color: #0066cc; font-size: 15px; line-height: 1.7; font-weight: 500;">${trimmed}</li>`;
      } else if (trimmed.startsWith('📞') || trimmed.startsWith('📅') || trimmed.startsWith('🚀') || trimmed.startsWith('🔗')) {
        content += `<p style="color: #0066cc; font-size: 16px; font-weight: 600; margin: 20px 0 15px; padding: 15px; background: linear-gradient(135deg, #f0f7ff, #e6f2ff); border-radius: 10px; border-left: 4px solid #0066cc;">${trimmed}</p>`;
      } else {
        content += `<p style="color: #2c3e50; font-size: 15px; line-height: 1.8; margin: 14px 0;">${trimmed}</p>`;
      }
    });
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNES HOLDING</title>
</head>
<body style="margin: 0; padding: 0; background: #e8ecf1; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  
  <!-- Wrapper principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #e8ecf1 0%, #d4dce8 100%); padding: 50px 15px;">
    <tr>
      <td align="center">
        
        <!-- Logo Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 120px; margin-bottom: 30px;">
          <tr>
            <td style="text-align: center;">
              <img src="https://mkt-omnes.onrender.com/images/logo-correos.png" alt="OMNES HOLDING" style="max-width: 120px; height: auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
            </td>
          </tr>
        </table>
        
        <!-- Email Card Principal -->
        <table width="680" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,51,102,0.12), 0 10px 30px rgba(0,0,0,0.08);">
          
          <!-- Header Premium -->
          <tr>
            <td style="background: linear-gradient(135deg, #002855 0%, #003d99 40%, #0052cc 70%, #0073e6 100%); padding: 50px 50px 45px; text-align: center; position: relative;">
              <!-- Efecto de brillo superior -->
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);"></div>
              
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 4px; font-weight: 500;">Bienvenido a</p>
              <h1 style="margin: 0 0 5px; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 6px;">OMNES</h1>
              <p style="margin: 0 0 20px; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 8px; font-weight: 300;">HOLDING</p>
              
              <!-- Línea decorativa elegante -->
              <table width="60" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="height: 2px; background: linear-gradient(90deg, transparent, #ffffff, transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Línea decorativa bajo header -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #002855, #0066cc, #0073e6, #002855);"></td>
          </tr>
          
          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 50px 55px 40px; background: #ffffff;">
              
              <!-- Saludo Elegante -->
              <div style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid #eaeff5;">
                <h2 style="margin: 0 0 12px; color: #002855; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">¡Bienvenido/a!</h2>
                <p style="margin: 0; color: #5a6c7d; font-size: 15px; line-height: 1.7;">Gracias por confiar en nosotros. Estamos comprometidos con tu éxito yremos trabajando para brindarte el mejor servicio.</p>
              </div>
              
              <!-- Contenido -->
              <ul style="margin: 0; padding-left: 0; list-style: none;">
                ${content}
              </ul>
              
            </td>
          </tr>
          
          <!-- CTA Premium -->
          <tr>
            <td style="padding: 0 55px 45px; background: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #0066cc 0%, #0073e6 100%); border-radius: 14px; text-align: center; padding: 3px;">
                    <a href="https://www.omnes.cl" style="display: block; background: linear-gradient(135deg, #0073e6 0%, #0088ff 100%); color: #ffffff; text-decoration: none; padding: 20px 40px; border-radius: 12px; font-weight: 600; font-size: 15px; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 8px 25px rgba(0,102,204,0.35);">
                      Visit our Website →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Servicios Section -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f0f4f8 100%); padding: 40px 55px;">
              
              <p style="margin: 0 0 25px; font-size: 12px; color: #002855; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; text-align: center;">Our Services</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                <tr>
                  <td width="50%" style="padding: 0 8px 16px 0; vertical-align: top;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #002855, #003d99); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 18px 15px; text-align: center;">
                          <p style="margin: 0 0 4px; font-size: 20px;">📻</p>
                          <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Radio Me Gusta</p>
                          <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px;">Communication</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 0 0 16px 8px; vertical-align: top;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #002855, #003d99); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 18px 15px; text-align: center;">
                          <p style="margin: 0 0 4px; font-size: 20px;">💚</p>
                          <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Humanar</p>
                          <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px;">Wellness</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 0 8px 0 0; vertical-align: top;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #002855, #003d99); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 18px 15px; text-align: center;">
                          <p style="margin: 0 0 4px; font-size: 20px;">💻</p>
                          <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Digital Omnes</p>
                          <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px;">Marketing</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 0 0 0 8px; vertical-align: top;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #002855, #003d99); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 18px 15px; text-align: center;">
                          <p style="margin: 0 0 4px; font-size: 20px;">📊</p>
                          <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Omnes Consultoria</p>
                          <p style="margin: 5px 0 0; color: rgba(255,255,255,0.6); font-size: 10px;">Strategy</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer Premium -->
          <tr>
            <td style="background: linear-gradient(135deg, #001a33 0%, #002855 50%, #003d99 100%); padding: 45px 50px; text-align: center;">
              
              <p style="margin: 0 0 6px; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 4px;">OMNES</p>
              <p style="margin: 0 0 20px; color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 3px;">HOLDING</p>
              
              <p style="margin: 0 0 25px; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.8;">Innovation • Wellbeing • Prosperity</p>
              
              <table width="50" cellpadding="0" cellspacing="0" style="margin: 0 auto 25px;">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);"></td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.8;">
                © 2024 OMNES HOLDING. All rights reserved.<br>
                Antofagasta, Chile<br>
                <a href="https://www.omnes.cl" style="color: #66b3ff; text-decoration: none; font-weight: 500;">www.omnes.cl</a>
              </p>
              
            </td>
          </tr>
          
        </table>
        
        <!-- Espacio inferior -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 200px; margin-top: 35px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #8896a6; font-size: 11px; letter-spacing: 1px;">Innovación | Bienestar | Prosperidad</p>
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