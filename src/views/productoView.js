// src/views/productoView.js
// Replicación exacta de Producto.jsp y ProductoDAO.java conectada a MySQL `mi_base`

import { 
  getProductos, 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto 
} from '../api/mysqlApi.js';

export function renderProductoView(showToast) {
  const container = document.createElement('div');
  container.className = 'container-app';

  let productoSeleccionado = null;
  let productos = [];

  async function cargarDatos() {
    try {
      productos = await getProductos();
    } catch {
      showToast('Error al consultar productos desde MySQL', 'danger');
    }
    renderizar();
  }

  function renderizar() {
    container.innerHTML = `
      <div class="d-flex gap-3">
        <!-- Formulario Producto (col-sm-5) replicando Producto.jsp -->
        <div class="card col-sm-5">
          <div class="card-header">
            <span>${productoSeleccionado ? 'Editar Producto' : 'Registro de Producto'}</span>
            ${productoSeleccionado ? '<span class="badge badge-warning">Modo Edición</span>' : ''}
          </div>
          <div class="card-body">
            <form id="form-producto">
              <input type="hidden" id="prodId" value="${productoSeleccionado ? productoSeleccionado.id : ''}">

              <div class="form-group">
                <label>Nombre del Producto</label>
                <input 
                  type="text" 
                  id="txtNombres" 
                  name="txtNombres" 
                  value="${productoSeleccionado ? productoSeleccionado.nom : ''}" 
                  class="form-control" 
                  required
                >
              </div>

              <div class="form-group">
                <label>Precio</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id="txtPre" 
                  name="txtPre" 
                  value="${productoSeleccionado ? productoSeleccionado.pre : ''}" 
                  class="form-control" 
                  required
                >
              </div>

              <div class="form-group">
                <label>Stock</label>
                <input 
                  type="number" 
                  id="txtStock" 
                  name="txtStock" 
                  value="${productoSeleccionado ? productoSeleccionado.stock : ''}" 
                  class="form-control" 
                  required
                >
              </div>

              <div class="form-group">
                <label>Estado</label>
                <input 
                  type="text" 
                  id="txtEstado" 
                  name="txtEstado" 
                  value="${productoSeleccionado ? productoSeleccionado.estado : '1'}" 
                  class="form-control" 
                  required
                >
              </div>

              <div class="d-flex gap-2" style="margin-top: 1.25rem;">
                ${productoSeleccionado ? `
                  <button type="submit" id="btnActualizar" class="btn btn-success col-sm-6">Actualizar</button>
                  <button type="button" id="btnCancelarProd" class="btn btn-outline-secondary col-sm-6">Cancelar</button>
                ` : `
                  <button type="submit" id="btnAgregar" class="btn btn-info w-100">Agregar</button>
                `}
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla Productos (col-sm-7) replicando Producto.jsp -->
        <div class="col-sm-7">
          <div class="card">
            <div class="card-header">
              <span>Inventario de Productos en MySQL</span>
              <span class="badge badge-success">${productos.length} Productos</span>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr class="text-center">
                      <th style="width: 50px;">ID</th>
                      <th style="text-align: left;">NOMBRES</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productos.length === 0 ? `
                      <tr><td colspan="6" class="text-center" style="padding: 2rem;">Cargando o no hay productos en MySQL...</td></tr>
                    ` : productos.map(pr => `
                      <tr class="text-center">
                        <td><strong>${pr.id}</strong></td>
                        <td style="text-align: left;">${pr.nom}</td>
                        <td><strong>S/. ${Number(pr.pre).toFixed(2)}</strong></td>
                        <td>
                          <span class="badge ${pr.stock <= 5 ? 'badge-danger' : (pr.stock <= 20 ? 'badge-warning' : 'badge-success')}">
                            ${pr.stock}
                          </span>
                        </td>
                        <td>${pr.estado}</td>
                        <td>
                          <div class="d-flex gap-1 justify-center align-center">
                            <button class="btn btn-warning btn-sm btn-edit-prod" data-id="${pr.id}">Editar</button>
                            <button class="btn btn-danger btn-sm btn-del-prod" data-id="${pr.id}">Eliminar</button>
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
    const form = container.querySelector('#form-producto');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nom = container.querySelector('#txtNombres').value.trim();
      const pre = parseFloat(container.querySelector('#txtPre').value);
      const stock = parseInt(container.querySelector('#txtStock').value, 10);
      const estado = container.querySelector('#txtEstado').value.trim();

      try {
        if (productoSeleccionado) {
          await actualizarProducto({ id: productoSeleccionado.id, nom, pre, stock, estado });
          showToast(`Producto "${nom}" actualizado en MySQL`, 'success');
          productoSeleccionado = null;
        } else {
          await agregarProducto({ nom, pre, stock, estado });
          showToast(`Producto "${nom}" agregado a MySQL`, 'success');
        }
        await cargarDatos();
      } catch (err) {
        showToast(`Error al guardar en MySQL: ${err.message}`, 'danger');
      }
    });

    const btnCancelar = container.querySelector('#btnCancelarProd');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        productoSeleccionado = null;
        renderizar();
      });
    }

    container.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        productoSeleccionado = productos.find(p => p.id === id) || null;
        renderizar();
      });
    });

    container.querySelectorAll('.btn-del-prod').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        const target = productos.find(p => p.id === id);
        if (target && confirm(`¿Desea eliminar el producto "${target.nom}" de MySQL?`)) {
          try {
            await eliminarProducto(id);
            showToast('Producto eliminado de MySQL', 'info');
            if (productoSeleccionado && productoSeleccionado.id === id) {
              productoSeleccionado = null;
            }
            await cargarDatos();
          } catch (err) {
            showToast(`Error al eliminar: ${err.message}`, 'danger');
          }
        }
      });
    });
  }

  cargarDatos();
  return container;
}
