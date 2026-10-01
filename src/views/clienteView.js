// src/views/clienteView.js
// Replicación exacta de Clientes.jsp y ClienteDAO.java conectada a MySQL `mi_base`

import { 
  getClientes, 
  agregarCliente, 
  actualizarCliente, 
  eliminarCliente 
} from '../api/mysqlApi.js';

export function renderClienteView(showToast) {
  const container = document.createElement('div');
  container.className = 'container-app';

  let clienteSeleccionado = null;
  let clientes = [];

  async function cargarDatos() {
    try {
      clientes = await getClientes();
    } catch {
      showToast('Error al consultar clientes desde MySQL', 'danger');
    }
    renderizar();
  }

  function renderizar() {
    container.innerHTML = `
      <div class="d-flex gap-3">
        <!-- Formulario Clientes (col-sm-5) replicando Clientes.jsp -->
        <div class="card col-sm-5">
          <div class="card-header">
            <span>${clienteSeleccionado ? 'Editar Cliente' : 'Registro de Cliente'}</span>
            ${clienteSeleccionado ? '<span class="badge badge-warning">Modo Edición</span>' : ''}
          </div>
          <div class="card-body">
            <form id="form-cliente">
              <input type="hidden" id="cliId" value="${clienteSeleccionado ? clienteSeleccionado.id : ''}">

              <div class="form-group">
                <label>Dni</label>
                <input 
                  type="text" 
                  id="txtDni" 
                  name="txtDni" 
                  value="${clienteSeleccionado ? clienteSeleccionado.dni : ''}" 
                  class="form-control" 
                  placeholder="Ingrese DNI"
                  required
                >
              </div>

              <div class="form-group">
                <label>Nombres</label>
                <input 
                  type="text" 
                  id="txtNombres" 
                  name="txtNombres" 
                  value="${clienteSeleccionado ? clienteSeleccionado.nom : ''}" 
                  class="form-control" 
                  placeholder="Ingrese nombres completos"
                  required
                >
              </div>

              <div class="form-group">
                <label>Direccion</label>
                <input 
                  type="text" 
                  id="txtDir" 
                  name="txtDir" 
                  value="${clienteSeleccionado ? clienteSeleccionado.dir : ''}" 
                  class="form-control" 
                  placeholder="Ingrese dirección"
                  required
                >
              </div>

              <div class="form-group">
                <label>Estado</label>
                <input 
                  type="text" 
                  id="txtEstado" 
                  name="txtEstado" 
                  value="${clienteSeleccionado ? clienteSeleccionado.es : '1'}" 
                  class="form-control" 
                  placeholder="1 (Activo) / 0 (Inactivo)"
                  required
                >
              </div>

              <div class="d-flex gap-2" style="margin-top: 1.25rem;">
                ${clienteSeleccionado ? `
                  <button type="submit" id="btnActualizarCli" class="btn btn-success col-sm-6">Actualizar</button>
                  <button type="button" id="btnCancelarCli" class="btn btn-outline-secondary col-sm-6">Cancelar</button>
                ` : `
                  <button type="submit" id="btnAgregarCli" class="btn btn-info w-100">Agregar</button>
                `}
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla Clientes (col-sm-7) replicando Clientes.jsp -->
        <div class="col-sm-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Listado de Clientes (${clientes.length})</span>
              <button id="btnRecargarCli" class="btn btn-sm btn-outline-info">Refrescar</button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>DNI</th>
                      <th>NOMBRES</th>
                      <th>DIRECCION</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${clientes.length === 0 ? `
                      <tr>
                        <td colspan="6" class="text-center" style="padding: 2rem; color: #64748b;">
                          No hay clientes registrados en la base de datos MySQL.
                        </td>
                      </tr>
                    ` : clientes.map(cli => `
                      <tr class="${clienteSeleccionado && clienteSeleccionado.id === cli.id ? 'table-active' : ''}">
                        <td><strong>#${cli.id}</strong></td>
                        <td>${cli.dni}</td>
                        <td>${cli.nom}</td>
                        <td>${cli.dir}</td>
                        <td>
                          <span class="badge ${cli.es === '1' || cli.es === 1 ? 'badge-success' : 'badge-danger'}">
                            ${cli.es === '1' || cli.es === 1 ? 'Activo (1)' : `Inactivo (${cli.es})`}
                          </span>
                        </td>
                        <td>
                          <div class="d-flex gap-1">
                            <button 
                              class="btn btn-warning btn-sm btn-edit-cli" 
                              data-id="${cli.id}"
                            >
                              Editar
                            </button>
                            <button 
                              class="btn btn-danger btn-sm btn-del-cli" 
                              data-id="${cli.id}"
                              data-nom="${cli.nom}"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    asignarEventos();
  }

  function asignarEventos() {
    // Formulario submit
    const form = container.querySelector('#form-cliente');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dni = container.querySelector('#txtDni').value.trim();
        const nom = container.querySelector('#txtNombres').value.trim();
        const dir = container.querySelector('#txtDir').value.trim();
        const es = container.querySelector('#txtEstado').value.trim();

        if (!dni || !nom || !dir || !es) {
          showToast('Complete todos los campos obligatorios', 'warning');
          return;
        }

        try {
          if (clienteSeleccionado) {
            // Actualizar
            await actualizarCliente({
              id: clienteSeleccionado.id,
              dni,
              nom,
              dir,
              es
            });
            showToast(`Cliente "${nom}" actualizado con éxito en MySQL`, 'success');
            clienteSeleccionado = null;
          } else {
            // Agregar
            await agregarCliente({
              dni,
              nom,
              dir,
              es
            });
            showToast(`Cliente "${nom}" agregado con éxito a MySQL`, 'success');
          }
          await cargarDatos();
        } catch (err) {
          showToast(err.message || 'Error al guardar el cliente en MySQL', 'danger');
        }
      });
    }

    // Botón Cancelar edición
    const btnCancelar = container.querySelector('#btnCancelarCli');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        clienteSeleccionado = null;
        renderizar();
      });
    }

    // Botón Recargar
    const btnRecargar = container.querySelector('#btnRecargarCli');
    if (btnRecargar) {
      btnRecargar.addEventListener('click', () => {
        cargarDatos();
        showToast('Lista de clientes actualizada', 'info');
      });
    }

    // Botones Editar
    container.querySelectorAll('.btn-edit-cli').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const cli = clientes.find(c => c.id === id);
        if (cli) {
          clienteSeleccionado = { ...cli };
          renderizar();
          container.querySelector('#txtDni').focus();
        }
      });
    });

    // Botones Eliminar
    container.querySelectorAll('.btn-del-cli').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id, 10);
        const nom = btn.dataset.nom;
        if (confirm(`¿Está seguro de eliminar al cliente "${nom}" (ID #${id}) de MySQL?`)) {
          try {
            await eliminarCliente(id);
            showToast(`Cliente "${nom}" eliminado correctamente`, 'success');
            if (clienteSeleccionado && clienteSeleccionado.id === id) {
              clienteSeleccionado = null;
            }
            await cargarDatos();
          } catch (err) {
            showToast(err.message || 'Error al eliminar el cliente en MySQL', 'danger');
          }
        }
      });
    });
  }

  // Carga inicial de datos desde MySQL
  cargarDatos();

  return container;
}
