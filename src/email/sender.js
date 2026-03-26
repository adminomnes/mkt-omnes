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
    let html = '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0f; color: #ffffff;">';
    
    html += '<div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #D4AF37;">';
    html += '<h1 style="color: #D4AF37; margin: 0;">OMNES HOLDING</h1>';
    html += '<p style="color: #888888; margin: 5px 0 0 0;">Innovación | Bienestar | Prosperidad</p>';
    html += '</div>';
    
    html += '<div style="padding: 30px 20px; line-height: 1.8;">';
    lines.forEach(line => {
      if (line.trim()) {
        const styled = line.startsWith('✓') || line.startsWith('•') 
          ? `<li style="margin: 10px 0;">${line}</li>` 
          : `<p>${line}</p>`;
        html += styled;
      }
    });
    html += '</div>';
    
    html += '<div style="text-align: center; padding: 20px; border-top: 1px solid #333;">';
    html += '<p style="color: #888888; font-size: 12px;">© 2024 OMNES HOLDING. Todos los derechos reservados.</p>';
    html += '</div>';
    
    html += '</body></html>';
    return html;
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