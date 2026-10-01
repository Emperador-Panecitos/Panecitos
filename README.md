# Sistema de Ventas Web - Replicación en JavaScript Puro + Vite

Este proyecto es una réplica exacta y funcional del **Sistema de Ventas Web** desarrollado originalmente en **NetBeans 8.2 (Java EE, Servlets, JSP, JSTL y JDBC)**, migrado a una arquitectura moderna con **Vanilla JavaScript (ES6+), Vite y Node.js/Express**, conectado directamente a la misma base de datos MySQL `mi_base` (XAMPP).

---

## 📁 Correspondencia de Componentes (Java vs JavaScript)

| Módulo Java (NetBeans 8.2) | Componente JavaScript + Vite | Descripción / Función |
| :--- | :--- | :--- |
| `Conexion.java` | `server.js` (`mysql2/promise`) | Conexión con pool a MySQL `mi_base` (localhost:3306, user `root`). |
| `Validar.java` & `index.jsp` | `src/views/loginView.js` | Formulario de autenticación con toggle de contraseña y validación en tabla `empleado`. |
| `Principal.jsp` | `src/views/principalLayout.js` | Barra de navegación superior con `bg-info`, tabs activas y dropdown de usuario con botón "Salir". |
| `Producto.jsp` & `ProductoDAO.java` | `src/views/productoView.js` | CRUD completo (Agregar, Editar, Actualizar, Eliminar) en tabla `producto`. |
| `Clientes.jsp` & `ClienteDAO.java` | `src/views/clienteView.js` | CRUD completo en tabla `cliente` (`txtDni`, `txtNombres`, `txtDir`, `txtEstado`). |
| `Empleado.jsp` & `EmpleadoDAO.java` | `src/views/empleadoView.js` | CRUD completo en tabla `empleado` (`txtDni`, `txtNombres`, `txtTel`, `txtEstado`, `txtUser`). |
| `RegistrarVenta.jsp` & `Controlador.java` | `src/views/registrarVentaView.js` | **Prácticas 07, 08, 09 y 10:** Búsqueda de cliente por DNI, búsqueda de producto por ID, carrito dinámico, validación de stock, cálculo de subtotal/total, registro transaccional en `ventas` y `detalle_ventas`, descuento automático de stock, generación correlativa de número de serie y función para imprimir comprobante (`window.print()`). |
| Dashboard Inicial | `src/views/homeView.js` | Métricas en tiempo real consultadas de MySQL (Total Facturado, Cantidad de Productos, Clientes, Historial de Ventas). |

---

## 🗄️ Base de Datos MySQL (`mi_base.sql`)

El script SQL original se encuentra en:
- `SistemaVentasWebSoler/base/mi_base.sql`
- `mi-sistema-ventas-vite-js/base/mi_base.sql`

Las tablas utilizadas son:
- `empleado` (`IdEmpleado`, `Dni`, `Nombres`, `Telefono`, `Estado`, `User`)
- `cliente` (`IdCliente`, `Dni`, `Nombres`, `Direccion`, `Estado`)
- `producto` (`IdProducto`, `Nombres`, `Precio`, `Stock`, `Estado`)
- `ventas` (`IdVentas`, `IdCliente`, `IdEmpleado`, `NumeroSerie`, `FechaVentas`, `Monto`, `Estado`)
- `detalle_ventas` (`IdDetalleVentas`, `IdVentas`, `IdProducto`, `Cantidad`, `PrecioVenta`)

---

## 🔑 Credenciales de Acceso Demo (Tabla `empleado`)

| Usuario | Password (DNI) | Nombre de Empleado |
| :--- | :--- | :--- |
| `emp01` | `123` | Empleado Demo 1 |
| `Jo46` | `123` | Jo46 |
| `Em22` | `123` | Em22 |

*(Nota: En la lógica de `Validar.java`, la contraseña se valida contra el campo `Dni` del usuario).*

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Un solo clic (Recomendado en Windows)
Haz doble clic en:
- `iniciar-js-vite.bat` (en la raíz de la carpeta), o
- `mi-sistema-ventas-vite-js/iniciar.bat`

### Opción 2: Desde la Terminal
1. **Asegúrate de que Apache y MySQL estén iniciados en el panel de control de XAMPP.**
2. En una terminal, inicia el servidor backend de base de datos MySQL:
   ```bash
   cd mi-sistema-ventas-vite-js
   npm run server
   ```
3. En otra terminal, inicia el servidor frontend Vite:
   ```bash
   cd mi-sistema-ventas-vite-js
   npm run dev
   ```
4. Abre tu navegador web en: `http://localhost:5173`
