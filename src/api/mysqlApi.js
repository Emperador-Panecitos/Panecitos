// src/api/mysqlApi.js
// Cliente JavaScript para consumir la base de datos MySQL `mi_base` a través de la API REST

const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

// 1. AUTENTICACIÓN (Validar.java)
export async function login(user, pass) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ user, pass })
  });
  return data.usuario;
}

// 2. EMPLEADOS (EmpleadoDAO.java & Empleado.jsp)
export async function getEmpleados() {
  return request('/empleados');
}

export async function agregarEmpleado(emp) {
  return request('/empleados', {
    method: 'POST',
    body: JSON.stringify(emp)
  });
}

export async function actualizarEmpleado(emp) {
  return request(`/empleados/${emp.id}`, {
    method: 'PUT',
    body: JSON.stringify(emp)
  });
}

export async function eliminarEmpleado(id) {
  return request(`/empleados/${id}`, {
    method: 'DELETE'
  });
}

// 3. CLIENTES (ClienteDAO.java & Clientes.jsp)
export async function getClientes() {
  return request('/clientes');
}

export async function buscarClientePorDni(dni) {
  try {
    return await request(`/clientes/dni/${encodeURIComponent(dni)}`);
  } catch {
    return null;
  }
}

export async function agregarCliente(cli) {
  return request('/clientes', {
    method: 'POST',
    body: JSON.stringify(cli)
  });
}

export async function actualizarCliente(cli) {
  return request(`/clientes/${cli.id}`, {
    method: 'PUT',
    body: JSON.stringify(cli)
  });
}

export async function eliminarCliente(id) {
  return request(`/clientes/${id}`, {
    method: 'DELETE'
  });
}

// 4. PRODUCTOS (ProductoDAO.java & Producto.jsp)
export async function getProductos() {
  return request('/productos');
}

export async function buscarProductoPorId(id) {
  try {
    return await request(`/productos/${id}`);
  } catch {
    return null;
  }
}

export async function agregarProducto(prod) {
  return request('/productos', {
    method: 'POST',
    body: JSON.stringify(prod)
  });
}

export async function actualizarProducto(prod) {
  return request(`/productos/${prod.id}`, {
    method: 'PUT',
    body: JSON.stringify(prod)
  });
}

export async function eliminarProducto(id) {
  return request(`/productos/${id}`, {
    method: 'DELETE'
  });
}

// 5. VENTAS (VentaDAO.java, GenerarSerie, GenerarVenta - Prácticas 07, 08, 09, 10)
export async function getNumeroSerie() {
  try {
    const data = await request('/ventas/serie');
    return data.numeroSerie;
  } catch {
    return '00000001';
  }
}

export async function getVentas() {
  return request('/ventas');
}

export async function registrarVenta(venta) {
  return request('/ventas', {
    method: 'POST',
    body: JSON.stringify(venta)
  });
}

// SESION LOCAL DE USUARIO
export function getUsuarioActivo() {
  const raw = localStorage.getItem('usuario_activo_js_mysql');
  return raw ? JSON.parse(raw) : null;
}

export function setUsuarioActivo(usuario) {
  if (usuario) {
    localStorage.setItem('usuario_activo_js_mysql', JSON.stringify(usuario));
  } else {
    localStorage.removeItem('usuario_activo_js_mysql');
  }
}
