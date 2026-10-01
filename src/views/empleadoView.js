// src/views/empleadoView.js
// Replicación exacta de Empleado.jsp y EmpleadoDAO.java conectada a MySQL `mi_base`

import { 
  getEmpleados, 
  agregarEmpleado, 
  actualizarEmpleado, 
  eliminarEmpleado 
} from '../api/mysqlApi.js';

export function renderEmpleadoView(showToast) {
  const container = document.createElement('div');
  container.className = 'container-app';

  let empleadoSeleccionado = null;
  let empleados = [];

  async function cargarDatos() {
    try {
      empleados = await getEmpleados();
    } catch {
      showToast('Error al consultar empleados desde MySQL', 'danger');
    }
    renderizar();
  }

  function renderizar() {
    container.innerHTML = `
      <div class="d-flex gap-3">
        <!-- Formulario Empleado (col-sm-4) replicando Empleado.jsp -->
        <div class="card col-sm-4">
          <div class="card-header">
            <span>${empleadoSeleccionado ? 'Editar Empleado' : 'Registro de Empleado'}</span>
            ${empleadoSeleccionado ? '<span class="badge badge-warning">Modo Edición</span>' : ''}
          </div>
          <div class="card-body">
            <form id="form-empleado">
              <input type="hidden" id="empId" value="${empleadoSeleccionado ? empleadoSeleccionado.id : ''}">

              <div class="form-group">
                <label>DNI</label>
                <input 
                  type="text" 
                  id="txtDni" 
                  name="txtDni" 
                  value="${empleadoSeleccionado ? empleadoSeleccionado.dni : ''}" 
                  class="form-control" 
                  placeholder="DNI (Ej: 123)"
                  required
                >
              </div>

              <div class="form-group">
                <label>Nombres</label>
                <input 
                  type="text" 
                  id="txtNombres" 
                  name="txtNombres" 
                  value="${empleadoSeleccionado ? empleadoSeleccionado.nom : ''}" 
                  class="form-control" 
                  placeholder="Nombres completos"
                  required
                >
              </div>

              <div class="form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  id="txtTel" 
                  name="txtTel" 
                  value="${empleadoSeleccionado ? empleadoSeleccionado.tel : ''}" 
                  class="form-control" 
                  placeholder="Teléfono o Celular"
                  required
                >
              </div>

              <div class="form-group">
                <label>Estado</label>
                <input 
                  type="text" 
                  id="txtEstado" 
                  name="txtEstado" 
                  value="${empleadoSeleccionado ? empleadoSeleccionado.estado : '1'}" 
                  class="form-control" 
                  placeholder="1 (Activo) / 0 (Inactivo)"
                  required
                >
              </div>

              <div class="form-group">
                <label>Usuario</label>
                <input 
                  type="text" 
                  id="txtUser" 
                  name="txtUser" 
                  value="${empleadoSeleccionado ? empleadoSeleccionado.user : ''}" 
                  class="form-control" 
                  placeholder="Nombre de Usuario para Login"
                  required
                >
              </div>

              <div class="d-flex gap-2" style="margin-top: 1.25rem;">
                ${empleadoSeleccionado ? `
                  <button type="submit" id="btnActualizarEmp" class="btn btn-success col-sm-6">Actualizar</button>
                  <button type="button" id="btnCancelarEmp" class="btn btn-outline-secondary col-sm-6">Cancelar</button>
                ` : `
                  <button type="submit" id="btnAgregarEmp" class="btn btn-info w-100">Agregar</button>
                `}
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla Empleados (col-sm-8) replicando Empleado.jsp -->
        <div class="col-sm-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Listado de Empleados (${empleados.length})</span>
              <button id="btnRecargarEmp" class="btn btn-sm btn-outline-info">Refrescar</button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>DNI</th>
                      <th>NOMBRES</th>
                      <th>TELEFONO</th>
                      <th>ESTADO</th>
                      <th>USUARIO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${empleados.length === 0 ? `
                      <tr>
                        <td colspan="7" class="text-center" style="padding: 2rem; color: #64748b;">
                          No hay empleados registrados en la base de datos MySQL.
                        </td>
                      </tr>
                    ` : empleados.map(em => `
                      <tr class="${empleadoSeleccionado && empleadoSeleccionado.id === em.id ? 'table-active' : ''}">
                        <td><strong>#${em.id}</strong></td>
                        <td>${em.dni}</td>
                        <td>${em.nom}</td>
                        <td>${em.tel}</td>
                        <td>
                          <span class="badge ${em.estado === '1' || em.estado === 1 ? 'badge-success' : 'badge-danger'}">
                            ${em.estado === '1' || em.estado === 1 ? 'Activo (1)' : `Inactivo (${em.estado})`}
                          </span>
                        </td>
                        <td><code>${em.user}</code></td>
                        <td>
                          <div class="d-flex gap-1">
                            <button 
                              class="btn btn-warning btn-sm btn-edit-emp" 
                              data-id="${em.id}"
                            >
                              Editar
                            </button>
                            <button 
                              class="btn btn-danger btn-sm btn-del-emp" 
                              data-id="${em.id}"
                              data-nom="${em.nom}"
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
    const form = container.querySelector('#form-empleado');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dni = container.querySelector('#txtDni').value.trim();
        const nom = container.querySelector('#txtNombres').value.trim();
        const tel = container.querySelector('#txtTel').value.trim();
        const estado = container.querySelector('#txtEstado').value.trim();
        const user = container.querySelector('#txtUser').value.trim();

        if (!dni || !nom || !tel || !estado || !user) {
          showToast('Complete todos los campos del empleado', 'warning');
          return;
        }

        try {
          if (empleadoSeleccionado) {
            // Actualizar
            await actualizarEmpleado({
              id: empleadoSeleccionado.id,
              dni,
              nom,
              tel,
              estado,
              user
            });
            showToast(`Empleado "${nom}" actualizado con éxito en MySQL`, 'success');
            empleadoSeleccionado = null;
          } else {
            // Agregar
            await agregarEmpleado({
              dni,
              nom,
              tel,
              estado,
              user
            });
            showToast(`Empleado "${nom}" agregado con éxito a MySQL`, 'success');
          }
          await cargarDatos();
        } catch (err) {
          showToast(err.message || 'Error al guardar el empleado en MySQL', 'danger');
        }
      });
    }

    // Botón Cancelar edición
    const btnCancelar = container.querySelector('#btnCancelarEmp');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        empleadoSeleccionado = null;
        renderizar();
      });
    }

    // Botón Recargar
    const btnRecargar = container.querySelector('#btnRecargarEmp');
    if (btnRecargar) {
      btnRecargar.addEventListener('click', () => {
        cargarDatos();
        showToast('Lista de empleados actualizada', 'info');
      });
    }

    // Botones Editar
    container.querySelectorAll('.btn-edit-emp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const em = empleados.find(e => e.id === id);
        if (em) {
          empleadoSeleccionado = { ...em };
          renderizar();
          container.querySelector('#txtDni').focus();
        }
      });
    });

    // Botones Eliminar
    container.querySelectorAll('.btn-del-emp').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id, 10);
        const nom = btn.dataset.nom;
        if (confirm(`¿Está seguro de eliminar al empleado "${nom}" (ID #${id}) de MySQL?`)) {
          try {
            await eliminarEmpleado(id);
            showToast(`Empleado "${nom}" eliminado correctamente`, 'success');
            if (empleadoSeleccionado && empleadoSeleccionado.id === id) {
              empleadoSeleccionado = null;
            }
            await cargarDatos();
          } catch (err) {
            showToast(err.message || 'Error al eliminar el empleado en MySQL', 'danger');
          }
        }
      });
    });
  }

  // Carga inicial
  cargarDatos();

  return container;
}
