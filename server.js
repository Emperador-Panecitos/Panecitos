// server.js
// Servidor backend en Node.js puro que conecta directamente a MySQL (mi_base)
// Replicando los Servlets y DAOs del proyecto NetBeans:
// Validar.java, Controlador.java, EmpleadoDAO, ClienteDAO, ProductoDAO, VentaDAO

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos MySQL mi_base (Replicando Config/Conexion.java)
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mi_base',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión a MySQL
async function verificarConexion() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL: Base de datos "mi_base" conectada.');
    conn.release();
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a MySQL local en el puerto 3306:', error.message);
  }
}

// -------------------------------------------------------------
// 1. AUTENTICACIÓN (Validar.java & EmpleadoDAO.validar)
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { user, pass } = req.body;
    // select * from empleado where User=? and Dni=?
    const [rows] = await pool.query(
      'SELECT IdEmpleado as id, Dni as dni, Nombres as nom, Telefono as tel, Estado as estado, User as user FROM empleado WHERE User = ? AND Dni = ?',
      [user, pass]
    );

    if (rows.length > 0) {
      res.json({ success: true, usuario: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. EMPLEADOS (EmpleadoDAO.java & Empleado.jsp)
// -------------------------------------------------------------
app.get('/api/empleados', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdEmpleado as id, Dni as dni, Nombres as nom, Telefono as tel, Estado as estado, User as user FROM empleado'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/empleados', async (req, res) => {
  try {
    const { dni, nom, tel, estado, user } = req.body;
    const [result] = await pool.query(
      'INSERT INTO empleado(Dni, Nombres, Telefono, Estado, User) VALUES (?, ?, ?, ?, ?)',
      [dni, nom, tel, estado, user]
    );
    res.json({ id: result.insertId, dni, nom, tel, estado, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dni, nom, tel, estado, user } = req.body;
    await pool.query(
      'UPDATE empleado SET Dni = ?, Nombres = ?, Telefono = ?, Estado = ?, User = ? WHERE IdEmpleado = ?',
      [dni, nom, tel, estado, user, id]
    );
    res.json({ id: Number(id), dni, nom, tel, estado, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM empleado WHERE IdEmpleado = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. CLIENTES (ClienteDAO.java & Clientes.jsp)
// -------------------------------------------------------------
app.get('/api/clientes', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdCliente as id, Dni as dni, Nombres as nom, Direccion as dir, Estado as es FROM cliente'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// buscar(dni)
app.get('/api/clientes/dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const [rows] = await pool.query(
      'SELECT IdCliente as id, Dni as dni, Nombres as nom, Direccion as dir, Estado as es FROM cliente WHERE Dni = ?',
      [dni]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { dni, nom, dir, es } = req.body;
    const [result] = await pool.query(
      'INSERT INTO cliente(Dni, Nombres, Direccion, Estado) VALUES (?, ?, ?, ?)',
      [dni, nom, dir, es]
    );
    res.json({ id: result.insertId, dni, nom, dir, es });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dni, nom, dir, es } = req.body;
    await pool.query(
      'UPDATE cliente SET Dni = ?, Nombres = ?, Direccion = ?, Estado = ? WHERE IdCliente = ?',
      [dni, nom, dir, es, id]
    );
    res.json({ id: Number(id), dni, nom, dir, es });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cliente WHERE IdCliente = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. PRODUCTOS (ProductoDAO.java & Producto.jsp & Práctica 10)
// -------------------------------------------------------------
app.get('/api/productos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdProducto as id, Nombres as nom, Precio as pre, Stock as stock, Estado as estado FROM producto'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// buscar(id) o listarId(id)
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT IdProducto as id, Nombres as nom, Precio as pre, Stock as stock, Estado as estado FROM producto WHERE IdProducto = ?',
      [id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nom, pre, stock, estado } = req.body;
    const [result] = await pool.query(
      'INSERT INTO producto(Nombres, Precio, Stock, Estado) VALUES (?, ?, ?, ?)',
      [nom, pre, stock, estado]
    );
    res.json({ id: result.insertId, nom, pre, stock, estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, pre, stock, estado } = req.body;
    await pool.query(
      'UPDATE producto SET Nombres = ?, Precio = ?, Stock = ?, Estado = ? WHERE IdProducto = ?',
      [nom, pre, stock, estado, id]
    );
    res.json({ id: Number(id), nom, pre, stock, estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM producto WHERE IdProducto = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// actualizarstock(int id, int stock) - Práctica 10
app.put('/api/productos/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    await pool.query('UPDATE producto SET Stock = ? WHERE IdProducto = ?', [stock, id]);
    res.json({ success: true, id: Number(id), stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. VENTAS (VentaDAO.java, GenerarSerie, GenerarVenta)
// -------------------------------------------------------------
// GenerarSerie()
app.get('/api/ventas/serie', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT max(NumeroSerie) as maxSerie FROM ventas');
    let maxSerie = rows[0]?.maxSerie;
    if (!maxSerie) {
      res.json({ numeroSerie: '00000001' });
    } else {
      const num = parseInt(maxSerie, 10);
      const siguiente = isNaN(num) ? 1 : num + 1;
      const formatted = String(siguiente).padStart(8, '0');
      res.json({ numeroSerie: formatted });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ventas', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.IdVentas as id,
        v.IdCliente as idcliente,
        v.IdEmpleado as idempleado,
        v.NumeroSerie as numserie,
        DATE_FORMAT(v.FechaVentas, '%Y-%m-%d') as fecha,
        v.Monto as monto,
        v.Estado as estado,
        c.Nombres as clienteNombre
      FROM ventas v
      LEFT JOIN cliente c ON v.IdCliente = c.IdCliente
      ORDER BY v.IdVentas DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// case "GenerarVenta" completo (Prácticas 09 y 10)
app.post('/api/ventas', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { idcliente, idempleado, numserie, monto, detalles } = req.body;
    const fecha = new Date().toISOString().split('T')[0];

    // 1. Descontar stock de productos (Paso 2 de Práctica 10):
    // for (int i = 0; i < lista.size(); i++) {
    //   pr = ProDAO.buscar(idproducto);
    //   int sac = pr.getStock() - cantidad;
    //   ProDAO.actualizarstock(idproducto, sac);
    // }
    for (const item of detalles) {
      await connection.query(
        'UPDATE producto SET Stock = Stock - ? WHERE IdProducto = ?',
        [item.cantidad, item.idproducto]
      );
    }

    // 2. Guardar Venta (Práctica 09: vdao.guardarVenta(v))
    const [ventaResult] = await connection.query(
      'INSERT INTO ventas(IdCliente, IdEmpleado, NumeroSerie, FechaVentas, Monto, Estado) VALUES (?, ?, ?, ?, ?, ?)',
      [idcliente, idempleado || 1, numserie, fecha, monto, '1']
    );
    const idVenta = ventaResult.insertId;

    // 3. Guardar Detalle de Ventas (Práctica 09: vdao.guardarDetalleventas(v))
    for (const item of detalles) {
      await connection.query(
        'INSERT INTO detalle_ventas(IdVentas, IdProducto, Cantidad, PrecioVenta) VALUES (?, ?, ?, ?)',
        [idVenta, item.idproducto, item.cantidad, item.precio]
      );
    }

    await connection.commit();
    res.json({
      success: true,
      idVenta,
      numserie,
      monto,
      mensaje: 'Venta registrada con éxito y stock actualizado en MySQL'
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor MySQL Backend JS ejecutándose en http://localhost:${PORT}`);
  await verificarConexion();
});
