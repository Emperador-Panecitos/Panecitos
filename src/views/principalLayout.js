// src/views/principalLayout.js
// Replicación del Navbar y Contenedor Principal de Principal.jsp

import { getUsuarioActivo, setUsuarioActivo } from '../api/mysqlApi.js';

export function renderPrincipalLayout(activeMenu, navigateTo, renderCurrentView) {
  const container = document.createElement('div');
  container.id = 'layout-principal';
  container.className = 'w-100';

  const usuario = getUsuarioActivo() || {
    nom: 'Empleado Demo',
    user: 'emp01',
    tel: '987654321'
  };

  container.innerHTML = `
    <!-- Barra de Navegación idéntica a Principal.jsp con clase bg-info -->
    <nav class="navbar navbar-expand-lg navbar-light bg-info">
      <div class="navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link ${activeMenu === 'Home' ? 'active-tab' : ''}" href="#Home" data-menu="Home">
              Home
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="btn btn-outline-light ${activeMenu === 'Producto' ? 'active' : ''}" 
              style="margin-left: 10px; border: none;" 
              href="#Producto" 
              data-menu="Producto"
            >
              Producto
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="btn btn-outline-light ${activeMenu === 'Empleado' ? 'active' : ''}" 
              style="margin-left: 10px; border: none;" 
              href="#Empleado" 
              data-menu="Empleado"
            >
              Empleado
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="btn btn-outline-light ${activeMenu === 'Clientes' ? 'active' : ''}" 
              style="margin-left: 10px; border: none;" 
              href="#Clientes" 
              data-menu="Clientes"
            >
              Clientes
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="btn btn-outline-light ${activeMenu === 'RegistrarVenta' ? 'active' : ''}" 
              style="margin-left: 10px; border: none;" 
              href="#RegistrarVenta" 
              data-menu="RegistrarVenta"
            >
              Nueva Venta
            </a>
          </li>
        </ul>
      </div>

      <!-- Menú desplegable de Usuario idéntico a Principal.jsp -->
      <div class="dropdown" style="position: relative;">
        <button 
          style="border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;" 
          class="btn btn-outline-light dropdown-toggle" 
          type="button" 
          id="dropdownMenuButton" 
          aria-haspopup="true" 
          aria-expanded="false"
        >
          <img src="/img/logo.png" alt="User" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: #fff;" />
          <span>${usuario.nom}</span>
          <span style="font-size: 0.75rem;">▼</span>
        </button>

        <div class="dropdown-menu text-center" id="userDropdownMenu" style="display: none;">
          <div class="dropdown-item" style="cursor: default;">
            <img src="/img/logo.png" height="60" width="60" style="border-radius: 50%; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
          </div>
          <div class="dropdown-item" style="font-weight: 700; color: #1e293b;">${usuario.nom}</div>
          <div class="dropdown-item" style="color: #64748b; font-size: 0.85rem;">Usuario: <strong>${usuario.user}</strong></div>
          <div class="dropdown-item" style="color: #64748b; font-size: 0.85rem;">Tel: ${usuario.tel || 'Sin teléfono'}</div>
          <div class="dropdown-divider"></div>
          <button id="btnCerrarSesion" class="dropdown-item" style="color: #dc3545; font-weight: 600; cursor: pointer;">
            Salir
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenedor del contenido principal (replicando área de iframe de Principal.jsp) -->
    <main id="main-content-view" class="p-3" style="min-height: calc(100vh - 70px);">
    </main>
  `;

  // Control del Dropdown de Usuario
  const btnDropdown = container.querySelector('#dropdownMenuButton');
  const dropdownMenu = container.querySelector('#userDropdownMenu');

  btnDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isVisible ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!btnDropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });

  // Botón Salir (Cerrar Sesión)
  const btnSalir = container.querySelector('#btnCerrarSesion');
  btnSalir.addEventListener('click', () => {
    setUsuarioActivo(null);
    navigateTo('Login');
  });

  // Eventos de los enlaces de la barra de navegación
  container.querySelectorAll('[data-menu]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = link.dataset.menu;
      navigateTo(menu);
    });
  });

  // Montar la vista activa en el contenedor
  const mainContent = container.querySelector('#main-content-view');
  mainContent.appendChild(renderCurrentView());

  return container;
}
