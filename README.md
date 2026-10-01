# Sistema de Ventas Web - JavaScript + Vite Vanilla

Este proyecto es una réplica exacta y funcional del **Sistema de Ventas Web** desarrollado originalmente en **NetBeans 8.2 (Java EE, Servlets, JSP, JSTL y JDBC)**, migrado a una arquitectura moderna con **Vanilla JavaScript (ES6+), Vite, Node.js/Express y Vercel Serverless**, con soporte tanto para MySQL local (XAMPP) como para la nube con **TiDB Cloud Serverless MySQL**.

- **Repositorio GitHub:** [https://github.com/Emperador-Panecitos/Panecitos](https://github.com/Emperador-Panecitos/Panecitos)
- **Base de Datos TiDB Cloud:** [https://tidbcloud.com/tidbs?orgId=1372813089209370473](https://tidbcloud.com/tidbs?orgId=1372813089209370473)
- **Despliegue Vercel:** [https://vercel.com/panecitos](https://vercel.com/panecitos)

---

## 📁 Correspondencia de Componentes (Java EE vs JavaScript)

| Módulo Java (NetBeans 8.2) | Componente JavaScript + Vite | Descripción / Función |
| :--- | :--- | :--- |
| `Conexion.java` | `server.js` (`mysql2/promise`) | Conexión con pool a MySQL local o TiDB Cloud Serverless con SSL. |
| `Validar.java` & `index.jsp` | `src/views/loginView.js` | Formulario de autenticación con toggle de contraseña y validación en tabla `empleado`. |
| `Principal.jsp` | `src/views/principalLayout.js` | Barra de navegación superior con `bg-info`, tabs activas y dropdown de usuario con botón "Salir". |
| `Producto.jsp` & `ProductoDAO.java` | `src/views/productoView.js` | CRUD completo (Agregar, Editar, Actualizar, Eliminar) en tabla `producto`. |
| `Clientes.jsp` & `ClienteDAO.java` | `src/views/clienteView.js` | CRUD completo en tabla `cliente` (`txtDni`, `txtNombres`, `txtDir`, `txtEstado`). |
| `Empleado.jsp` & `EmpleadoDAO.java` | `src/views/empleadoView.js` | CRUD completo en tabla `empleado` (`txtDni`, `txtNombres`, `txtTel`, `txtEstado`, `txtUser`). |
| `RegistrarVenta.jsp` & `Controlador.java` | `src/views/registrarVentaView.js` | **Prácticas 07, 08, 09 y 10:** Búsqueda de cliente por DNI, búsqueda de producto por ID, carrito dinámico, validación de stock, cálculo de subtotal/total, registro transaccional en `ventas` y `detalle_ventas`, descuento automático de stock, generación correlativa de número de serie y función para imprimir comprobante (`window.print()`). |
| Dashboard Inicial | `src/views/homeView.js` | Métricas en tiempo real consultadas de MySQL (Total Facturado, Cantidad de Productos, Clientes, Historial de Ventas). |

---

## 🗄️ Base de Datos MySQL (`mi_base.sql` / `db_ventas.sql`)

Los scripts SQL listos para importar están en:
- `base/mi_base.sql`
- `base/db_ventas.sql`

Tablas incluidas:
- `empleado` (`IdEmpleado`, `Dni`, `Nombres`, `Telefono`, `Estado`, `User`)
- `cliente` (`IdCliente`, `Dni`, `Nombres`, `Direccion`, `Estado`)
- `producto` (`IdProducto`, `Nombres`, `Precio`, `Stock`, `Estado`)
- `ventas` (`IdVentas`, `IdCliente`, `IdEmpleado`, `NumeroSerie`, `FechaVentas`, `Monto`, `Estado`)
- `detalle_ventas` (`IdDetalleVentas`, `IdVentas`, `IdProducto`, `Cantidad`, `PrecioVenta`)

---

## ☁️ Paso 1: Configurar la Base de Datos en TiDB Cloud

1. Ingresa a tu consola de TiDB Cloud: [https://tidbcloud.com/tidbs?orgId=1372813089209370473](https://tidbcloud.com/tidbs?orgId=1372813089209370473)
2. En tu clúster Serverless gratuito:
   - Ve a **Chat2Query** o **SQL Editor**.
   - Abre y copia el contenido de `base/mi_base.sql` (o `base/db_ventas.sql`).
   - Ejecuta el script para crear las tablas e insertar los datos iniciales.
3. Haz clic en **Connect** en TiDB Cloud:
   - Selecciona **Node.js** o **General**.
   - Anota los datos de conexión (Host, Port `4000`, User, Password y Database).

---

## 🚀 Paso 2: Subir a GitHub

El repositorio remoto configurado es:
`https://github.com/Emperador-Panecitos/Panecitos.git`

Para subir tus cambios:
1. Haz doble clic en `subir_a_github.bat` (o en la raíz `subir_a_github.bat`).
2. O ejecuta en la terminal:
   ```bash
   git push -u origin main
   ```
*(Si es tu primera vez subiendo cambios, autoriza el acceso en la ventana emergente de GitHub en tu navegador o inicia sesión con `gh auth login`).*

---

## 🌐 Paso 3: Desplegar en Vercel

1. Ingresa a tu panel de Vercel: [https://vercel.com/panecitos](https://vercel.com/panecitos)
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio de GitHub: **`Panecitos`**.
4. En la sección **Environment Variables**, agrega las variables de conexión a TiDB Cloud:
   - `TIDB_HOST`: Tu host de TiDB Cloud (ej. `gateway01.us-east-1.prod.aws.tidbcloud.com`)
   - `TIDB_PORT`: `4000`
   - `TIDB_USER`: Tu usuario de TiDB Cloud (ej. `xxxx.root`)
   - `TIDB_PASSWORD`: Tu contraseña de TiDB Cloud
   - `TIDB_DATABASE`: `mi_base` (o `test`)
   - `TIDB_ENABLE_SSL`: `true`
5. Haz clic en **"Deploy"**.
6. ¡Listo! Vercel construirá el frontend con Vite y desplegará las funciones Serverless en `/api` conectadas a tu base de datos TiDB Cloud.
