const API = '/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(API + endpoint, options);
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  if (id === 'dashboard') actualizarStats();
  if (id === 'leads') cargarLeads();
  if (id === 'config') cargarConfig();
}

async function actualizarStats() {
  const stats = await fetchAPI('/stats');
  if (stats) {
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-nuevos').textContent = stats.nuevos;
    document.getElementById('stat-proceso').textContent = stats.proceso;
    document.getElementById('stat-convertidos').textContent = stats.convertidos;
    document.getElementById('stat-tasa').textContent = stats.tasaConversion + '%';
    document.getElementById('stat-emails').textContent = stats.emailsEnviados;
  }
  
  const prioritarios = await fetchAPI('/leads-prioritarios');
  const list = document.getElementById('prioritarios-list');
  if (prioritarios && prioritarios.length > 0) {
    list.innerHTML = prioritarios.slice(0, 5).map(l => `
      <div class="prioritario-item" onclick="showLeadDetail('${l.id}')">
        <div class="prioritario-info">
          <h4>${l.nombre}</h4>
          <p>${l.email}</p>
        </div>
        <div class="prioritario-score">
          <div class="score-value">${l.score}</div>
          <div class="score-label">Score</div>
        </div>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<p style="color:#666">No hay leads disponibles</p>';
  }
}

async function cargarLeads() {
  const leads = await fetchAPI('/leads');
  const table = document.getElementById('leads-table');
  
  if (leads && leads.length > 0) {
    table.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Área</th>
            <th>Área Descripción</th>
            <th>Estado</th>
            <th>Automation</th>
            <th>Score</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(l => `
            <tr data-estado="${l.estado}" data-area="${l.area || ''}">
              <td>${l.nombre}</td>
              <td>${l.email}</td>
              <td><span class="area-badge area-${(l.area || 'digital').toLowerCase()}">${l.area || 'DIGITAL'}</span></td>
              <td>${l.areaDescripcion || l.servicio}</td>
              <td><span class="estado-badge estado-${l.estado}">${l.estado.replace('_', ' ')}</span></td>
              <td>${l.automatizacionActiva ? '<span class="automation-active">✓ Activa</span>' : '<span class="automation-inactive">✗ Inactiva</span>'}</td>
              <td>${l.score || 0}</td>
              <td>${new Date(l.fechaIngreso).toLocaleDateString()}</td>
              <td>
                <button class="btn-small" onclick="showLeadDetail('${l.id}')">Ver</button>
                ${l.estado !== 'convertido' ? `<button class="btn-small" onclick="convertirLead('${l.id}')">Convertir</button>` : ''}
                <button class="btn-small danger" onclick="eliminarLead('${l.id}')">×</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    table.innerHTML = '<p style="color:#666;text-align:center;padding:40px">No hay leads</p>';
  }
}

function filterLeads() {
  const search = document.getElementById('search-lead').value.toLowerCase();
  const estado = document.getElementById('filter-estado').value;
  const area = document.getElementById('filter-area').value;
  
  document.querySelectorAll('#leads-table tbody tr').forEach(row => {
    const nombre = row.cells[0].textContent.toLowerCase();
    const email = row.cells[1].textContent.toLowerCase();
    const areaCell = row.cells[2].textContent;
    const estadoRow = row.dataset.estado;
    
    const matchSearch = nombre.includes(search) || email.includes(search);
    const matchEstado = !estado || estadoRow === estado;
    const matchArea = !area || areaCell.includes(area);
    
    row.style.display = matchSearch && matchEstado && matchArea ? '' : 'none';
  });
}

async function showLeadDetail(id) {
  const lead = await fetchAPI('/leads/' + id);
  const sugerencia = await fetchAPI('/sugerir-cierre/' + id);
  
  document.getElementById('modal-body').innerHTML = `
    <h2 style="color:#D4AF37;margin-bottom:20px">${lead.nombre}</h2>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Teléfono:</strong> ${lead.telefono || 'No registrado'}</p>
    <p><strong>Área:</strong> <span class="area-badge area-${(lead.area || 'digital').toLowerCase()}">${lead.area || 'DIGITAL'}</span></p>
    <p><strong>Descripción:</strong> ${lead.areaDescripcion || lead.servicio}</p>
    <p><strong>Estado:</strong> <span class="estado-badge estado-${lead.estado}">${lead.estado}</span></p>
    <p><strong>Automatización:</strong> ${lead.automatizacionActiva ? '<span class="automation-active">✓ Activa</span>' : '<span class="automation-inactive">✗ Inactiva</span>'}</p>
    ${lead.secuenciaIniciada ? `<p><strong>Secuencia iniciada:</strong> ${new Date(lead.secuenciaInicio).toLocaleString()}</p>` : ''}
    <p><strong>Score:</strong> ${lead.score}</p>
    <p><strong>Fecha de ingreso:</strong> ${new Date(lead.fechaIngreso).toLocaleString()}</p>
    
    ${sugerencia ? `
      <div style="background:#0a0a0f;padding:20px;border-radius:8px;margin-top:20px;border-left:3px solid ${sugerencia.prioridad === 'urgente' ? '#f44336' : '#D4AF37'}">
        <h4 style="color:#D4AF37;margin-bottom:10px">Sugerencia de Cierre</h4>
        <p><strong>Prioridad:</strong> ${sugerencia.prioridad}</p>
        <p><strong>Acción:</strong> ${sugerencia.accion}</p>
        <p><strong>Próximo paso:</strong> ${sugerencia.proximo}</p>
        ${sugerencia.script ? `<p style="margin-top:15px;padding:15px;background:#12121a;border-radius:5px;font-family:monospace">${sugerencia.script}</p>` : ''}
      </div>
    ` : ''}
    
    <div style="margin-top:20px">
      <h4 style="color:#D4AF37;margin-bottom:10px">Historial de Envíos</h4>
      ${lead.historial && lead.historial.length > 0 ? lead.historial.map(h => `
        <p style="color:#666;font-size:13px;margin:5px 0">${new Date(h.fecha).toLocaleString()} - ${h.tipo} ${h.template ? '(' + h.template + ')' : ''} ${h.area ? '[' + h.area + ']' : ''}</p>
      `).join('') : '<p style="color:#666">Sin historial</p>'}
    </div>
    
    <div style="margin-top:20px">
      <h4 style="color:#D4AF37;margin-bottom:10px">Secuencia</h4>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span class="estado-badge ${lead.secuencia?.dia0 ? 'estado-convertido' : 'estado-nuevo'}">Día 0: Bienvenida</span>
        <span class="estado-badge ${lead.secuencia?.dia1 ? 'estado-convertido' : 'estado-nuevo'}">Día 1: Contenido</span>
        <span class="estado-badge ${lead.secuencia?.dia3 ? 'estado-convertido' : 'estado-nuevo'}">Día 3: Beneficios</span>
        <span class="estado-badge ${lead.secuencia?.dia5 ? 'estado-convertido' : 'estado-nuevo'}">Día 5: Caso</span>
        <span class="estado-badge ${lead.secuencia?.dia7 ? 'estado-convertido' : 'estado-nuevo'}">Día 7: Oferta</span>
      </div>
    </div>
    
    ${lead.estado !== 'convertido' ? `<button class="action-btn" style="margin-top:20px" onclick="convertirLead('${id}');closeModal()">✓ Convertir Lead</button>` : ''}
  `;
  
  document.getElementById('modal').style.display = 'block';
}

async function convertirLead(id) {
  if (confirm('¿Marcar este lead como convertido?')) {
    await fetchAPI('/leads/' + id + '/convertir', { method: 'POST' });
    cargarLeads();
    actualizarStats();
  }
}

async function eliminarLead(id) {
  if (confirm('¿Eliminar este lead?')) {
    await fetchAPI('/leads/' + id, { method: 'DELETE' });
    cargarLeads();
    actualizarStats();
  }
}

async function generarCopy() {
  const servicio = document.getElementById('content-servicio').value;
  const result = await fetchAPI('/generar-copy?servicio=' + servicio + '&tipo=post');
  
  if (result) {
    document.getElementById('copy-result').innerHTML = `
      <p><strong>Post:</strong></p>
      <p>${result.open}</p>
      <p class="cta-tag">${result.cta}</p>
    `;
  }
}

async function generarImagen() {
  const texto = document.getElementById('img-texto').value;
  const tipo = document.getElementById('img-tipo').value;
  
  if (!texto) {
    alert('Ingresa un texto para la imagen');
    return;
  }
  
  const result = await fetchAPI('/generar-imagen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto, tipo })
  });
  
  if (result) {
    document.getElementById('img-result').innerHTML = `
      <div class="imagen-item" style="margin-top:15px">
        <img src="${result.url}" alt="Imagen generada">
      </div>
    `;
    cargarImagenes();
  }
}

