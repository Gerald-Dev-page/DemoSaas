// src/pages/Productos.jsx
import { useState } from 'react';
import { Package, PlusCircle, LayoutGrid, DollarSign, TrendingUp } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_PRODUCTOS = [
  { id_producto: 'SKU-001', nombre: 'Producto A',   precio: 1200,  tipo: 'Categoría 1', activo: true  },
  { id_producto: 'SKU-002', nombre: 'Producto B',   precio: 3400,  tipo: 'Categoría 1', activo: true  },
  { id_producto: 'SKU-003', nombre: 'Producto C',   precio: 800,   tipo: 'Categoría 2', activo: true  },
  { id_producto: 'SKU-004', nombre: 'Producto D',   precio: 15000, tipo: 'Categoría 2', activo: false },
  { id_producto: 'SKU-005', nombre: 'Servicio A',   precio: 5000,  tipo: 'Servicio',    activo: true  },
  { id_producto: 'SKU-006', nombre: 'Servicio B',   precio: 9800,  tipo: 'Servicio',    activo: true  },
  { id_producto: 'SKU-007', nombre: 'Promo Pack 1', precio: 4200,  tipo: 'Promoción',   activo: true  },
];

const TIPO_CONFIG = {
  'Categoría 1': { color: '#2563EB', bg: 'rgba(37,99,235,0.12)'  },
  'Categoría 2': { color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  'Servicio':    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'Promoción':   { color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
};

const formatPrice = (n) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
// ──────────────────────────────────────────────────────────

export default function Productos() {
  const [productos, setProductos] = useState(MOCK_PRODUCTOS);
  const [formData, setFormData] = useState({ nombre: '', precio: '', tipo: 'Categoría 1' });
  const [showToast, setShowToast] = useState(false);

  const activos    = productos.filter(p => p.activo).length;
  const promedio   = Math.round(productos.reduce((a, p) => a + p.precio, 0) / productos.length);
  const categorias = [...new Set(productos.map(p => p.tipo))].length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevo = {
      id_producto: `SKU-${String(productos.length + 1).padStart(3, '0')}`,
      nombre: formData.nombre,
      precio: parseFloat(formData.precio),
      tipo: formData.tipo,
      activo: true,
    };
    setProductos([nuevo, ...productos]);
    setFormData({ nombre: '', precio: '', tipo: 'Categoría 1' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <header className="page-header">
        <div>
          <h2>Gestión de Catálogo</h2>
          <p>Administrá los productos y servicios disponibles en el sistema.</p>
        </div>
        <div className="header-badge">
          <Package size={14} />
          {activos} activos
        </div>
      </header>

      {/* ── Demo Banner ── */}
      <div className="demo-banner">
        <span>🔒</span>
        <span>Modo demo — los datos no se guardan en el sistema real.</span>
      </div>

      {/* ── Toast ── */}
      {showToast && (
        <div className="demo-toast">
          ✓ Producto agregado visualmente. En el sistema real se guardaría en la base de datos.
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <Package size={18} />
          </span>
          <div>
            <p className="stat-label">Total productos</p>
            <p className="stat-value">{productos.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
            <DollarSign size={18} />
          </span>
          <div>
            <p className="stat-label">Precio promedio</p>
            <p className="stat-value">{formatPrice(promedio)}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <LayoutGrid size={18} />
          </span>
          <div>
            <p className="stat-label">Categorías</p>
            <p className="stat-value">{categorias}</p>
          </div>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="form-card">
        <h3 className="form-title">
          <PlusCircle size={18} />
          Registrar Nuevo Producto
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              placeholder="Ej: Producto D / Servicio Premium"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio de Venta</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 1500"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="Categoría 1">Categoría 1</option>
                <option value="Categoría 2">Categoría 2</option>
                <option value="Servicio">Servicio</option>
                <option value="Promoción">Promoción</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" type="submit">
            <PlusCircle size={16} />
            Registrar Producto
          </button>
        </form>
      </div>

      {/* ── Tabla ── */}
      <div className="card table-card">
        <h3 className="table-title">Catálogo de Productos</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const cfg = TIPO_CONFIG[p.tipo] || TIPO_CONFIG['Categoría 1'];
                return (
                  <tr key={p.id_producto}>
                    <td><span className="id-badge">{p.id_producto}</span></td>
                    <td className="td-nombre">{p.nombre}</td>
                    <td>
                      <span className="tipo-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        {p.tipo}
                      </span>
                    </td>
                    <td className="td-precio">{formatPrice(p.precio)}</td>
                    <td>
                      <span className={`estado-badge ${p.activo ? 'activo' : 'inactivo'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}