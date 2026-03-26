const db = require('../database/db');

class ConversionEngine {
  constructor() {
    this.pesoInteraccion = {
      email_abierto: 5,
      email_click: 15,
      respuesta: 20,
      cita_solicitada: 50,
      conversacion: 30
    };
  }

  calcularScore(lead) {
    let score = 0;
    
    if (lead.secuencia.dia0) score += 5;
    if (lead.secuencia.dia1) score += 10;
    if (lead.secuencia.dia3) score += 15;
    if (lead.secuencia.dia5) score += 15;
    if (lead.secuencia.dia7) score += 20;
    
    if (lead.historial) {
      lead.historial.forEach(evento => {
        score += this.pesoInteraccion[evento.tipo] || 0;
      });
    }
    
    const daysActive = Math.floor((new Date() - new Date(lead.fechaIngreso)) / (1000 * 60 * 60 * 24));
    if (daysActive > 30 && lead.estado !== 'convertido') {
      score = Math.max(0, score - 20);
    }
    
    return score;
  }

  actualizarScores() {
    const leads = db.getLeads();
    leads.forEach(lead => {
      const score = this.calcularScore(lead);
      db.updateLead(lead.id, { score });
    });
    
    return leads.map(l => ({ id: l.id, nombre: l.nombre, score: this.calcularScore(l) }));
  }

  getLeadsPrioritarios() {
    const leads = db.getLeads()
      .filter(l => l.estado !== 'convertido')
      .map(l => ({ ...l, score: this.calcularScore(l) }))
      .sort((a, b) => b.score - a.score);
    
    return leads.slice(0, 10);
  }

  detectarInteres(lead) {
    const score = this.calcularScore(lead);
    
    if (score >= 80) return { nivel: 'muy_alto', accion: 'contacto_directo_inmediato' };
    if (score >= 50) return { nivel: 'alto', accion: 'llamada_personal' };
    if (score >= 30) return { nivel: 'medio', accion: 'seguimiento_automatico' };
    if (score >= 15) return { nivel: 'bajo', accion: 'nutrir_mas' };
    
    return { nivel: 'muy_bajo', accion: 'reactivacion' };
  }

  sugerirCierre(lead) {
    const interes = this.detectarInteres(lead);
    const sugerencias = {
      contacto_directo_inmediato: {
        prioridad: 'urgente',
        accion: 'Contactar ahora - Alto interés detectado',
        proximo: 'Llamada directa o WhatsApp',
        script: `Hola ${lead.nombre}, te contactamos de OMNES HOLDING. Notamos que has interactuado mucho con nuestro contenido y queremos ofrecerte una consulta gratuita para hablar sobre ${lead.servicio}. Cuando te viene mejor?`
      },
      llamada_personal: {
        prioridad: 'alta',
        accion: 'Llamar en las próximas 24 horas',
        proximo: 'Llamada de seguimiento',
        script: `Hola ${lead.nombre}, soy de OMNES. Solo queria saber si tienes alguna duda sobre ${lead.servicio}. Podemos agendar una llamada rapida de 15 minutos.`
      },
      seguimiento_automatico: {
        prioridad: 'media',
        accion: 'Continuar secuencia automática',
        proximo: 'Email de seguimiento en 2 días',
        script: null
      },
      nutrir_mas: {
        prioridad: 'baja',
        accion: 'Mantener secuencia',
        proximo: 'Más contenido de valor',
        script: null
      },
      reactivacion: {
        prioridad: 'reactivar',
        accion: 'Reactivar o limpiar lista',
        proximo: 'Email de reactivacion o dar de baja',
        script: `Hola ${lead.nombre}, queremos saber si aun te interesa ${lead.servicio}. Responde si quieres seguir recibiendo informacion o si prefieres darte de baja.`
      }
    };
    
    return {
      ...sugerencias[interes.accion],
      score: this.calcularScore(lead),
      nivel: interes.nivel
    };
  }

  getEstadisticasConversion() {
    const leads = db.getLeads();
    const total = leads.length;
    const nuevos = leads.filter(l => l.estado === 'nuevo').length;
    const proceso = leads.filter(l => l.estado === 'en_proceso').length;
    const convertidos = leads.filter(l => l.estado === 'convertido').length;
    
    const scorePromedio = leads.reduce((sum, l) => sum + this.calcularScore(l), 0) / (total || 1);
    const emailsEnviados = leads.reduce((sum, l) => {
      const env = Object.values(l.secuencia || {}).filter(v => v).length;
      return sum + env;
    }, 0);
    
    return {
      total,
      nuevos,
      proceso,
      convertidos,
      tasaConversion: total ? ((convertidos / total) * 100).toFixed(1) : 0,
      scorePromedio: scorePromedio.toFixed(1),
      emailsEnviados
    };
  }

  convertirLead(id, metodo = 'manual') {
    const lead = db.updateLead(id, {
      estado: 'convertido',
      fechaConversion: new Date().toISOString(),
      metodoConversion: metodo
    });
    
    if (lead) {
      db.addHistorial(id, {
        tipo: 'conversion',
        metodo,
        fecha: new Date().toISOString()
      });
    }
    
    return lead;
  }

  reingresarLead(id) {
    return db.updateLead(id, {
      estado: 'nuevo',
      secuencia: { dia0: true, dia1: false, dia3: false, dia5: false, dia7: false }
    });
  }
}

module.exports = new ConversionEngine();