async function cargarImagenes() {
  const imagenes = await fetchAPI('/imagenes');
  const list = document.getElementById('imagenes-list');
  
  if (imagenes && imagenes.length > 0) {
    list.innerHTML = imagenes.map(img => `
      <div class="imagen-item">
        <img src="${img}" alt="Imagen">
      </div>
    `).join('');
  }
}

async function cargarConfig() {
  const config = await fetchAPI('/config');
  if (config) {
    document.getElementById('auto-enabled').checked = config.automations?.enabled;
    
    if (config.email?.smtp) {
      document.getElementById('smtp-host').value = config.email.smtp.host || '';
      document.getElementById('smtp-port').value = config.email.smtp.port || '';
      document.getElementById('smtp-user').value = config.email.smtp.user || '';
      document.getElementById('smtp-pass').value = config.email.smtp.pass || '';
    }
    
    document.getElementById('email-from').value = config.email?.from || '';
    
    const secuenciaList = document.getElementById('secuencia-list');
    const seq = config.automations?.secuencia || {};
    secuenciaList.innerHTML = Object.entries(seq).map(([key, val]) => `
      <div class="secuencia-item">
        <label>${key.toUpperCase()}: ${val.subject}</label>
        <input type="checkbox" ${val.enabled ? 'checked' : ''} onchange="toggleSecuencia('${key}', this.checked)">
      </div>
    `).join('');
  }
}

