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
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>`;
  }

  svgFooter() {
    return `  <text x="50%" y="95%" text-anchor="middle" font-family="Arial" font-size="24" fill="#D4AF37" font-weight="bold">OMNES</text>
  <text x="50%" y="98%" text-anchor="middle" font-family="Arial" font-size="12" fill="#666666">HOLDING</text>
</svg>`;
  }

  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach(word => {
      if ((line + ' ' + word).length * 10 > maxWidth && line) {
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
    const startY = height / 2 - (lines.length * 40) / 2;
    const fontSize = texto.length > 80 ? 28 : texto.length > 50 ? 36 : 42;
    
    let svg = this.svgHeader(width, height);
    svg += `<g text-anchor="middle" font-family="Arial" fill="#ffffff">`;
    lines.forEach((line, i) => {
      svg += `<text x="${width/2}" y="${startY + i * 50}" font-size="${fontSize}" font-weight="bold">${line}</text>`;
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
    svg += `  <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#D4AF37">${titulo}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="30" fill="#ffffff">${subtitulo}</text>
  <rect x="35%" y="65%" width="30%" height="50" rx="25" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="20" fill="#D4AF37">${cta}</text>`;
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
    svg += `  <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="80" font-weight="bold" fill="#D4AF37">${titulos[tipo] || titulos.presentacion}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="35" fill="#888888">${subtitulos[tipo] || subtitulos.presentacion}</text>`;
    svg += this.svgFooter();
    
    const filename = `corporativo_${tipo}_${Date.now()}.svg`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, svg);
    
    return `/images/${filename}`;
  }

  generarImagenLead(lead) {
    const width = 1080;
    const height = 1080;
    
    let svg = this.svgHeader(width, height);
    svg += `  <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="70" font-weight="bold" fill="#D4AF37">¡Bienvenido!</text>
  <text x="50%" y="52%" text-anchor="middle" font-family="Arial" font-size="50" fill="#ffffff">${lead.nombre}</text>
  <text x="50%" y="62%" text-anchor="middle" font-family="Arial" font-size="30" fill="#888888">${lead.servicio || 'Nuevo Lead'}</text>
  <text x="50%" y="72%" text-anchor="middle" font-family="Arial" font-size="20" fill="#D4AF37">${new Date().toLocaleDateString()}</text>`;
    svg += this.svgFooter();
    
    const filename = `lead_${lead.id}.svg`;
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