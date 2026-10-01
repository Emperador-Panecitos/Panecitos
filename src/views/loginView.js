// src/views/loginView.js
// Replicación exacta de index.jsp + Validar.java conectada a MySQL `mi_base`

import { login, setUsuarioActivo } from '../api/mysqlApi.js';

export function renderLoginView(onLoginSuccess) {
  const container = document.createElement('div');
  container.className = 'login-wrapper';

  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <img src="/img/logo.png" alt="Logo Soler" onerror="this.src='/img/logo.jpg'"/>
        <h3>Ingreso al Sistema</h3>
        <p>Sistema de Ventas Web (JavaScript + Vite + MySQL mi_base)</p>
      </div>

      <form id="form-login">
        <div class="form-group">
          <label>Usuario:</label>
          <input 
            type="text" 
            id="txtuser" 
            name="txtuser" 
            class="form-control" 
            placeholder="Ingrese su Usuario" 
            required 
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label>Contraseña (DNI):</label>
          <div class="input-password-wrapper">
            <input 
              type="password" 
              id="txtpass" 
              name="txtpass" 
              class="form-control" 
              placeholder="Ingrese su Contraseña" 
              required 
              autocomplete="current-password"
            />
            <button type="button" id="btn-show-pass" class="btn-toggle-pass" title="Mostrar/Ocultar Contraseña">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div id="login-error" style="display: none; color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; text-align: center; font-weight: 500;">
          Usuario o contraseña incorrectos.
        </div>

        <div class="form-group">
          <button type="submit" id="btn-submit-login" class="btn btn-primary btn-block" style="padding: 0.75rem; font-weight: 600;">
            Ingresar al Sistema
          </button>
        </div>
      </form>

      <div class="demo-credentials">
        <strong>Credenciales desde MySQL mi_base:</strong><br>
        <span class="demo-pill" data-user="emp01" data-pass="123">emp01 / 123</span>
        <span class="demo-pill" data-user="Jo46" data-pass="123">Jo46 / 123</span>
        <span class="demo-pill" data-user="Em22" data-pass="123">Em22 / 123</span>
      </div>
    </div>
  `;

  // Toggle ojito de contraseña (replicando ojito.js de NetBeans)
  const passInput = container.querySelector('#txtpass');
  const btnShowPass = container.querySelector('#btn-show-pass');
  btnShowPass.addEventListener('click', () => {
    if (passInput.type === 'password') {
      passInput.type = 'text';
      btnShowPass.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      passInput.type = 'password';
      btnShowPass.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  });

  // Selección rápida de credenciales
  container.querySelectorAll('.demo-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelector('#txtuser').value = pill.dataset.user;
      container.querySelector('#txtpass').value = pill.dataset.pass;
    });
  });

  // Submit login
  const form = container.querySelector('#form-login');
  const errorDiv = container.querySelector('#login-error');
  const submitBtn = container.querySelector('#btn-submit-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = container.querySelector('#txtuser').value.trim();
    const pass = container.querySelector('#txtpass').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando en MySQL...';

    try {
      const empleado = await login(user, pass);
      setUsuarioActivo(empleado);
      onLoginSuccess(empleado);
    } catch {
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 4000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ingresar al Sistema';
    }
  });

  return container;
}
