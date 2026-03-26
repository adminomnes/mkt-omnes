const fs = require('fs');
const path = require('path');

class ImageGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../public/images');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  svgHeader(width, height) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="50%" style="stop-color:#12121a"/>
      <stop offset="100%" style="stop-color:#0a0a0f"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#003366"/>
      <stop offset="100%" style="stop-color:#0066cc"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="0" width="100%" height="6" fill="url(#accent)"/>`;
  }

  svgFooter() {
    return `  <line x1="20%" y1="92%" x2="80%" y2="92%" stroke="#333" stroke-width="1"/>
  <text x="50%" y="96%" text-anchor="middle" font-family="Arial" font-size="18" fill="#0066cc" font-weight="bold" letter-spacing="3">OMNES HOLDING</text>
  <text x="50%" y="99%" text-anchor="middle" font-family="Arial" font-size="10" fill="#666666" letter-spacing="2">Innovación | Bienestar | Prosperidad</text>
</svg>`;
  }

  wrapText(text, maxWidth, fontSize = 40) {
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
      if ((line + ' ' + word).length > charsPerLine && line) {
        lines.push(line);
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  generarImagenRedes(texto, tipo = 'cuadrado') {
    const sizes = {
      cuadrado: { width: 1080, height: 1080 },
      vertical: { width: 1080, height: 1920 },
      horizontal: { width: 1920, height: 1080 }
    };
    
    const { width, height } = sizes[tipo];
    const lines = this.wrapText(texto, width - 200);
    const startY = height / 2 - (lines.length * 50) / 2;
    const fontSize = texto.length > 80 ? 32 : texto.length > 50 ? 38 : 44;
    
    let svg = this.svgHeader(width, height);
    svg += `<g text-anchor="middle" font-family="Arial" fill="#ffffff">`;
    lines.forEach((line, i) => {
      svg += `<text x="${width/2}" y="${startY + i * 55}" font-size="${fontSize}" font-weight="bold">${line}</text>`;
    });
    svg += `</g>`;
    svg += this.svgFooter();
    
    const filename = `redes_${tipo}_${Date.now()}.svg`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, svg);
    
    return `/images/${filename}`;
  }

  generarBannerPromocional(titulo, subtitulo, cta = 'Contáctanos') {
    const width = 1200;
    const height = 628;
    
    let svg = this.svgHeader(width, height);
    svg += `  <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="55" font-weight="bold" fill="#ffffff">${titulo}</text>
  <text x="50%" y="52%" text-anchor="middle" font-family="Arial" font-size="28" fill="#888888">${subtitulo}</text>
  <rect x="38%" y="65%" width="24%" height="45" rx="22" fill="url(#accent)"/>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="16" fill="#ffffff" font-weight="bold">${cta}</text>`;
    svg += this.svgFooter();
    
    const filename = `banner_${Date.now()}.svg`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, svg);
    
    return `/images/${filename}`;
  }

  generarContenidoCorporativo(tipo = 'presentacion') {
    const width = 1920;
    const height = 1080;
    
    const titulos = {
      presentacion: 'OMNES HOLDING',
      tecnologia: 'TECNOLOGÍA',
      bienestar: 'BIENESTAR',
      negocio: 'NEGOCIO'
    };
    
    const subtitulos = {
      presentacion: 'Innovación | Bienestar | Prosperidad',
      tecnologia: 'Transformando negocios con tecnología',
      bienestar: 'Tu desarrollo integral',
      negocio: 'Estrategias de crecimiento'
    };
    
    let svg = this.svgHeader(width, height);
    svg += `  <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="75" font-weight="bold" fill="#ffffff">${titulos[tipo] || titulos.presentacion}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="32" fill="#888888">${subtitulos[tipo] || subtitulos.presentacion}</text>`;
    svg += this.svgFooter();
    
    const filename = `corporativo_${tipo}_${Date.now()}.svg`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, svg);
    
    return `/images/${filename}`;
  }

  generarImagenLead(lead) {
    const width = 1080;
    const height = 1080;
    
    const areaNombres = {
      RADIO: 'Radio Me Gusta',
      HUMANAR: 'Humanar',
      DIGITAL: 'Digital Omnes',
      CONSULTORIA: 'Omnes Consultoria'
    };
    
    const areaNombre = areaNombres[lead.area] || lead.area || 'OMNES';
    const nombreMostrar = lead.nombre || 'Nuevo Lead';
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let svg = this.svgHeader(width, height);
    
    svg += `  <circle cx="${width/2}" cy="320" r="100" fill="none" stroke="url(#accent)" stroke-width="3"/>
  <text x="${width/2}" y="330}" text-anchor="middle" font-family="Arial" font-size="60" fill="#ffffff" font-weight="bold">${nombreMostrar.charAt(0).toUpperCase()}</text>
  
  <text x="${width/2}" y="480}" text-anchor="middle" font-family="Arial" font-size="50" font-weight="bold" fill="#ffffff">¡Bienvenido/a!</text>
  <text x="${width/2}" y="540}" text-anchor="middle" font-family="Arial" font-size="36" fill="#0066cc" font-weight="bold">${nombreMostrar}</text>
  
  <rect x="25%" y="590" width="50%" height="2" fill="#333"/>
  
  <text x="${width/2}" y="660}" text-anchor="middle" font-family="Arial" font-size="20" fill="#888888">Área de atención</text>
  <text x="${width/2}" y="700}" text-anchor="middle" font-family="Arial" font-size="28" fill="#0066cc" font-weight="bold">${areaNombre}</text>
  
  <text x="${width/2}" y="780}" text-anchor="middle" font-family="Arial" font-size="16" fill="#666666">${fecha}</text>`;
    
    svg += this.svgFooter();
    
    const filename = `lead_${lead.id || Date.now()}.svg`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, svg);
    
    return `/images/${filename}`;
  }

  listImages() {
    try {
      const files = fs.readdirSync(this.outputDir);
      return files.filter(f => f.endsWith('.svg') || f.endsWith('.png')).map(f => `/images/${f}`);
    } catch {
      return [];
    }
  }
}

module.exports = new ImageGenerator();