// src/views/registrarVentaView.js
// Replicación exacta de RegistrarVenta.jsp (Prácticas 07, 08, 09 y 10) conectada a MySQL `mi_base`

import { 
  buscarClientePorDni, 
  buscarProductoPorId, 
  getNumeroSerie, 
  registrarVenta,
  getUsuarioActivo 
} from '../api/mysqlApi.js';

export function renderRegistrarVentaView(showToast) {
  const container = document.createElement('div');
  container.className = 'container-app';

  let clienteActual = null;
  let productoActual = null;
  let listaVentas = [];
  let itemCounter = 0;
  let totalPagar = 0.0;
  let numeroSerie = '00000001';

  // Obtener correlativo de serie en vivo desde MySQL
  getNumeroSerie().then(serie => {
    numeroSerie = serie;
    const nroInput = container.querySelector('input[name="NroSerie"]');
    if (nroInput) nroInput.value = serie;
  });

  function actualizarTotal() {
    totalPagar = listaVentas.reduce((sum, item) => sum + item.subtotal, 0);
  }

  function renderizar() {
    container.innerHTML = `
      <!-- Encabezado para impresión de comprobante (Práctica 10) -->
      <div class="print-voucher-header no-screen" style="display: none;">
        <h2 style="margin: 0; font-size: 1.4rem;">BOLETA DE VENTA ELECTRONICA</h2>
        <p style="margin: 2px 0; font-size: 0.9rem;"><strong>SISTEMA DE VENTAS WEB SOLER (MySQL mi_base)</strong></p>
        <p style="margin: 2px 0; font-size: 0.85rem;">RUC: 20548963211 - Av. Principal 1024, Lima</p>
        <p style="margin: 2px 0; font-size: 0.85rem;"><strong>Nro Serie:</strong> ${numeroSerie} | <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PE')}</p>
        <p style="margin: 2px 0; font-size: 0.85rem;"><strong>Cliente:</strong> ${clienteActual ? clienteActual.nom : 'CLIENTE VARIOS'} (DNI: ${clienteActual ? clienteActual.dni : '----------'})</p>
        <hr style="margin: 10px 0; border-top: 1px dashed #000;">
      </div>

      <div class="d-flex gap-3">
        <!-- Panel Izquierdo: Formularios de búsqueda y producto (parte01: oculta al imprimir) -->
        <div class="col-sm-5 parte01">
          <div class="card">
            <div class="card-header">
              <span>Registrar Venta / Nueva Venta</span>
              <span class="badge badge-success">MySQL Live</span>
            </div>
            <form id="form-registro-venta">
              <div class="card-body">
                <!-- Datos del Cliente -->
                <div class="form-group">
                  <label>Datos del Cliente</label>
                </div>
                <div class="form-group d-flex gap-2">
                  <div class="col-sm-6 d-flex gap-1">
                    <input 
                      type="text" 
                      id="codigocliente" 
                      name="codigocliente" 
                      value="${clienteActual ? clienteActual.dni : ''}" 
                      class="form-control" 
                      placeholder="DNI (ej: 1, 2, 3)"
                    >
                    <button type="button" id="btnBuscarCliente" name="accion" value="BuscarCliente" class="btn btn-outline-info">
                      Buscar
                    </button>
                  </div>
                  <div class="col-sm-6">
                    <input 
                      type="text" 
                      id="nombrescliente" 
                      name="nombrescliente" 
                      value="${clienteActual ? clienteActual.nom : ''}" 
                      placeholder="Datos Cliente" 
                      class="form-control" 
                      readonly
                    >
                  </div>
                </div>

                <div class="dropdown-divider" style="margin: 1.25rem 0;"></div>

                <!-- Datos del Producto (Práctica 7) -->
                <div class="form-group">
                  <label>Datos del Producto</label>
                </div>
                <div class="form-group d-flex gap-2">
                  <div class="col-sm-6 d-flex gap-1">
                    <input 
                      type="number" 
                      id="codigoproducto" 
                      name="codigoproducto" 
                      value="${productoActual ? productoActual.id : ''}" 
                      class="form-control" 
                      placeholder="Cod (ej: 1, 2)"
                    >
                    <button type="button" id="btnBuscarProducto" name="accion" value="BuscarProducto" class="btn btn-outline-info">
                      Buscar
                    </button>
                  </div>
                  <div class="col-sm-6">
                    <input 
                      type="text" 
                      id="nomproducto" 
                      name="nomproducto" 
                      value="${productoActual ? productoActual.nom : ''}" 
                      placeholder="Datos Producto" 
                      class="form-control" 
                      readonly
                    >
                  </div>
                </div>

                <div class="form-group d-flex gap-2">
                  <div class="col-sm-6">
                    <label style="font-size: 0.75rem;">Precio</label>
                    <input 
                      type="text" 
                      id="precio" 
                      name="precio" 
                      value="${productoActual ? Number(productoActual.pre).toFixed(2) : ''}" 
                      class="form-control" 
                      placeholder="S/. 0.00" 
                      readonly
                    >
                  </div>
                  <div class="col-sm-3">
                    <label style="font-size: 0.75rem;">Cantidad</label>
                    <input 
                      type="number" 
                      id="cant" 
                      name="cant" 
                      value="1" 
                      min="1" 
                      max="${productoActual ? productoActual.stock : 999}" 
                      class="form-control"
                    >
                  </div>
                  <div class="col-sm-3">
                    <label style="font-size: 0.75rem;">Stock Disp.</label>
                    <input 
                      type="text" 
                      id="stock" 
                      name="stock" 
                      value="${productoActual ? productoActual.stock : ''}" 
                      placeholder="Stock" 
                      class="form-control" 
                      readonly
                    >
                  </div>
                </div>

                <!-- Botón Agregar Producto (Paso 1 de la Práctica 08) -->
                <div class="form-group" style="margin-top: 1.25rem;">
                  <div class="col-sm">
                    <button type="submit" id="btnAgregar" name="accion" value="Agregar" class="btn btn-outline-primary w-100" style="padding: 0.65rem; font-weight: 600;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Agregar Producto
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>

        <!-- Panel Derecho: Tabla de detalle y generación de venta -->
        <div class="col-sm-7">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-between align-center" style="margin-bottom: 1rem;">
                <h5 style="margin: 0; color: var(--dark); font-weight: 600;">Detalle de la Venta</h5>
                <div class="d-flex align-center gap-2" style="width: auto;">
                  <label style="margin: 0; font-weight: 600; white-space: nowrap;">Nro de Serie:</label>
                  <input 
                    type="text" 
                    name="NroSerie" 
                    value="${numeroSerie}" 
                    class="form-control text-center" 
                    style="width: 140px; font-weight: 700; letter-spacing: 0.1em; background: #e0f2fe; color: #0369a1; border-color: #7dd3fc;" 
                    readonly
                  >
                </div>
              </div>

              <!-- Tabla de productos (Paso 6 de la Práctica 08 y Práctica 10) -->
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr class="text-center">
                      <th style="width: 50px;">Nro</th>
                      <th style="width: 70px;">Codigo</th>
                      <th>Descripcion</th>
                      <th style="width: 90px;">Precio</th>
                      <th style="width: 70px;">Cant.</th>
                      <th style="width: 100px;">SubTotal</th>
                      <th class="parte02" style="width: 120px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${listaVentas.length === 0 ? `
                      <tr>
                        <td colspan="7" class="text-center" style="padding: 2.5rem 1rem; color: var(--text-muted);">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; opacity: 0.6;">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                          <br>
                          No hay productos agregados en la venta actual.
                        </td>
                      </tr>
                    ` : listaVentas.map(item => `
                      <tr class="text-center">
                        <td><strong>${item.item}</strong></td>
                        <td><span class="badge" style="background: #f1f5f9; color: #475569;">#${item.idproducto}</span></td>
                        <td style="text-align: left;">${item.descripcion}</td>
                        <td>S/. ${Number(item.precio).toFixed(2)}</td>
                        <td><strong>${item.cantidad}</strong></td>
                        <td style="font-weight: 700; color: #0284c7;">S/. ${Number(item.subtotal).toFixed(2)}</td>
                        <td class="d-flex parte02 gap-1 justify-between align-center">
                          <button class="btn btn-warning btn-sm btn-editar-item" data-item="${item.item}" title="Editar cantidad">
                            Editar
                          </button>
                          <button class="btn btn-danger btn-sm btn-delete-item" data-item="${item.item}" title="Eliminar de lista">
                            Delete
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer con Botones y Total a Pagar (Paso 4 de Práctica 10) -->
            <div class="card-footer d-flex justify-between align-center">
              <div class="col-sm-6 d-flex gap-2">
                <a 
                  href="#" 
                  id="btnGenerarVenta" 
                  class="btn btn-success" 
                  style="font-weight: 600;"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Generar Venta
                </a>
                <button type="button" id="btnCancelarVenta" class="btn btn-danger">
                  Cancelar
                </button>
              </div>

              <div class="col-sm-4 ml-auto d-flex align-center gap-2">
                <span style="font-weight: 700; color: var(--dark); font-size: 0.95rem;">TOTAL:</span>
                <input 
                  type="text" 
                  name="txtTotal" 
                  id="txtTotal" 
                  value="S/. ${totalPagar.toFixed(2)}" 
                  class="form-control text-center" 
                  style="font-size: 1.15rem; font-weight: 800; color: #047857; background: #ecfdf5; border-color: #6ee7b7;" 
                  readonly
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    asignarEventos();
  }

  function asignarEventos() {
    // 1. Buscar Cliente en MySQL
    const btnBuscarCliente = container.querySelector('#btnBuscarCliente');
    btnBuscarCliente.addEventListener('click', async () => {
      const dni = container.querySelector('#codigocliente').value.trim();
      if (!dni) {
        showToast('Ingrese el DNI del cliente a buscar', 'warning');
        return;
      }
      btnBuscarCliente.disabled = true;
      try {
        const c = await buscarClientePorDni(dni);
        if (c) {
          clienteActual = c;
          showToast(`Cliente encontrado en MySQL: ${c.nom}`, 'success');
        } else {
          clienteActual = null;
          showToast(`Cliente con DNI "${dni}" no encontrado en MySQL`, 'danger');
        }
      } catch {
        showToast('Error al conectar con MySQL', 'danger');
      } finally {
        btnBuscarCliente.disabled = false;
        renderizar();
      }
    });

    container.querySelector('#codigocliente').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnBuscarCliente.click();
      }
    });

    // 2. Buscar Producto en MySQL
    const btnBuscarProducto = container.querySelector('#btnBuscarProducto');
    btnBuscarProducto.addEventListener('click', async () => {
      const cod = parseInt(container.querySelector('#codigoproducto').value.trim(), 10);
      if (isNaN(cod)) {
        showToast('Ingrese un código de producto válido', 'warning');
        return;
      }
      btnBuscarProducto.disabled = true;
      try {
        const p = await buscarProductoPorId(cod);
        if (p) {
          productoActual = p;
          showToast(`Producto en MySQL: ${p.nom} (Stock: ${p.stock})`, 'success');
        } else {
          productoActual = null;
          showToast(`Producto con código "${cod}" no encontrado en MySQL`, 'danger');
        }
      } catch {
        showToast('Error al consultar producto en MySQL', 'danger');
      } finally {
        btnBuscarProducto.disabled = false;
        renderizar();
      }
    });

    container.querySelector('#codigoproducto').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnBuscarProducto.click();
      }
    });

    // 3. Agregar Producto a la lista (Práctica 08)
    const formRegistro = container.querySelector('#form-registro-venta');
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!productoActual) {
        showToast('Primero busque y seleccione un producto', 'warning');
        return;
      }

      const cantInput = container.querySelector('#cant');
      const cant = parseInt(cantInput.value, 10);

      if (isNaN(cant) || cant <= 0) {
        showToast('La cantidad debe ser mayor a 0', 'warning');
        return;
      }

      const yaAgregado = listaVentas
        .filter(item => item.idproducto === productoActual.id)
        .reduce((sum, item) => sum + item.cantidad, 0);

      if (cant + yaAgregado > productoActual.stock) {
        showToast(`Stock insuficiente en almacén. Disponible: ${productoActual.stock - yaAgregado}`, 'danger');
        return;
      }

      const subtotal = productoActual.pre * cant;
      itemCounter++;

      listaVentas.push({
        item: itemCounter,
        idproducto: productoActual.id,
        descripcion: productoActual.nom,
        precio: productoActual.pre,
        cantidad: cant,
        subtotal: subtotal
      });

      actualizarTotal();
      showToast(`Agregado: ${productoActual.nom} x ${cant}`, 'success');
      renderizar();
    });

    // 4. Eliminar item
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemNum = parseInt(e.currentTarget.dataset.item, 10);
        listaVentas = listaVentas.filter(i => i.item !== itemNum);
        listaVentas.forEach((it, idx) => {
          it.item = idx + 1;
        });
        itemCounter = listaVentas.length;
        actualizarTotal();
        showToast('Producto eliminado del detalle', 'info');
        renderizar();
      });
    });

    // 5. Editar cantidad
    container.querySelectorAll('.btn-editar-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemNum = parseInt(e.currentTarget.dataset.item, 10);
        const item = listaVentas.find(i => i.item === itemNum);
        if (!item) return;

        const nuevaCantStr = prompt(`Ingrese nueva cantidad para "${item.descripcion}":`, String(item.cantidad));
        if (nuevaCantStr !== null) {
          const nuevaCant = parseInt(nuevaCantStr, 10);
          if (!isNaN(nuevaCant) && nuevaCant > 0) {
            item.cantidad = nuevaCant;
            item.subtotal = item.precio * nuevaCant;
            actualizarTotal();
            showToast('Cantidad actualizada', 'success');
            renderizar();
          }
        }
      });
    });

    // 6. Generar Venta con MySQL y Descuento de Stock (Práctica 09 y 10)
    const btnGenerarVenta = container.querySelector('#btnGenerarVenta');
    btnGenerarVenta.addEventListener('click', async (e) => {
      e.preventDefault();

      if (listaVentas.length === 0) {
        showToast('No hay productos en la lista para procesar la venta', 'warning');
        return;
      }

      if (!clienteActual) {
        const confirmar = confirm('No ha seleccionado un cliente. ¿Desea registrar con el Cliente ID: 17 de MySQL?');
        if (!confirmar) return;
        clienteActual = { id: 17, dni: '2', nom: 'Juan Guerrero Solis', dir: 'Los Alamos', es: '1' };
      }

      const usuarioActivo = getUsuarioActivo();

      btnGenerarVenta.classList.add('disabled');
      btnGenerarVenta.textContent = 'Guardando en MySQL...';

      try {
        await registrarVenta({
          idcliente: clienteActual.id,
          idempleado: usuarioActivo ? usuarioActivo.id : 1,
          numserie: numeroSerie,
          monto: totalPagar,
          detalles: listaVentas
        });

        showToast(`¡Venta ${numeroSerie} guardada en MySQL y stock actualizado!`, 'success');

        // Impresión (onclick="print()" de Práctica 10)
        setTimeout(() => {
          window.print();
        }, 300);

        // Actualizar serie y limpiar carrito
        listaVentas = [];
        itemCounter = 0;
        totalPagar = 0.0;
        productoActual = null;
        numeroSerie = await getNumeroSerie();
      } catch (err) {
        showToast(`Error al guardar en MySQL: ${err.message}`, 'danger');
      } finally {
        btnGenerarVenta.classList.remove('disabled');
        renderizar();
      }
    });

    // 7. Cancelar Venta
    const btnCancelarVenta = container.querySelector('#btnCancelarVenta');
    btnCancelarVenta.addEventListener('click', () => {
      if (listaVentas.length > 0) {
        const conf = confirm('¿Desea cancelar la venta en curso?');
        if (!conf) return;
      }
      listaVentas = [];
      itemCounter = 0;
      totalPagar = 0.0;
      productoActual = null;
      showToast('Venta cancelada', 'info');
      renderizar();
    });
  }

  renderizar();
  return container;
}
