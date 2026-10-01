// src/views/homeView.js
// Vista Dashboard de Inicio con métricas reales consultadas a MySQL `mi_base`

import { 
  getVentas, 
  getProductos, 
  getClientes, 
  getEmpleados, 
  getUsuarioActivo 
} from '../api/mysqlApi.js';

export function renderHomeView(navigateTo, showToast) {
  const container = document.createElement('div');
  container.className = 'container-app';

  const usuario = getUsuarioActivo();

  async function cargarDashboard() {
    try {
      const [ventas, productos, clientes, empleados] = await Promise.all([
        getVentas().catch(() => []),
        getProductos().catch(() => []),
        getClientes().catch(() => []),
        getEmpleados().catch(() => [])
      ]);

      const totalMontoVentas = ventas.reduce((acc, v) => acc + (parseFloat(v.monto) || 0), 0);
      const stockBajo = productos.filter(p => (parseInt(p.stock, 10) || 0) <= 5);

      container.innerHTML = `
        <!-- Saludo y Bienvenida -->
        <div class="card mb-4" style="background: linear-gradient(135deg, #17a2b8 0%, #0d8294 100%); color: #ffffff;">
          <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700;">
                ¡Bienvenido(a), ${usuario ? usuario.nom : 'Usuario'}!
              </h3>
              <p style="margin: 0.35rem 0 0 0; opacity: 0.9; font-size: 0.95rem;">
                Sistema de Ventas Web Soler replicado en JavaScript + Vite vanilla. Conectado a la base de datos MySQL <code>mi_base</code>.
              </p>
            </div>
            <div class="d-flex gap-2">
              <button id="btnIrNuevaVenta" class="btn btn-light" style="font-weight: 600; color: #0d8294;">
                + Nueva Venta
              </button>
            </div>
          </div>
        </div>

        <!-- Tarjetas de Métricas Estadísticas de MySQL -->
        <div class="d-flex gap-3 mb-4 flex-wrap">
          <div class="card col-sm" style="min-width: 200px;">
            <div class="card-body">
              <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700;">Total Facturado</span>
              <h2 style="margin: 0.5rem 0; color: #10b981; font-weight: 800;">
                S/. ${totalMontoVentas.toFixed(2)}
              </h2>
              <span class="badge badge-success">${ventas.length} ventas realizadas</span>
            </div>
          </div>

          <div class="card col-sm" style="min-width: 200px;">
            <div class="card-body">
              <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700;">Productos en Catálogo</span>
              <h2 style="margin: 0.5rem 0; color: #0284c7; font-weight: 800;">
                ${productos.length}
              </h2>
              <span class="badge ${stockBajo.length > 0 ? 'badge-warning' : 'badge-info'}">
                ${stockBajo.length > 0 ? `${stockBajo.length} con stock bajo (<= 5)` : 'Stock en niveles óptimos'}
              </span>
            </div>
          </div>

          <div class="card col-sm" style="min-width: 200px;">
            <div class="card-body">
              <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700;">Clientes Registrados</span>
              <h2 style="margin: 0.5rem 0; color: #6366f1; font-weight: 800;">
                ${clientes.length}
              </h2>
              <span class="badge badge-info">Base de Clientes</span>
            </div>
          </div>

          <div class="card col-sm" style="min-width: 200px;">
            <div class="card-body">
              <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700;">Personal / Empleados</span>
              <h2 style="margin: 0.5rem 0; color: #8b5cf6; font-weight: 800;">
                ${empleados.length}
              </h2>
              <span class="badge badge-success">${empleados.filter(e => e.estado === '1' || e.estado === 1).length} Activos</span>
            </div>
          </div>
        </div>

        <!-- Tabla de Últimas Ventas Registradas en MySQL -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Historial Reciente de Ventas en MySQL (<code>ventas</code>)</span>
            <button id="btnRecargarVentas" class="btn btn-sm btn-outline-info">Actualizar</button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>N° VENTA</th>
                    <th>N° SERIE</th>
                    <th>CLIENTE</th>
                    <th>FECHA</th>
                    <th>TOTAL</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  ${ventas.length === 0 ? `
                    <tr>
                      <td colspan="6" class="text-center" style="padding: 2.5rem; color: #64748b;">
                        Aún no hay ventas registradas en la base de datos MySQL. Haz clic en "Nueva Venta" para generar una.
                      </td>
                    </tr>
                  ` : ventas.slice().reverse().slice(0, 10).map(v => `
                    <tr>
                      <td><strong>#${v.id}</strong></td>
                      <td><code>${v.numeroSerie}</code></td>
                      <td>${v.clienteNombre || `Cliente ID #${v.idCliente}`}</td>
                      <td>${v.fechaVentas}</td>
                      <td><strong style="color: #10b981;">S/. ${parseFloat(v.monto).toFixed(2)}</strong></td>
                      <td>
                        <span class="badge ${v.estado === '1' ? 'badge-success' : 'badge-info'}">
                          ${v.estado === '1' ? 'Emitida' : v.estado}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Eventos
      const btnNueva = container.querySelector('#btnIrNuevaVenta');
      if (btnNueva) {
        btnNueva.addEventListener('click', () => navigateTo('RegistrarVenta'));
      }

      const btnRecargar = container.querySelector('#btnRecargarVentas');
      if (btnRecargar) {
        btnRecargar.addEventListener('click', () => {
          cargarDashboard();
          showToast('Datos del dashboard actualizados', 'info');
        });
      }

    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger">
          Error al cargar datos del dashboard desde MySQL: ${err.message}
        </div>
      `;
    }
  }

  cargarDashboard();

  return container;
}
