const areaTemplates = {
  RADIO: {
    bienvenida: {
      subject: 'Bienvenido a Radio Me Gusta - OMNES HOLDING',
      intro: 'Gracias por confiar en Radio Me Gusta. Tu interés marca el inicio de una transformación en tu comunicación.',
      pilares: ['Contenido Comunicacional', 'Posicionamiento de Marca', 'Estrategia de Medios']
    },
    contenido: {
      tema: 'Cómo destacar en el mundo de la radio',
      puntos: ['Creación de contenido diferenciador', 'Estrategias de posicionamiento', 'Construcción de audiencia']
    },
    beneficios: {
      sujeto: 'nuestros clientes de Radio Me Gusta',
      beneficios: ['Mayor alcance y fidelización', 'Contenido que conecta', 'Resultados medibles en audiencia']
    },
    caso: {
      titulo: 'Estación de radio que triplico audiencia',
      resultado: '340% de crecimiento en 12 meses'
    }
  },
  HUMANAR: {
    bienvenida: {
      subject: 'Bienvenido a Humanar - Tu bienestar primero',
      intro: 'Gracias por confiar en Humanar. Tu interés marca el inicio de tu transformación hacia el bienestar integral.',
      pilares: ['Bienestar', 'Terapias', 'Desarrollo Personal']
    },
    contenido: {
      tema: 'El poder del bienestar integral',
      puntos: ['Terapias personalizadas', 'Equilibrio cuerpo-mente', 'Programas de desarrollo']
    },
    beneficios: {
      sujeto: 'nuestros clientes de Humanar',
      beneficios: ['Vida más plena y saludable', 'Terapias efectivas', 'Transformación real']
    },
    caso: {
      titulo: 'Profesional que recupero su vitalidad',
      resultado: '95% de satisfacción en nuestros programas'
    }
  },
  DIGITAL: {
    bienvenida: {
      subject: 'Bienvenido a Digital Omnes - Marketing que transforma',
      intro: 'Gracias por confiar en Digital Omnes. Tu interés marca el inicio de tu crecimiento digital.',
      pilares: ['Marketing Digital', 'Crecimiento de Negocio', 'Transformación Online']
    },
    contenido: {
      tema: 'Marketing que genera resultados',
      puntos: ['Estrategias digitales efectivas', 'Crecimiento medible', 'Presencia online estratégica']
    },
    beneficios: {
      sujeto: 'nuestros clientes de Digital Omnes',
      beneficios: ['Aumentos de ventas documentados', 'Presencia digital sólida', 'ROI garantizado']
    },
    caso: {
      titulo: 'Empresa que multiplico sus ventas online',
      resultado: '500% de crecimiento en ventas digitales'
    }
  },
  CONSULTORIA: {
    bienvenida: {
      subject: 'Bienvenido a Omnes Consultoria - Estrategia empresarial',
      intro: 'Gracias por confiar en Omnes Consultoria. Tu interés marca el inicio de la transformación de tu empresa.',
      pilares: ['Estrategia', 'Optimización Empresarial', 'Crecimiento']
    },
    contenido: {
      tema: 'Estrategia que cambia juegos',
      puntos: ['Análisis profundo de tu negocio', 'Planificación estratégica', 'Optimización de procesos']
    },
    beneficios: {
      sujeto: 'nuestros clientes de Omnes Consultoria',
      beneficios: ['Eficiencia operativa demostrada', 'Crecimiento sostenible', 'Ventaja competitiva']
    },
    caso: {
      titulo: 'Empresa que optimizo operaciones y crecimiento',
      resultado: '200% de mejora en eficiencia operativa'
    }
  }
};

class ContentGenerator {
  constructor() {
    this.brandVoice = {
      tono: 'profesional, elegante, estratégico',
      identidad: 'tecnología + bienestar + negocio',
      valores: ['innovación', 'bienestar', 'prosperidad', 'excellence']
    };
  }

  getAreaData(area) {
    return areaTemplates[area] || areaTemplates.DIGITAL;
  }