async function saveConfig() {
  const enabled = document.getElementById('auto-enabled').checked;
  const config = await fetchAPI('/config');
  config.automations.enabled = enabled;
  await fetchAPI('/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
}

async function saveEmailConfig() {
  const config = await fetchAPI('/config');
  config.email.smtp = {
    host: document.getElementById('smtp-host').value,
    port: document.getElementById('smtp-port').value,
    user: document.getElementById('smtp-user').value,
    pass: document.getElementById('smtp-pass').value
  };
  config.email.from = document.getElementById('email-from').value;
  
  await fetchAPI('/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  
  alert('Configuración guardada');
}

async function toggleSecuencia(key, enabled) {
  const config = await fetchAPI('/config');
  config.automations.secuencia[key].enabled = enabled;
  await fetchAPI('/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
}

async function testWebhook() {
  const nombre = document.getElementById('test-nombre').value;
  const email = document.getElementById('test-email').value;
  const telefono = document.getElementById('test-telefono').value;
  const area = document.getElementById('test-area').value;
  
  if (!nombre || !email) {
    alert('Ingresa nombre y email');
    return;
  }
  
  try {
    const res = await fetch(API + '/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, area })
    });
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('modal-body').innerHTML = `
        <h2 style="color:#00ff00;margin-bottom:20px">✓ Lead Capturado</h2>
        <p><strong>Nombre:</strong> ${data.lead.nombre}</p>
        <p><strong>Email:</strong> ${data.lead.email}</p>
        <p><strong>Área:</strong> ${data.lead.area}</p>
        <p style="margin-top:20px;color:#D4AF37">${data.secuencia}</p>
        <p style="margin-top:10px">Email de bienvenida enviado automáticamente</p>
      `;
    } else {
      document.getElementById('modal-body').innerHTML = `
        <h2 style="color:#ff0000;margin-bottom:20px">Error</h2>
        <p>${data.error}</p>
      `;
    }
  } catch (e) {
    document.getElementById('modal-body').innerHTML = `
      <h2 style="color:#ff0000;margin-bottom:20px">Error de conexión</h2>
      <p>No se pudo conectar con el servidor</p>
    `;
  }
  
  document.getElementById('modal').style.display = 'block';
}

async function triggerSecuencia() {
  const result = await fetchAPI('/trigger-secuencia', { method: 'POST' });
  if (result) {
    alert('Secuencia procesada: ' + result.processed + ' emails');
    actualizarStats();
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
  if (event.target.id === 'modal') closeModal();
}

actualizarStats();