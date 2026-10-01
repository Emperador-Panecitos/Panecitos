// src/main.js
// Punto de entrada principal de la aplicación Vite Vanilla JavaScript
// Replicación de la arquitectura MVC de NetBeans 8.2 conectada a MySQL `mi_base`

import './style.css';
import { getUsuarioActivo } from './api/mysqlApi.js';
import { renderLoginView } from './views/loginView.js';
import { renderPrincipalLayout } from './views/principalLayout.js';
import { renderHomeView } from './views/homeView.js';
import { renderProductoView } from './views/productoView.js';
import { renderEmpleadoView } from './views/empleadoView.js';
import { renderClienteView } from './views/clienteView.js';
import { renderRegistrarVentaView } from './views/registrarVentaView.js';

// Contenedor principal de la aplicación
const app = document.querySelector('#app');

// Sistema de Notificaciones Toast
function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('#toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.cssText = `
    min-width: 280px;
    max-width: 420px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin: 0;
    pointer-events: auto;
    font-size: 0.9rem;
    animation: fadeIn 0.25s ease-out;
  `;
  toast.innerHTML = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Router de Navegación
function getCurrentRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  const validRoutes = ['Home', 'Producto', 'Empleado', 'Clientes', 'RegistrarVenta', 'Login'];
  if (validRoutes.includes(hash)) {
    return hash;
  }
  return 'Home';
}

function navigateTo(routeName) {
  window.location.hash = `#${routeName}`;
  render();
}

function render() {
  const usuario = getUsuarioActivo();
  const currentRoute = getCurrentRoute();

  app.innerHTML = '';

  // Si no hay usuario logueado, forzamos vista Login (index.jsp)
  if (!usuario) {
    if (window.location.hash !== '#Login') {
      window.location.hash = '#Login';
    }
    const loginElement = renderLoginView(
      () => navigateTo('Home'),
      showToast
    );
    app.appendChild(loginElement);
    return;
  }

  // Si hay usuario y la ruta es Login, redirigir a Home
  if (currentRoute === 'Login') {
    navigateTo('Home');
    return;
  }

  // Función constructora de la vista interna activa
  const viewRenderer = () => {
    switch (currentRoute) {
      case 'Producto':
        return renderProductoView(showToast);
      case 'Empleado':
        return renderEmpleadoView(showToast);
      case 'Clientes':
        return renderClienteView(showToast);
      case 'RegistrarVenta':
        return renderRegistrarVentaView(showToast);
      case 'Home':
      default:
        return renderHomeView(navigateTo, showToast);
    }
  };

  // Renderizar la vista dentro del Layout Principal (Principal.jsp)
  const layout = renderPrincipalLayout(currentRoute, navigateTo, viewRenderer);
  app.appendChild(layout);
}

// Escuchar cambios en la URL / hash
window.addEventListener('hashchange', render);

// Inicializar la aplicación
render();