  generarCopyAds(servicio, objetivo = 'captacion') {
    const templates = {
      tecnologia: {
        captacion: [
          "Transforma tu negocio con tecnología de vanguardia. OMNES HOLDING te lleva al futuro.",
          "La innovación que tu empresa necesita. Descubre cómo OMNES revoluciona tu industria.",
          "Tech + Estrategia = Resultados. Únete a la revolución digital con OMNES."
        ],
        retencion: [
          "Tu socio tecnológico estratégico. Continuemos construyendo el futuro juntos.",
          "Impulsamos tu crecimiento con soluciones tech personalizadas."
        ]
      },
      bienestar: {
        captacion: [
          "Descubre el poder del bienestar integral. Tu transformación comienza aquí.",
          "Invierte en ti mismo con programas de bienestar diseñados para líderes.",
          "Bienestar + Rendimiento = Éxito. La fórmula de OMNES para profesionales de alto impacto."
        ],
        retencion: [
          "Tu bienestar es nuestra prioridad. Continuemos este viaje de transformación.",
          "Cada día stronger, healthier, better. Juntos lograremos más."
        ]
      },
      negocio: {
        captacion: [
          "Escala tu negocio al siguiente nivel con estrategias probadas.",
          "El conocimiento que transforma empresas. OMNES te guía al éxito.",
          "De visión a realidad. Construye un imperio con OMNES HOLDING."
        ],
        retencion: [
          "Tu éxito es nuestro compromiso. Profundicemos en tu crecimiento.",
          "Juntos alcanzaremos metas que parecían imposibles."
        ]
      }
    };
    
    const pool = templates[servicio]?.[objetivo] || templates.tecnologia.captacion;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  generarCopyRedes(servicio, tipo = 'post') {
    const opens = {
      tecnologia: [
        "¿Sabías que la tecnología correcta puede multiplicar tus resultados?",
        "El futuro pertenece a quienes se adaptan. ¿Estás listo?",
        "La innovación no es un lujo, es una necesidad."
      ],
      bienestar: [
        "Tu cuerpo es tu mayor activo. ¿Lo estás cuidando?",
        "El éxito sin bienestar es una victoria vacía.",
        "Invertir en ti mismo es el mejor ROI."
      ],
      negocio: [
        "Los grandes logros requieren visión estratégica.",
        "El momento de actuar es ahora. ¿Tu negocio está listo?",
        "La diferencia entre ordinario y extraordinario está en las decisiones."
      ],
      digital: [
        "El marketing digital que tu negocio necesita.",
        "Haz crecer tu presencia online con estrategias probadas.",
        "Tu próximo cliente te está buscando online."
      ],
      radio: [
        "Tu voz merece ser escuchada en las mejores frecuencias.",
        "Conecta con tu audiencia a través de contenido de valor.",
        "Posiciona tu marca en el mundo de la radio."
      ],
      humanar: [
        "Tu bienestar es nuestra prioridad.",
        "Transforma tu vida con enfoque integral.",
        "El cuidado que mereces, cerca de ti."
      ],
      consultoria: [
        "Estrategia empresarial que genera resultados.",
        "Optimiza tu negocio con expertos.",
        "Lleva tu empresa al siguiente nivel."
      ]
    };

    const ctas = {
      link: "🔗 Link en bio para más información",
      dm: "💬 Envíanos un mensaje",
      call: "📞 Agenda tu consulta gratuita"
    };

    const servicioKey = servicio?.toLowerCase() || 'tecnologia';
    const openPool = opens[servicioKey] || opens.tecnologia;
    const open = openPool[Math.floor(Math.random() * openPool.length)];
    const cta = tipo === 'stories' ? ctas.dm : ctas.link;
    
    return { open, cta };
  }

  generarDescripcionServicio(servicio) {
    const descripciones = {
      tecnologia: `Soluciones tecnológicas integrales diseñadas para transformar tu negocio. Desde infraestructura hasta software personalizado, OMNES te acompaña en tu revolución digital.`,
      bienestar: `Programas de bienestar integral para profesionales de alto rendimiento. Física, mental y emocionalmente, te ayudamos a alcanzar tu máximo potencial.`,
      negocio: `Estrategias de negocio personalizadas para escalar tu empresa. Consulting, crecimiento y expansión con el respaldo de expertos en desarrollo empresarial.`
    };
    return descripciones[servicio] || descripciones.tecnologia;
  }

  generarEmailBienvenida(nombre, area = 'DIGITAL') {
    const areaData = this.getAreaData(area);
    const pillars = areaData.bienvenida.pilares.join('\n• ');
    
    return {
      subject: areaData.bienvenida.subject,
      body: `Estimado/a ${nombre},

${areaData.bienvenida.intro}

Nuestros pilares:
• ${pillars}

En los próximos días recibirás contenido exclusivo diseñado específicamente para ti.

Mientras tanto, no dudes en contactarnos si tienes alguna consulta.

Atentamente,
Equipo OMNES HOLDING

"El futuro pertenece a quienes se preparan hoy."`
    };
  }

  generarEmailContenido(nombre, area = 'DIGITAL') {
    const areaData = this.getAreaData(area);
    const points = areaData.contenido.puntos.join('\n• ');
    
    return {
      subject: `Contenido: ${areaData.contenido.tema}`,
      body: `Hola ${nombre},

Hoy quiero compartir contigo insights sobre ${areaData.contenido.tema.toLowerCase()}.

En OMNES HOLDING creemos que el conocimiento es poder. Por eso cada pieza de contenido que te enviamos está diseñada para darte una ventaja competitiva.

${this.generarCopyAds(area.toLowerCase(), 'captacion')}

Esta semana te invito a explorar más sobre cómo podemos ayudarte:

• ${points}

¿Hablamos?

Saludos cordiales,
Equipo OMNES HOLDING`
    };
  }

  generarEmailBeneficios(nombre, area = 'DIGITAL') {
    const areaData = this.getAreaData(area);
    const benefits = areaData.beneficios.beneficios.join('\n✓ ');
    
    return {
      subject: `Beneficios exclusivos - OMNES ${area}`,
      body: `Hola ${nombre},

Déjame contarte por qué cientos de clientes han elegido OMNES ${area}:

✓ ${benefits}
✓ Atención personalizada y estratégica
✓ Metodologías probadas con casos de éxito reales
✓ Compromiso real con tu crecimiento

Tu satisfacción es nuestro mayor logro. No vendemos servicios, construimos relaciones duraderas.

¿Te gustaría descubrir cómo podemos ayudarte específicamente?

Responde a este correo o agenda tu llamada de descubrimiento.

Equipo OMNES HOLDING
Tu socio estratégico`
    };
  }

  generarEmailCaso(nombre, area = 'DIGITAL') {
    const areaData = this.getAreaData(area);
    
    return {
      subject: `Caso de éxito: ${areaData.caso.titulo}`,
      body: `Hola ${nombre},

Hoy quiero compartirte una historia que ilustra el poder de trabajar con OMNES.

CASE STUDY: ${areaData.caso.titulo}
Situación: Empresa enfrentaba desafíos de crecimiento
Solución: Implementación de estrategia OMNES ${area}
Resultado: ${areaData.caso.resultado}

"OMNES no solo nos dio resultados, nos dio una nueva forma de crecer." - Cliente OMNES

Cada caso es único, pero los resultados son consistentes: transformación real y medible.

¿Listo para escribir tu propia historia de éxito?

Hablemos.

Equipo OMNES HOLDING`
    };
  }

  generarEmailOferta(nombre, area = 'DIGITAL') {
    const areaData = this.getAreaData(area);
    
    return {
      subject: `Oferta especial ${area}: Tu momento de actuar`,
      body: `Hola ${nombre},

Este es el momento.

Después de días de contenido, casos de éxito y beneficios, es momento de que tomes una decisión.

OFERTA ESPECIAL para nuevos clientes de OMNES ${area}:
• Consulta estratégica gratuita (valor $300)
• Plan de acción personalizado
• Análisis detallado de tu situación actual

Esta oferta tiene tiempo limitado. No dejamos pasar las oportunidades.

Próximo paso: Agenda tu llamada de descubrimiento

📞 Responder este correo
📅 Reservar tu espacio: [Link de agendamiento]

El futuro pertenece a quienes actúan.

Equipo OMNES HOLDING
"Transforma tu visión en realidad"`
    };
  }

  generarMensajeVenta(servicio) {
    const mensajes = {
      tecnologia: [
        "🚀 ¿Listo para transformar tu negocio con tecnología de punta?",
        "💻 La clave del éxito está en la innovación. ¿La estás aprovechando?",
        "🌐 Tu competencia ya está evolucionando. ¿Por qué esperar?"
      ],
      bienestar: [
        "✨ Tu bienestar es tu mayor inversión. ¿Ya lo estás cuidando?",
        "🧘 Transforma tu rendimiento con bienestar integral.",
        "💪 cuerpo sano, mente fuerte, éxito garantizado."
      ],
      negocio: [
        "📈 Escala tu negocio con estrategias probadas.",
        "🎯 El éxito tiene un precio: la acción. ¿La tomarás?",
        "🏆 Posicionamos empresas hacia la excelencia."
      ]
    };
    
    const pool = mensajes[servicio] || mensajes.negocio;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  generarhashtags(servicio) {
    const tags = {
      tecnologia: '#OMNES #TechInnovation #DigitalTransformation #Technology #BusinessGrowth #FutureTech',
      bienestar: '#OMNES #Wellness #HealthyLifestyle #SelfCare #MindBody #Wellbeing #PersonalGrowth',
      negocio: '#OMNES #Business #Success #Entrepreneurship #Growth #Strategy #Leadership #BusinessDevelopment'
    };
    return tags[servicio] || tags.negocio;
  }
}

module.exports = new ContentGenerator();