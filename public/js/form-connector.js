(function() {
  const OMNES_API_URL = window.location.origin;
  
  class OmnesFormConnector {
    constructor(options = {}) {
      this.apiUrl = options.apiUrl || OMNES_API_URL;
      this.formId = options.formId || 'omnes-form';
      this.showSuccess = options.showSuccess !== false;
      this.showError = options.showError !== false;
      this.redirectUrl = options.redirectUrl || null;
      this.autoArea = options.autoArea || null;
      this.onSuccess = options.onSuccess || null;
      this.onError = options.onError || null;
    }
    
    init() {
      const form = document.getElementById(this.formId);
      if (!form) {
        console.error(`[OMNES] Form with id "${this.formId}" not found`);
        return;
      }
      
      form.addEventListener('submit', (e) => this.handleSubmit(e));
      console.log(`[OMNES] Form connector initialized for #${this.formId}`);
    }
    
    async handleSubmit(e) {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      
      const data = {
        nombre: formData.get('nombre') || formData.get('name') || formData.get('fullname'),
        email: formData.get('email'),
        telefono: formData.get('telefono') || formData.get('phone') || formData.get('tel'),
        area: formData.get('area') || this.autoArea || this.detectAreaFromPage()
      };
      
      if (!data.nombre || !data.email) {
        this.showErrorMessage('Por favor completa nombre y email');
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }
      
      try {
        const response = await fetch(`${this.apiUrl}/api/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          this.showSuccessMessage(result.message || '¡Gracias! Te contactaremos pronto.');
          form.reset();
          
          if (this.onSuccess) this.onSuccess(result);
          
          if (this.redirectUrl) {
            setTimeout(() => window.location.href = this.redirectUrl, 2000);
          }
        } else {
          throw new Error(result.error || 'Error al enviar');
        }
      } catch (error) {
        this.showErrorMessage(error.message);
        if (this.onError) this.onError(error);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar';
        }
      }
    }
    
    detectAreaFromPage() {
      const pageText = document.body.innerText.toLowerCase();
      
      if (pageText.includes('radio') || pageText.includes('comunicaci')) return 'radio';
      if (pageText.includes('humanar') || pageText.includes('bienestar') || pageText.includes('terapia')) return 'humanar';
      if (pageText.includes('digital') || pageText.includes('marketing') || pageText.includes('redes')) return 'digital';
      if (pageText.includes('consultoria') || pageText.includes('estrategia') || pageText.includes('negocio')) return 'consultoria';
      
      return 'digital';
    }
    
    showSuccessMessage(msg) {
      if (!this.showSuccess) return;
      
      const existing = document.querySelector('.omnes-message.success');
      if (existing) existing.remove();
      
      const msgEl = document.createElement('div');
      msgEl.className = 'omnes-message success';
      msgEl.textContent = msg;
      msgEl.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #10b981; color: white;
        padding: 15px 25px; border-radius: 8px;
        z-index: 10000; font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(msgEl);
      setTimeout(() => msgEl.remove(), 5000);
    }
    
    showErrorMessage(msg) {
      if (!this.showError) return;
      
      const existing = document.querySelector('.omnes-message.error');
      if (existing) existing.remove();
      
      const msgEl = document.createElement('div');
      msgEl.className = 'omnes-message error';
      msgEl.textContent = msg;
      msgEl.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #ef4444; color: white;
        padding: 15px 25px; border-radius: 8px;
        z-index: 10000; font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(msgEl);
      setTimeout(() => msgEl.remove(), 5000);
    }
  }
  
  window.OmnesFormConnector = OmnesFormConnector;
  
  document.addEventListener('DOMContentLoaded', () => {
    if (window.omnesAutoInit !== false) {
      const connector = new OmnesFormConnector();
      connector.init();
    }
  });
})();
